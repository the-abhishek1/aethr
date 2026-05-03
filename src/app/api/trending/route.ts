export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000) // last 48h

  const [signals, debates, discoveries, factions] = await Promise.all([
    // Signals with most reactions + replies
    prisma.signal.findMany({
      where: { createdAt: { gte: since }, parentId: null },
      include: {
        author: { select: { id: true, username: true, avatarEmoji: true } },
        _count: { select: { replies: true, reactions: true } },
        reactions: { select: { emoji: true, userId: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),

    // Most active debates
    prisma.debate.findMany({
      where: { createdAt: { gte: since } },
      include: {
        creator: { select: { username: true, avatarEmoji: true } },
        _count: { select: { arguments: true, votes: true } },
        votes: { select: { side: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),

    // Most rippled discoveries
    prisma.discovery.findMany({
      where: { createdAt: { gte: since } },
      include: { author: { select: { username: true, avatarEmoji: true } } },
      orderBy: { ripples: 'desc' },
      take: 10,
    }),

    // Fastest growing factions
    prisma.faction.findMany({
      include: { _count: { select: { members: true } } },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
  ])

  // Score signals: reactions * 2 + replies * 3
  const scoredSignals = signals
    .map((s: any) => ({
      ...s,
      score: (s._count.reactions * 2) + (s._count.replies * 3),
    }))
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 10)

  // Score debates: arguments * 3 + votes
  const scoredDebates = debates
    .map((d: any) => ({
      ...d,
      score: (d._count.arguments * 3) + d._count.votes,
    }))
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 5)

  return NextResponse.json({
    signals: scoredSignals,
    debates: scoredDebates,
    discoveries: discoveries.slice(0, 5),
    factions: factions.slice(0, 4),
  })
}
