export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const unreadOnly = searchParams.get('unread') === 'true'

  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.id,
      ...(unreadOnly && { read: false }),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const unreadCount = await prisma.notification.count({
    where: { userId: session.id, read: false }
  })

  return NextResponse.json({ notifications, unreadCount })
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ids, all } = await req.json()

  if (all) {
    await prisma.notification.updateMany({
      where: { userId: session.id, read: false },
      data: { read: true },
    })
  } else if (ids?.length) {
    await prisma.notification.updateMany({
      where: { userId: session.id, id: { in: ids } },
      data: { read: true },
    })
  }

  return NextResponse.json({ success: true })
}

// Internal helper to create a notification (called from other API routes)
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId, type, title, body, link } = await req.json()

  const notification = await prisma.notification.create({
    data: { userId, type, title, body, link }
  })

  return NextResponse.json({ notification })
}
