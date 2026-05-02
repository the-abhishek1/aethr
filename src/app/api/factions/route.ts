export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const factions = await prisma.faction.findMany({
    include: {
      _count: { select: { members: true } },
      members: {
        take: 5,
        include: { user: { select: { username: true, avatarEmoji: true } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json({ factions })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, description, color, territory } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const faction = await prisma.faction.create({
    data: {
      name: name.trim(),
      description,
      color: color || '#a89bff',
      territory,
      members: {
        create: { userId: session.id, role: 'leader' }
      }
    },
    include: { _count: { select: { members: true } } }
  })

  return NextResponse.json({ faction })
}
