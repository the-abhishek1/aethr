export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const existing = await prisma.roomMember.findUnique({
    where: { userId_roomId: { userId: session.id, roomId: id } }
  })
  if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 400 })

  const member = await prisma.roomMember.create({
    data: { userId: session.id, roomId: id }
  })

  return NextResponse.json({ member })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  await prisma.roomMember.deleteMany({
    where: { userId: session.id, roomId: id }
  })

  return NextResponse.json({ success: true })
}
