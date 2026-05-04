export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const replies = await prisma.signal.findMany({
    where: { parentId: id },
    orderBy: { createdAt: 'asc' },
    include: {
      author:    { select: { id: true, username: true, avatarEmoji: true } },
      _count:    { select: { replies: true, reactions: true } },
      reactions: { select: { emoji: true, userId: true } },
    }
  })

  return NextResponse.json({ replies })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { content, mood } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })

  // Get parent to know worldId and notify author
  const parent = await prisma.signal.findUnique({
    where: { id },
    select: { authorId: true, worldId: true, content: true }
  })
  if (!parent) return NextResponse.json({ error: 'Signal not found' }, { status: 404 })

  const reply = await prisma.signal.create({
    data: {
      authorId: session.id,
      content: content.trim(),
      mood,
      worldId: parent.worldId,
      parentId: id,
    },
    include: {
      author: { select: { id: true, username: true, avatarEmoji: true } },
    }
  })

  // Notify original author
  if (parent.authorId !== session.id) {
    await prisma.notification.create({
      data: {
        userId: parent.authorId,
        type: 'signal_reply',
        title: `@${session.username} replied to your signal`,
        body: content.slice(0, 80),
        link: `/signals/`,
      }
    })
  }

  // Detect @mentions in reply
  const mentionRegex = /@([a-zA-Z0-9_]+)/g
  const mentions = [...content.matchAll(mentionRegex)].map(m => m[1])
  if (mentions.length > 0) {
    const mentionedUsers = await prisma.user.findMany({
      where: { username: { in: mentions, mode: 'insensitive' } },
      select: { id: true }
    })
    for (const mentioned of mentionedUsers) {
      if (mentioned.id === session.id || mentioned.id === parent.authorId) continue
      await prisma.notification.create({
        data: {
          userId: mentioned.id,
          type: 'mention',
          title: `@${session.username} mentioned you in a reply`,
          body: content.slice(0, 80),
          link: `/signals/${id}`,
        }
      }).catch(() => {})
    }
  }

  return NextResponse.json({ reply })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content } = await (req as any).json()
  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })

  const signal = await prisma.signal.findUnique({ where: { id }, select: { authorId: true } })
  if (!signal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (signal.authorId !== session.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const updated = await prisma.signal.update({
    where: { id },
    data: { content: content.trim() },
    include: {
      author:    { select: { id: true, username: true, avatarEmoji: true } },
      _count:    { select: { replies: true, reactions: true } },
      reactions: { select: { emoji: true, userId: true } },
    }
  })

  return NextResponse.json({ signal: updated })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const signal = await prisma.signal.findUnique({ where: { id }, select: { authorId: true } })
  if (!signal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (signal.authorId !== session.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.signal.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}
