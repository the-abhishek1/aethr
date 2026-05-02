export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const messages = await prisma.message.findMany({
    where: { OR: [{ fromUserId: session.id }, { toUserId: session.id }] },
    orderBy: { createdAt: 'desc' },
    include: {
      fromUser: { select: { id: true, username: true, avatarEmoji: true } },
      toUser:   { select: { id: true, username: true, avatarEmoji: true } },
    }
  })

  // Group into conversations (latest message per partner)
  const convMap = new Map<string, any>()
  for (const msg of messages) {
    const otherId = msg.fromUserId === session.id ? msg.toUserId : msg.fromUserId
    const other   = msg.fromUserId === session.id ? msg.toUser  : msg.fromUser
    if (!convMap.has(otherId)) convMap.set(otherId, { user: other, lastMessage: msg, unread: 0 })
    if (!msg.read && msg.toUserId === session.id) convMap.get(otherId).unread++
  }

  const unreadTotal = await prisma.message.count({ where: { toUserId: session.id, read: false } })
  return NextResponse.json({ conversations: Array.from(convMap.values()), unreadTotal })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { toUserId, content } = await req.json()
  if (!toUserId || !content?.trim()) return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
  if (toUserId === session.id) return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })

  const message = await prisma.message.create({
    data: { fromUserId: session.id, toUserId, content: content.trim() },
    include: {
      fromUser: { select: { id: true, username: true, avatarEmoji: true } },
      toUser:   { select: { id: true, username: true, avatarEmoji: true } },
    }
  })

  await prisma.notification.create({
    data: { userId: toUserId, type: 'message', title: `Message from @${session.username}`, body: content.slice(0, 80), link: '/messages' }
  })

  return NextResponse.json({ message })
}
