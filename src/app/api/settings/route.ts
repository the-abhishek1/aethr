export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true, email: true, username: true, avatarEmoji: true, bio: true, joinedAt: true,
      _count: { select: { signals: true, discoveries: true, followers: true, following: true } }
    }
  })

  return NextResponse.json({ user })
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { action } = body

  if (action === 'change_password') {
    const { currentPassword, newPassword } = body
    if (!currentPassword || !newPassword) return NextResponse.json({ error: 'Both passwords required' }, { status: 400 })
    if (newPassword.length < 8) return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { id: session.id } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })

    const hash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: session.id }, data: { passwordHash: hash } })
    return NextResponse.json({ success: true })
  }

  if (action === 'update_profile') {
    const { username, bio, avatarEmoji } = body
    if (username && (username.length < 3 || !/^[a-z0-9_]+$/i.test(username))) {
      return NextResponse.json({ error: 'Username must be 3+ chars, letters/numbers/underscores only' }, { status: 400 })
    }
    const user = await prisma.user.update({
      where: { id: session.id },
      data: {
        ...(username  && { username }),
        ...(bio !== undefined && { bio }),
        ...(avatarEmoji && { avatarEmoji }),
      }
    })
    return NextResponse.json({ user })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { confirmation, password } = await req.json()
  if (confirmation !== 'DELETE MY ACCOUNT') {
    return NextResponse.json({ error: 'Type DELETE MY ACCOUNT to confirm' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.id } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return NextResponse.json({ error: 'Incorrect password' }, { status: 400 })

  // Delete user — cascade handles related records
  await prisma.user.delete({ where: { id: session.id } })

  // Clear session cookie
  const res = NextResponse.json({ success: true })
  res.cookies.delete('aethr_session')
  return res
}
