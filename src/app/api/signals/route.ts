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

  const session = authorId === 'me' ? await getSession() : null
  const resolvedAuthorId = authorId === 'me' ? session?.id : authorId

  let whereClause: any = { parentId: null }

  if (resolvedAuthorId) {
    whereClause.authorId = resolvedAuthorId
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

  // Detect @mentions and notify mentioned users
  const mentionRegex = /@([a-zA-Z0-9_]+)/g
  const mentions = [...content.matchAll(mentionRegex)].map(m => m[1])
  if (mentions.length > 0) {
    const mentionedUsers = await prisma.user.findMany({
      where: { username: { in: mentions, mode: 'insensitive' } },
      select: { id: true, username: true }
    })
    for (const mentioned of mentionedUsers) {
      if (mentioned.id === session.id) continue // don't notify yourself
      await prisma.notification.create({
        data: {
          userId: mentioned.id,
          type: 'mention',
          title: `@${session.username} mentioned you`,
          body: content.slice(0, 80),
          link: `/signals/${signal.id}`,
        }
      }).catch(() => {})
      // Also send email — fetch their email for the notification
      prisma.user.findUnique({ where: { id: mentioned.id }, select: { email: true, username: true } })
        .then((u: any) => {
          if (u?.email) {
            const { sendEmail, notificationEmail } = require('@/lib/email')
            sendEmail({
              to: u.email,
              subject: `@${session.username} mentioned you on Aethr`,
              html: notificationEmail(u.username, `@${session.username} mentioned you`, content.slice(0, 100), `/signals/${signal.id}`)
            }).catch(() => {})
          }
        }).catch(() => {})
    }
  }

  return NextResponse.json({ signal })
}
