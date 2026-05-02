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
      author: { select: { id: true, username: true, avatarEmoji: true } },
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
        link: `/${parent.worldId}`,
      }
    })
  }

  return NextResponse.json({ reply })
}
