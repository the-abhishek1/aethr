export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const CONTEXT_LABELS: Record<string, string> = {
  'changed-my-mind': 'changed their mind',
  'made-me-laugh': 'made them laugh',
  'not-alone': 'made them feel less alone',
  'best-of-year': 'called it best of year',
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { toUserId, transmissionId, context, amount } = await req.json()
  if (!toUserId || !context) return NextResponse.json({ error: 'toUserId and context required' }, { status: 400 })
  if (toUserId === session.id) return NextResponse.json({ error: 'Cannot tip yourself' }, { status: 400 })

  const tip = await prisma.tip.create({
    data: { fromUserId: session.id, toUserId, transmissionId, context, amount: amount || 1 }
  })

  // Boost creativity rep
  await prisma.reputation.upsert({
    where: { userId: toUserId },
    update: { creativity: { increment: amount || 1 } },
    create: { userId: toUserId, creativity: amount || 1 },
  })

  // Notify recipient
  const tx = transmissionId ? await prisma.transmission.findUnique({ where: { id: transmissionId }, select: { title: true } }) : null
  await prisma.notification.create({
    data: {
      userId: toUserId,
      type: 'tip_received',
      title: 'You received a tip',
      body: `@${session.username} ${CONTEXT_LABELS[context] || 'tipped you'}${tx ? ` on "${tx.title}"` : ''}`,
      link: '/forge',
    }
  })

  return NextResponse.json({ tip })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const transmissionId = searchParams.get('transmissionId')
  if (!transmissionId) return NextResponse.json({ error: 'transmissionId required' }, { status: 400 })

  const tips = await prisma.tip.findMany({
    where: { transmissionId },
    include: { fromUser: { select: { username: true, avatarEmoji: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const summary = await prisma.tip.groupBy({
    by: ['context'],
    where: { transmissionId },
    _count: { context: true },
    _sum: { amount: true },
  })

  return NextResponse.json({ tips, summary })
}
