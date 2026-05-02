export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || undefined
  const limit = parseInt(searchParams.get('limit') || '20')

  const debates = await prisma.debate.findMany({
    where: { ...(status && { status }) },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      creator: { select: { id: true, username: true, avatarEmoji: true } },
      _count: { select: { arguments: true, votes: true } },
      votes: { select: { side: true } },
    }
  })

  return NextResponse.json({ debates })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, description, endsAt } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  const debate = await prisma.debate.create({
    data: {
      creatorId: session.id,
      title: title.trim(),
      description,
      status: 'open',
      endsAt: endsAt ? new Date(endsAt) : undefined,
    },
    include: {
      creator: { select: { id: true, username: true, avatarEmoji: true } },
      _count: { select: { arguments: true, votes: true } },
      votes: { select: { side: true } },
    }
  })

  return NextResponse.json({ debate })
}
