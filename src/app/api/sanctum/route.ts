export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const entries = await prisma.journalEntry.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({ entries })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content, mood } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })

  const entry = await prisma.journalEntry.create({
    data: { userId: session.id, content: content.trim(), mood }
  })

  // Boost wisdom slightly for reflection
  await prisma.reputation.upsert({
    where: { userId: session.id },
    update: { wisdom: { increment: 1 } },
    create: { userId: session.id, wisdom: 1 },
  })

  return NextResponse.json({ entry })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()

  await prisma.journalEntry.deleteMany({
    where: { id, userId: session.id }
  })

  return NextResponse.json({ success: true })
}
