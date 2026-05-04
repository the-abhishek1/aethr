export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const [room, signals] = await Promise.all([
    prisma.memoryRoom.findUnique({
      where: { id },
      include: {
        _count: { select: { members: true, signals: true } },
        members: {
          include: { user: { select: { id: true, username: true, avatarEmoji: true } } },
          orderBy: { joinedAt: 'asc' },
        },
      }
    }),
    prisma.signal.findMany({
      where: { roomId: id, parentId: null },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        author:  { select: { id: true, username: true, avatarEmoji: true } },
        _count:  { select: { replies: true, reactions: true } },
        reactions: { select: { emoji: true, userId: true } },
      }
    })
  ])

  if (!room) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isMember = room.members.some((m: any) => m.userId === session.id)

  return NextResponse.json({ room, signals, isMember })
}

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const existing = await prisma.roomMember.findUnique({
    where: { userId_roomId: { userId: session.id, roomId: id } }
  })
  if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 400 })

  const member = await prisma.roomMember.create({
    data: { userId: session.id, roomId: id }
  })

  return NextResponse.json({ member })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  await prisma.roomMember.deleteMany({
    where: { userId: session.id, roomId: id }
  })

  return NextResponse.json({ success: true })
}
