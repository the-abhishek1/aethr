export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || undefined

  // Get monuments
  const monuments = await prisma.monument.findMany({
    where: type ? { type } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  // Get galaxy stats for lore
  const [userCount, signalCount, debateCount, discoveryCount, mysteryCount, factionCount] = await Promise.all([
    prisma.user.count(),
    prisma.signal.count(),
    prisma.debate.count(),
    prisma.discovery.count(),
    prisma.mystery.count({ where: { status: 'solved' } }),
    prisma.faction.count(),
  ])

  // Top contributors
  // Fetch all rep, sort by total client-side (Prisma can't sum computed fields)
  const allRep = await prisma.reputation.findMany({
    include: { user: { select: { username: true, avatarEmoji: true } } }
  })
  const topByRep = allRep
    .map((r: any) => ({
      ...r,
      _total: (r.wisdom||0)+(r.creativity||0)+(r.discovery||0)+(r.trust||0)+(r.debate||0)+(r.legacy||0)
    }))
    .sort((a: any, b: any) => b._total - a._total)
    .slice(0, 10)

  // Most rippled discoveries
  const topDiscoveries = await prisma.discovery.findMany({
    orderBy: { ripples: 'desc' },
    take: 5,
    include: { author: { select: { username: true, avatarEmoji: true } } }
  })

  // Biggest factions
  const topFactions = await prisma.faction.findMany({
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: 'asc' },
    take: 5,
  })

  return NextResponse.json({
    monuments,
    lore: {
      userCount,
      signalCount,
      debateCount,
      discoveryCount,
      mysteriesSolved: mysteryCount,
      factionCount,
    },
    topByRep,
    topDiscoveries,
    topFactions,
  })
}

// Create monument (internal use / admin)
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, description, type, worldId, metadata } = await req.json()

  const monument = await prisma.monument.create({
    data: {
      title,
      description,
      type: type || 'milestone',
      worldId: worldId || 'archive',
      actorId: session.id,
      actorName: session.username,
      metadata,
    }
  })

  return NextResponse.json({ monument })
}
