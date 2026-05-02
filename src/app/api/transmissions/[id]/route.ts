export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { isLive, viewers } = await req.json()

  const tx = await prisma.transmission.findUnique({ where: { id } })
  if (!tx || tx.creatorId !== session.id) {
    return NextResponse.json({ error: 'Not found or not yours' }, { status: 404 })
  }

  const updated = await prisma.transmission.update({
    where: { id },
    data: {
      ...(isLive !== undefined && { isLive }),
      ...(viewers !== undefined && { viewers }),
    },
    include: {
      creator: { select: { id: true, username: true, avatarEmoji: true } },
      _count: { select: { tips: true } },
    }
  })

  return NextResponse.json({ transmission: updated })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const tx = await prisma.transmission.findUnique({ where: { id } })
  if (!tx || tx.creatorId !== session.id) {
    return NextResponse.json({ error: 'Not found or not yours' }, { status: 404 })
  }

  await prisma.transmission.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
