export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Public endpoint — returns all users with recent presence
export async function GET() {
  const since = new Date(Date.now() - 2 * 60 * 60 * 1000) // active in last 2h

  const presences = await prisma.presence.findMany({
    where: { updatedAt: { gte: since } },
    include: {
      user: { select: { id: true, username: true, avatarEmoji: true } }
    },
    orderBy: { updatedAt: 'desc' },
    take: 30,
  })

  const users = presences.map((p: {
  user: { id: string; username: string; avatarEmoji: string }
  state: string
  worldId: string | null
}) => ({
  id: p.user.id,
  username: p.user.username,
  avatarEmoji: p.user.avatarEmoji,
  presence: { state: p.state, worldId: p.worldId },
}))

  return NextResponse.json({ users })
}
