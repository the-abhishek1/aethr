export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, notificationEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  // Always return success to prevent email enumeration
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user) return NextResponse.json({ success: true })

  // Delete any existing tokens for this user
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

  // Create new token — expires in 1 hour
  const token = crypto.randomBytes(32).toString('hex')
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    }
  })

  const base = process.env.NEXTAUTH_URL || 'https://aethr-galaxy.netlify.app'
  const resetUrl = `${base}/reset-password?token=${token}`

  await sendEmail({
    to: email,
    subject: 'Reset your Aethr password',
    html: notificationEmail(
      user.username,
      'Password reset request',
      `Someone (hopefully you) requested a password reset for your Aethr account. This link expires in 1 hour. If you didn't request this, ignore this email.`,
      `/reset-password?token=${token}`
    )
  })

  return NextResponse.json({ success: true })
}
