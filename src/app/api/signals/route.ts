export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const worldId = searchParams.get('world') || undefined
  const roomId = searchParams.get('room') || undefined
  const limit = parseInt(searchParams.get('limit') || '20')

  const signals = await prisma.signal.findMany({
    where: { worldId, roomId },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { id: true, username: true, avatarEmoji: true } },
      persona: { select: { name: true, type: true } },
    }
  })

  return NextResponse.json({ signals })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content, worldId, mood, personaId, roomId } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })

  const signal = await prisma.signal.create({
    data: {
      authorId: session.id,
      content: content.trim(),
      worldId: worldId || 'commons',
      mood,
      personaId,
      roomId,
    },
    include: {
      author: { select: { id: true, username: true, avatarEmoji: true } },
      persona: { select: { name: true, type: true } },
    }
  })

  return NextResponse.json({ signal })
}
