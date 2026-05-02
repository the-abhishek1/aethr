export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const tag = searchParams.get('tag') || undefined

  const discoveries = await prisma.discovery.findMany({
    where: { ...(tag && { tags: { has: tag } }) },
    take: limit,
    orderBy: [{ ripples: 'desc' }, { createdAt: 'desc' }],
    include: {
      author: { select: { id: true, username: true, avatarEmoji: true } },
    }
  })

  return NextResponse.json({ discoveries })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, content, tags } = await req.json()
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Title and content required' }, { status: 400 })
  }

  const discovery = await prisma.discovery.create({
    data: {
      authorId: session.id,
      title: title.trim(),
      content: content.trim(),
      tags: tags || [],
    },
    include: {
      author: { select: { id: true, username: true, avatarEmoji: true } },
    }
  })

  // Boost discovery rep
  await prisma.reputation.upsert({
    where: { userId: session.id },
    update: { discovery: { increment: 5 } },
    create: { userId: session.id, discovery: 5 },
  })

  // Notify all users that a discovery was made
  const allUsers = await prisma.user.findMany({
    where: { id: { not: session.id } },
    select: { id: true },
    take: 100,
  })

  await prisma.notification.createMany({
    data: allUsers.map((u: { id: string }) => ({
      userId: u.id,
      type: 'discovery_ripple',
      title: 'New discovery in The Deep',
      body: `@${session.username} discovered: ${title.slice(0, 60)}`,
      link: '/the-deep',
    }))
  })

  return NextResponse.json({ discovery })
}
