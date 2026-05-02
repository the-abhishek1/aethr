export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const worldId = searchParams.get('world') || 'forge'
  const liveOnly = searchParams.get('live') === 'true'
  const limit = parseInt(searchParams.get('limit') || '20')

  const transmissions = await prisma.transmission.findMany({
    where: {
      worldId,
      ...(liveOnly && { isLive: true }),
    },
    take: limit,
    orderBy: [{ isLive: 'desc' }, { createdAt: 'desc' }],
    include: {
      creator: { select: { id: true, username: true, avatarEmoji: true } },
      _count: { select: { tips: true } },
    }
  })

  return NextResponse.json({ transmissions })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, type, description, worldId, isLive, mediaUrl } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  const transmission = await prisma.transmission.create({
    data: {
      creatorId: session.id,
      title: title.trim(),
      type: type || 'live-talk',
      description,
      worldId: worldId || 'forge',
      isLive: isLive || false,
      mediaUrl,
    },
    include: {
      creator: { select: { id: true, username: true, avatarEmoji: true } },
      _count: { select: { tips: true } },
    }
  })

  return NextResponse.json({ transmission })
}
