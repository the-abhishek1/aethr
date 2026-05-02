export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { registerUser, setSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, username, password } = await req.json()

    if (!email || !username || !password) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }
    if (username.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 })
    }

    const user = await registerUser(email, username, password)

    await setSessionCookie({
      id: user.id,
      email: user.email,
      username: user.username,
      avatarEmoji: user.avatarEmoji,
    })

    return NextResponse.json({
      user: { id: user.id, email: user.email, username: user.username, avatarEmoji: user.avatarEmoji }
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
