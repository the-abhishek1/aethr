export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSession, getUserById } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ user: null })

  const user = await getUserById(session.id)
  if (!user) return NextResponse.json({ user: null })

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      avatarEmoji: user.avatarEmoji,
      bio: user.bio,
      joinedAt: user.joinedAt,
      personas: user.personas,
      reputation: user.reputation,
      presence: user.presence,
    }
  })
}
