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

export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let id: string | undefined
  try { const b = await request.json(); id = b.id } catch {}

  if (id) {
    await prisma.notification.updateMany({
      where: { id, userId: session.id },
      data: { read: true },
    })
  } else {
    await prisma.notification.updateMany({
      where: { userId: session.id, read: false },
      data: { read: true },
    })
  }

  return NextResponse.json({ success: true })
}
