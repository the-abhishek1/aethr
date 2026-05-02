export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Ripple a discovery (like a share/boost)
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const discovery = await prisma.discovery.update({
    where: { id },
    data: { ripples: { increment: 1 } },
    include: { author: { select: { id: true, username: true, avatarEmoji: true } } }
  })

  // Boost author wisdom rep for each ripple
  await prisma.reputation.upsert({
    where: { userId: discovery.authorId },
    update: { wisdom: { increment: 1 } },
    create: { userId: discovery.authorId, wisdom: 1 },
  })

  // Notify author
  if (discovery.authorId !== session.id) {
    await prisma.notification.create({
      data: {
        userId: discovery.authorId,
        type: 'discovery_ripple',
        title: 'Your discovery rippled',
        body: `@${session.username} rippled your discovery: ${discovery.title.slice(0, 50)}`,
        link: '/the-deep',
      }
    })
  }

  return NextResponse.json({ discovery })
}
