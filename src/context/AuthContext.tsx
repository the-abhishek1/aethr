'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'

interface Persona { id: string; name: string; type: string; worldScope: string[]; isActive: boolean }
interface Reputation { wisdom: number; creativity: number; discovery: number; trust: number; debate: number; legacy: number }
interface Presence { state: string; worldId: string | null }

export interface AuthUser {
  isAdmin: boolean
  id: string
  email: string
  username: string
  avatarEmoji: string
  bio?: string
  joinedAt: string
  personas: Persona[]
  reputation: Reputation | null
  presence: Presence | null
}

interface AuthCtx {
  user: AuthUser | null
  loading: boolean
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthCtx>({ user: null, loading: true, refresh: async () => {}, signOut: async () => {} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const [meRes, adminRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/auth/admin'),
      ])
      const meData    = await meRes.json()
      const adminData = await adminRes.json()
      if (meData.user) {
        setUser({ ...meData.user, isAdmin: adminData.isAdmin === true })
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    setUser(null)
    window.location.href = '/'
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return <Ctx.Provider value={{ user, loading, refresh, signOut }}>{children}</Ctx.Provider>
}

export function useAuth() { return useContext(Ctx) }
