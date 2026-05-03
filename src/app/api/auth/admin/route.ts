export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

// Admin IDs stored server-side in env — never exposed to client
const ADMIN_IDS = (process.env.ADMIN_USER_IDS || '')
  .split(',')
  .map(id => id.trim())
  .filter(Boolean)

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ isAdmin: false })

  const isAdmin = ADMIN_IDS.includes(session.id)
  return NextResponse.json({ isAdmin })
}
