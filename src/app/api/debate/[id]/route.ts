export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const debate = await prisma.debate.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, username: true, avatarEmoji: true } },
      arguments: {
        include: { author: { select: { id: true, username: true, avatarEmoji: true } } },
        orderBy: { createdAt: 'asc' },
      },
      votes: { select: { side: true, userId: true } },
      _count: { select: { arguments: true, votes: true } },
    }
  })
  if (!debate) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ debate })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { content, side } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })
  if (!['for', 'against'].includes(side)) return NextResponse.json({ error: 'Side must be for or against' }, { status: 400 })

  const debate = await prisma.debate.findUnique({ where: { id }, select: { creatorId: true, title: true } })
  if (!debate) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const argument = await prisma.debateArgument.create({
    data: { debateId: id, authorId: session.id, content: content.trim(), side },
    include: { author: { select: { id: true, username: true, avatarEmoji: true } } }
  })

  // Boost debate rep
  await prisma.reputation.upsert({
    where: { userId: session.id },
    update: { debate: { increment: 2 } },
    create: { userId: session.id, debate: 2 },
  })

  // Notify debate creator
  if (debate.creatorId !== session.id) {
    await prisma.notification.create({
      data: {
        userId: debate.creatorId,
        type: 'debate_reply',
        title: 'New argument in your debate',
        body: `@${session.username} argued ${side}: "${content.slice(0, 60)}"`,
        link: '/arena',
      }
    })
  }

  return NextResponse.json({ argument })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { side } = await req.json()
  if (!['for', 'against'].includes(side)) return NextResponse.json({ error: 'Invalid side' }, { status: 400 })

  const vote = await prisma.debateVote.upsert({
    where: { debateId_userId: { debateId: id, userId: session.id } },
    update: { side },
    create: { debateId: id, userId: session.id, side },
  })
  return NextResponse.json({ vote })
}
