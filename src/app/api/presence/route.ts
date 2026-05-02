export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { state, worldId } = await req.json()

  const presence = await prisma.presence.upsert({
    where: { userId: session.id },
    update: { state, worldId },
    create: { userId: session.id, state, worldId },
  })

  return NextResponse.json({ presence })
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const presence = await prisma.presence.findUnique({
    where: { userId: session.id }
  })

  return NextResponse.json({ presence })
}
