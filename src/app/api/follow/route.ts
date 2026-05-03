export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
  if (userId === session.id) return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: session.id, followingId: userId } }
  })

  if (existing) {
    // Unfollow
    await prisma.follow.delete({ where: { id: existing.id } })
    return NextResponse.json({ following: false })
  }

  // Follow
  await prisma.follow.create({
    data: { followerId: session.id, followingId: userId }
  })

  // Notify
  await prisma.notification.create({
    data: {
      userId,
      type: 'new_follower',
      title: `@${session.username} is now following you`,
      body: 'They will see your signals in their feed.',
      link: `/profile/${session.username}`,
    }
  }).catch(() => {})

  return NextResponse.json({ following: true })
}

// Get follow status + counts for a user
export async function GET(req: NextRequest) {
  const session = await getSession()
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const [followerCount, followingCount, isFollowing] = await Promise.all([
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
    session ? prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: session.id, followingId: userId } }
    }) : null,
  ])

  return NextResponse.json({
    followerCount,
    followingCount,
    isFollowing: !!isFollowing,
  })
}
