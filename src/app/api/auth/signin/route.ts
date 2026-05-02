export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { signInUser, setSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const user = await signInUser(email, password)

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
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
