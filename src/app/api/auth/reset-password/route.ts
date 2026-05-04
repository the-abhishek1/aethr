export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, setSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()
  if (!token || !password) return NextResponse.json({ error: 'Token and password required' }, { status: 400 })
  if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true }
  })

  if (!resetToken) return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 })
  if (resetToken.usedAt) return NextResponse.json({ error: 'Reset link already used' }, { status: 400 })
  if (new Date() > resetToken.expiresAt) return NextResponse.json({ error: 'Reset link has expired' }, { status: 400 })

  const hash = await hashPassword(password)

  await Promise.all([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash: hash } }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
  ])

  // Auto sign in after reset
  await setSessionCookie({
    id: resetToken.user.id,
    email: resetToken.user.email,
    username: resetToken.user.username,
    avatarEmoji: resetToken.user.avatarEmoji,
  })

  return NextResponse.json({ success: true })
}
