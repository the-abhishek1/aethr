export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { registerUser, setSessionCookie } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'
import { sendEmail, welcomeEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  const limit = rateLimit(`signup:${ip}`, { max: 5, window: 3600 })
  if (!limit.allowed) return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })

  try {
    const { email, username, password } = await req.json()

    if (!email || !username || !password)
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    if (password.length < 8)
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    if (username.length < 3)
      return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 })
    if (!/^[a-z0-9_]+$/i.test(username))
      return NextResponse.json({ error: 'Username can only contain letters, numbers, underscores' }, { status: 400 })

    const user = await registerUser(email, username, password)

    await setSessionCookie({
      id: user.id,
      email: user.email,
      username: user.username,
      avatarEmoji: user.avatarEmoji,
    })

    // Send welcome email (non-blocking)
    sendEmail({
      to: email,
      subject: 'Welcome to Aethr — The Fifth Element, Inhabited',
      html: welcomeEmail(username),
    }).catch(console.error)

    return NextResponse.json({
      user: { id: user.id, email: user.email, username: user.username, avatarEmoji: user.avatarEmoji }
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
