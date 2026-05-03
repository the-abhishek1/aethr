export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Seed mysteries if none exist
async function seedMysteries() {
  const count = await prisma.mystery.count()
  if (count > 0) return

  const mysteries = [
    {
      title: 'The Signal in the Static',
      description: 'Deep in The Void, a pattern repeats in the noise. Every 7th character of every signal sent today forms a hidden message. What does it say?',
      clues: [
        'The pattern begins at the 7th character of the first signal of the day',
        'Count only alphabetic characters, skip spaces and punctuation',
        'The message is exactly 5 words long',
        'It describes what The Void truly is',
      ],
      answer: 'the void reflects your mind',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'The Forgotten Frequency',
      description: 'An ancient transmission echoes through The Forge. Its creator has been silent for exactly 30 days. The transmission contains a sequence. Find the next number.',
      clues: [
        'The sequence starts: 1, 1, 2, 3, 5, 8...',
        'It describes how communities grow in Aethr',
        'The answer is the sum of the last two',
        'Fibonacci knew this truth',
      ],
      answer: '13',
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'The Name of the Void',
      description: 'The Void has a secret name. It is hidden in the names of all eight worlds. Take the first letter of each world in order of their phase. What do you spell?',
      clues: [
        'Phase I: The Commons, The Forge',
        'Phase II: The Arena, The Deep',
        'Phase III: The Void, The Market',
        'Phase IV: The Sanctum, The Archive',
        'Take the first letter of each world name only (not "The")',
      ],
      answer: 'CFADVMSA',
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  ]

  for (const m of mysteries) {
    await prisma.mystery.create({ data: m })
  }
}

export async function GET() {
  await seedMysteries()
  const session = await getSession()

  const mysteries = await prisma.mystery.findMany({
    orderBy: [{ status: 'asc' }, { expiresAt: 'asc' }],
    include: {
      _count: { select: { explorers: true, attempts: true } },
      explorers: session ? { where: { userId: session.id }, select: { id: true } } : false,
    }
  })

  // Auto-expire
  const now = new Date()
  for (const m of mysteries) {
    if (m.status === 'active' && m.expiresAt < now) {
      await prisma.mystery.update({ where: { id: m.id }, data: { status: 'expired' } })
    }
  }

  return NextResponse.json({ mysteries })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { action, mysteryId, answer } = body

  if (action === 'join') {
    const existing = await prisma.mysteryExplorer.findUnique({
      where: { mysteryId_userId: { mysteryId, userId: session.id } }
    })
    // If already exploring, just return success — don't error
    if (existing) return NextResponse.json({ joined: true, alreadyExploring: true })

    await prisma.mysteryExplorer.create({ data: { mysteryId, userId: session.id } })

    await prisma.reputation.upsert({
      where: { userId: session.id },
      update: { discovery: { increment: 1 } },
      create: { userId: session.id, discovery: 1 },
    })

    return NextResponse.json({ joined: true })
  }

  if (action === 'attempt') {
    const mystery = await prisma.mystery.findUnique({ where: { id: mysteryId } })
    if (!mystery || mystery.status !== 'active') {
      return NextResponse.json({ error: 'Mystery not available' }, { status: 400 })
    }

    const correct = answer.trim().toLowerCase() === mystery.answer.toLowerCase()

    await prisma.mysteryAttempt.create({
      data: { mysteryId, userId: session.id, answer: answer.trim(), correct }
    })

    if (correct) {
      await prisma.mystery.update({
        where: { id: mysteryId },
        data: { status: 'solved', solvedBy: session.id, solvedAt: new Date() }
      })

      // Big rep boost for solving
      await prisma.reputation.upsert({
        where: { userId: session.id },
        update: { discovery: { increment: 25 }, wisdom: { increment: 10 }, legacy: { increment: 5 } },
        create: { userId: session.id, discovery: 25, wisdom: 10, legacy: 5 },
      })

      // Notify all users
      const allUsers = await prisma.user.findMany({
        where: { id: { not: session.id } }, select: { id: true }, take: 200
      })
      await prisma.notification.createMany({
        data: allUsers.map((u: { id: string }) => ({
          userId: u.id,
          type: 'mystery_solved',
          title: '🌑 Mystery solved in The Void',
          body: `@${session.username} was first to solve: "${mystery.title}"`,
          link: '/the-void',
        }))
      })

      return NextResponse.json({ correct: true, solved: true })
    }

    return NextResponse.json({ correct: false })
  }

  if (action === 'create') {
    const { title, description, answer, clues, difficulty } = body
    if (!title || !description || !answer || !clues || clues.length < 2) {
      return NextResponse.json({ error: 'Title, description, answer and 2+ clues required' }, { status: 400 })
    }

    const mystery = await prisma.mystery.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        answer: answer.toLowerCase().trim(),
        clues,
        status: 'active',
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      }
    })

    // Notify all users about new mystery
    const allUsers = await prisma.user.findMany({
      where: { id: { not: session.id } }, select: { id: true }, take: 200
    })
    await prisma.notification.createMany({
      data: allUsers.map((u: { id: string }) => ({
        userId: u.id,
        type: 'new_mystery',
        title: '🌑 New mystery in The Void',
        body: `@${session.username} created: "${title}"`,
        link: '/the-void',
      }))
    })

    // Boost creator's legacy rep
    await prisma.reputation.upsert({
      where: { userId: session.id },
      update: { legacy: { increment: 5 } },
      create: { userId: session.id, legacy: 5 },
    })

    return NextResponse.json({ mystery })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
