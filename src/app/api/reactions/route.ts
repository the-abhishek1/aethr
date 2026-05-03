export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const VALID_EMOJIS = ['🌀', '🔥', '🔭', '⚔️', '💙']

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { signalId, emoji } = await req.json()
  if (!signalId || !VALID_EMOJIS.includes(emoji)) {
    return NextResponse.json({ error: 'Invalid reaction' }, { status: 400 })
  }

  // Toggle: if already reacted with this emoji, remove it
  const existing = await prisma.signalReaction.findUnique({
    where: { signalId_userId_emoji: { signalId, userId: session.id, emoji } }
  })

  if (existing) {
    await prisma.signalReaction.delete({ where: { id: existing.id } })
    return NextResponse.json({ action: 'removed', emoji })
  }

  await prisma.signalReaction.create({
    data: { signalId, userId: session.id, emoji }
  })

  // Notify signal author
  const signal = await prisma.signal.findUnique({
    where: { id: signalId },
    select: { authorId: true, content: true }
  })

  if (signal && signal.authorId !== session.id) {
    await prisma.notification.create({
      data: {
        userId: signal.authorId,
        type: 'reaction',
        title: `${emoji} from @${session.username}`,
        body: `on: "${signal.content.slice(0, 60)}"`,
        link: '/commons',
      }
    }).catch(() => {}) // non-blocking
  }

  return NextResponse.json({ action: 'added', emoji })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const signalId = searchParams.get('signalId')
  if (!signalId) return NextResponse.json({ error: 'signalId required' }, { status: 400 })

  const reactions = await prisma.signalReaction.groupBy({
    by: ['emoji'],
    where: { signalId },
    _count: { emoji: true },
  })

  const session = await getSession()
  const myReactions = session
    ? await prisma.signalReaction.findMany({
        where: { signalId, userId: session.id },
        select: { emoji: true }
      })
    : []

  return NextResponse.json({
    reactions: reactions.map((r: any) => ({ emoji: r.emoji, count: r._count.emoji })),
    mine: myReactions.map((r: any) => r.emoji),
  })
}
