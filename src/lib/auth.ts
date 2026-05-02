import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'aethr-secret'
const COOKIE_NAME = 'aethr_session'

export interface SessionUser {
  id: string
  email: string
  username: string
  avatarEmoji: string
}

// Hash password
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

// Verify password
export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

// Create JWT session token
export function createSessionToken(user: SessionUser) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '30d' })
}

// Verify JWT
export function verifySessionToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser
  } catch {
    return null
  }
}

// Get current session from cookies (server side)
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySessionToken(token)
}

// Set session cookie
export async function setSessionCookie(user: SessionUser) {
  const token = createSessionToken(user)
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
  return token
}

// Clear session
export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

// Get full user from DB
export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      personas: true,
      reputation: true,
      presence: true,
    },
  })
}

// Register new user
export async function registerUser(email: string, username: string, password: string) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] }
  })
  if (existing) {
    if (existing.email === email) throw new Error('Email already in use')
    throw new Error('Username already taken')
  }

  const passwordHash = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      personas: {
        create: {
          name: 'Creator',
          type: 'creator',
          worldScope: ['forge', 'commons'],
          isActive: true,
        }
      },
      reputation: { create: {} },
      presence: { create: { state: 'open' } },
    }
  })

  return user
}

// Sign in user
export async function signInUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error('No account found with that email')

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) throw new Error('Incorrect password')

  return user
}
