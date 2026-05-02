export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  const type = searchParams.get('type') || 'all' // all | users | signals | debates | factions | discoveries

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], query: q })
  }

  const results: Record<string, any[]> = {}

  if (type === 'all' || type === 'users') {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { bio: { contains: q, mode: 'insensitive' } },
        ]
      },
      select: { id: true, username: true, avatarEmoji: true, bio: true, joinedAt: true },
      take: 8,
    })
    results.users = users
  }

  if (type === 'all' || type === 'signals') {
    const signals = await prisma.signal.findMany({
      where: { content: { contains: q, mode: 'insensitive' } },
      include: { author: { select: { id: true, username: true, avatarEmoji: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
    results.signals = signals
  }

  if (type === 'all' || type === 'debates') {
    const debates = await prisma.debate.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ]
      },
      include: {
        creator: { select: { id: true, username: true, avatarEmoji: true } },
        _count: { select: { arguments: true, votes: true } },
      },
      take: 8,
    })
    results.debates = debates
  }

  if (type === 'all' || type === 'factions') {
    const factions = await prisma.faction.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ]
      },
      include: { _count: { select: { members: true } } },
      take: 6,
    })
    results.factions = factions
  }

  if (type === 'all' || type === 'discoveries') {
    const discoveries = await prisma.discovery.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { content: { contains: q, mode: 'insensitive' } },
        ]
      },
      include: { author: { select: { id: true, username: true, avatarEmoji: true } } },
      orderBy: { ripples: 'desc' },
      take: 8,
    })
    results.discoveries = discoveries
  }

  const total = Object.values(results).reduce((acc, arr) => acc + arr.length, 0)
  return NextResponse.json({ results, total, query: q })
}
