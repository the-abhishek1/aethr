export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()

  const faction = await prisma.faction.findUnique({
    where: { id },
    include: {
      _count: { select: { members: true } },
      members: {
        include: {
          user: {
            select: {
              id: true, username: true, avatarEmoji: true, bio: true,
              reputation: true,
            }
          }
        },
        orderBy: { joinedAt: 'asc' },
      }
    }
  })

  if (!faction) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isMember = session
    ? faction.members.some(m => m.userId === session.id)
    : false

  return NextResponse.json({ faction, isMember })
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const existing = await prisma.factionMember.findUnique({
    where: { userId_factionId: { userId: session.id, factionId: id } }
  })
  if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 400 })

  const member = await prisma.factionMember.create({
    data: { userId: session.id, factionId: id, role: 'member' }
  })
  return NextResponse.json({ member })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.factionMember.deleteMany({
    where: { userId: session.id, factionId: id }
  })
  return NextResponse.json({ success: true })
}
