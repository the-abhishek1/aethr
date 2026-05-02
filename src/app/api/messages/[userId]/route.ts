export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId } = await params

  // Guard: userId must be a real string
  if (!userId || userId === 'undefined') {
    return NextResponse.json({ error: 'Invalid userId' }, { status: 400 })
  }

  const [messages, partner] = await Promise.all([
    prisma.message.findMany({
      where: {
        OR: [
          { fromUserId: session.id, toUserId: userId },
          { fromUserId: userId, toUserId: session.id },
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: { fromUser: { select: { id: true, username: true, avatarEmoji: true } } }
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, avatarEmoji: true, bio: true }
    })
  ])

  // Mark received messages as read
  await prisma.message.updateMany({
    where: { fromUserId: userId, toUserId: session.id, read: false },
    data: { read: true }
  })

  if (!partner) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  return NextResponse.json({ messages, partner })
}
