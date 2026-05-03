export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ADMIN_IDS = (process.env.ADMIN_USER_IDS || '')
  .split(',').map(id => id.trim()).filter(Boolean)

async function verifyAdmin() {
  const session = await getSession()
  if (!session) return null
  // Fallback: also allow by username for local dev if ADMIN_USER_IDS not set
  const isAdmin = ADMIN_IDS.length > 0
    ? ADMIN_IDS.includes(session.id)
    : session.username?.toLowerCase() === '0xidiot'
  return isAdmin ? session : null
}

export async function GET() {
  const admin = await verifyAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [users, stats] = await Promise.all([
    prisma.user.findMany({
      orderBy: { joinedAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        avatarEmoji: true,
        bio: true,
        joinedAt: true,
        _count: {
          select: {
            signals: true,
            followers: true,
            following: true,
          }
        },
        reputation: {
          select: { wisdom: true, creativity: true, discovery: true, trust: true, debate: true, legacy: true }
        },
        presence: { select: { state: true, updatedAt: true } },
      }
    }),
    prisma.user.count(),
  ])

  return NextResponse.json({ users, total: stats })
}
