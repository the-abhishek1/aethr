export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      personas: true,
      reputation: true,
      presence: true,
      roomMembers: {
        include: {
          room: {
            include: { _count: { select: { members: true } } }
          }
        },
        orderBy: { joinedAt: 'desc' },
      },
      factionMembers: {
        include: { faction: true },
      },
    }
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Get recent signals as timeline
  const signals = await prisma.signal.findMany({
    where: { authorId: session.id },
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { persona: { select: { name: true } } }
  })

  return NextResponse.json({ user, signals })
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { username, bio, avatarEmoji } = await req.json()

  const user = await prisma.user.update({
    where: { id: session.id },
    data: {
      ...(username && { username }),
      ...(bio !== undefined && { bio }),
      ...(avatarEmoji && { avatarEmoji }),
    },
    include: { personas: true, reputation: true, presence: true }
  })

  return NextResponse.json({ user })
}

// Public profile by username — no auth required
export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')
  if (!username) return Response.json({ error: 'username required' }, { status: 400 })

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true, username: true, avatarEmoji: true, bio: true, joinedAt: true,
      reputation: true,
      personas: { where: { isActive: true }, select: { name: true, type: true } },
      _count: { select: { signals: true, discoveries: true, followers: true, following: true } },
    }
  })

  if (!user) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json({ user })
}
