export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const worldId = searchParams.get('world') || 'commons'

  const rooms = await prisma.memoryRoom.findMany({
    where: { worldId },
    include: {
      _count: { select: { members: true, signals: true } },
      members: {
        where: { userId: session.id },
        select: { id: true }
      }
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json({ rooms })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, description, worldId, color } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const room = await prisma.memoryRoom.create({
    data: {
      name: name.trim(),
      description,
      worldId: worldId || 'commons',
      color: color || '#a89bff',
      creatorId: session.id,
      members: {
        create: { userId: session.id }
      }
    },
    include: {
      _count: { select: { members: true } },
      members: { where: { userId: session.id }, select: { id: true } }
    }
  })

  return NextResponse.json({ room })
}
