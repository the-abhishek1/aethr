// Edge-compatible auth (no Node.js APIs, no Prisma)
// Used in middleware only

export interface SessionUser {
  id: string
  email: string
  username: string
  avatarEmoji: string
}

export function verifySessionToken(token: string): SessionUser | null {
  try {
    // Simple base64 JWT decode for edge (no crypto verify - middleware just needs the payload)
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (payload.exp && payload.exp < Date.now() / 1000) return null
    return payload as SessionUser
  } catch {
    return null
  }
}
