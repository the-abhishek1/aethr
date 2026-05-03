export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const worldId  = searchParams.get('world')    || undefined
  const roomId   = searchParams.get('room')     || undefined
  const limit    = parseInt(searchParams.get('limit') || '20')
  const feed     = searchParams.get('feed')     // 'following' | undefined
  const authorId = searchParams.get('authorId') || undefined

  let whereClause: any = { parentId: null }

  if (authorId) {
    whereClause.authorId = authorId
  } else if (feed === 'following') {
    const session = await getSession()
    if (!session) return NextResponse.json({ signals: [] })

    const follows = await prisma.follow.findMany({
      where: { followerId: session.id },
      select: { followingId: true }
    })
    const followingIds = follows.map((f: any) => f.followingId)
    if (followingIds.length === 0) return NextResponse.json({ signals: [], empty: true })
    whereClause.authorId = { in: followingIds }
  } else {
    if (worldId) whereClause.worldId = worldId
    if (roomId)  whereClause.roomId  = roomId
  }

  const signals = await prisma.signal.findMany({
    where: whereClause,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      author:  { select: { id: true, username: true, avatarEmoji: true } },
      persona: { select: { name: true, type: true } },
      _count:  { select: { replies: true, reactions: true } },
      reactions: { select: { emoji: true, userId: true } },
    }
  })

  return NextResponse.json({ signals })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content, worldId, mood, personaId, roomId, mediaUrl } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })

  const signal = await prisma.signal.create({
    data: {
      authorId: session.id,
      content: content.trim(),
      worldId: worldId || 'commons',
      mood,
      personaId,
      roomId,
      mediaUrl,
    },
    include: {
      author:  { select: { id: true, username: true, avatarEmoji: true } },
      persona: { select: { name: true, type: true } },
      _count:  { select: { replies: true, reactions: true } },
      reactions: { select: { emoji: true, userId: true } },
    }
  })

  return NextResponse.json({ signal })
}
