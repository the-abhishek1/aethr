export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Leaderboard across all rep dimensions
  const allRep = await prisma.reputation.findMany({
    include: {
      user: { select: { id: true, username: true, avatarEmoji: true, bio: true } }
    }
  })

  // Sort by total rep across all 6 dimensions
  const leaderboard = allRep
    .map((r: any) => ({
      ...r,
      _total: (r.wisdom||0)+(r.creativity||0)+(r.discovery||0)+(r.trust||0)+(r.debate||0)+(r.legacy||0)
    }))
    .sort((a: any, b: any) => b._total - a._total)
    .slice(0, 20)

  // Recent trades
  const trades = await prisma.repTrade.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      fromUser: { select: { username: true, avatarEmoji: true } },
      toUser:   { select: { username: true, avatarEmoji: true } },
    }
  })

  // My rep
  const myRep = await prisma.reputation.findUnique({
    where: { userId: session.id }
  })

  return NextResponse.json({ leaderboard, trades, myRep })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { toUserId, dimension, amount, reason } = await req.json()

  if (!toUserId || !dimension || !amount || !reason) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }
  if (toUserId === session.id) {
    return NextResponse.json({ error: 'Cannot trade to yourself' }, { status: 400 })
  }
  if (amount < 1 || amount > 10) {
    return NextResponse.json({ error: 'Amount must be 1-10' }, { status: 400 })
  }

  const validDimensions = ['wisdom', 'creativity', 'discovery', 'trust', 'debate', 'legacy']
  if (!validDimensions.includes(dimension)) {
    return NextResponse.json({ error: 'Invalid dimension' }, { status: 400 })
  }

  // Check sender has enough rep in that dimension
  const senderRep = await prisma.reputation.findUnique({ where: { userId: session.id } })
  const current = (senderRep as any)?.[dimension] || 0
  if (current < amount) {
    return NextResponse.json({ error: `Not enough ${dimension} rep to trade` }, { status: 400 })
  }

  // Execute trade
  const [trade] = await Promise.all([
    prisma.repTrade.create({
      data: { fromUserId: session.id, toUserId, dimension, amount, reason },
      include: {
        fromUser: { select: { username: true, avatarEmoji: true } },
        toUser:   { select: { username: true, avatarEmoji: true } },
      }
    }),
    // Deduct from sender
    prisma.reputation.update({
      where: { userId: session.id },
      data: { [dimension]: { decrement: amount } }
    }),
    // Add to receiver
    prisma.reputation.upsert({
      where: { userId: toUserId },
      update: { [dimension]: { increment: amount } },
      create: { userId: toUserId, [dimension]: amount }
    }),
    // Notify recipient
    prisma.notification.create({
      data: {
        userId: toUserId,
        type: 'rep_trade',
        title: `+${amount} ${dimension} rep received`,
        body: `@${session.username} traded ${amount} ${dimension} rep: "${reason}"`,
        link: '/market',
      }
    })
  ])

  return NextResponse.json({ trade })
}
