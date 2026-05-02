'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import SectionLabel from '@/components/ui/SectionLabel'
import { CardSkeleton } from '@/components/ui/Skeleton'
import Link from 'next/link'

export default function FactionDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const [faction, setFaction] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  const load = useCallback(async () => {
    // Get faction from list
    const res = await fetch('/api/factions')
    const data = await res.json()
    const found = data.factions?.find((f: any) => f.id === id)
    setFaction(found || null)
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const isMember = faction?.members?.some((m: any) => m.userId === user?.id)

  const join = async () => {
    setJoining(true)
    await fetch(`/api/factions/${id}`, { method: 'POST' })
    setJoining(false)
    load()
  }

  const leave = async () => {
    await fetch(`/api/factions/${id}`, { method: 'DELETE' })
    load()
  }

  if (loading) return (
    <div style={{ padding: '7rem 2rem 4rem', maxWidth: 720, margin: '0 auto' }}>
      <CardSkeleton />
    </div>
  )

  if (!faction) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <div style={{ fontSize: '3rem' }}>⚔️</div>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'var(--text-muted)' }}>Faction not found.</p>
      <Link href="/factions" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--aether)', border: '0.5px solid rgba(168,155,255,0.3)', padding: '0.6rem 1.25rem', borderRadius: '2px' }}>All factions →</Link>
    </div>
  )

  return (
    <>
      <style>{`
        .faction-pad { padding: 7rem 2rem 4rem; max-width: 720px; margin: 0 auto; }
        @media (max-width: 640px) { .faction-pad { padding: 6rem 1.25rem 3rem !important; } }
      `}</style>

      <div className="faction-pad">
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <SectionLabel>Faction</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: faction.color, boxShadow: `0 0 10px ${faction.color}`, flexShrink: 0 }} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,6vw,4rem)', fontWeight: 300, lineHeight: 0.95 }}>{faction.name}</h1>
          </div>
          {faction.description && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.9, maxWidth: 500, marginBottom: '1.5rem' }}>{faction.description}</p>
          )}
          {faction.territory && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: faction.color, marginBottom: '1.5rem' }}>
              Territory: {faction.territory}
            </div>
          )}

          {user && (
            isMember ? (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#1D9E75' }}>✓ You are a member</span>
                <button onClick={leave} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.4rem 1rem', background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--text-dim)', borderRadius: '2px', cursor: 'none' }}>Leave faction</button>
              </div>
            ) : (
              <button onClick={join} disabled={joining} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.65rem 2rem', background: `${faction.color}18`, border: `0.5px solid ${faction.color}66`, color: faction.color, borderRadius: '2px', cursor: 'none' }}>
                {joining ? 'Joining...' : 'Join this faction →'}
              </button>
            )
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '2rem', padding: '1.25rem', border: '0.5px solid var(--border)', borderRadius: '2px', background: 'var(--deep)', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: faction.color, lineHeight: 1 }}>{faction._count?.members || 0}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Members</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'var(--text-muted)', lineHeight: 1 }}>
              {new Date(faction.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Founded</div>
          </div>
        </div>

        {/* Members */}
        <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1.25rem', borderBottom: '0.5px solid var(--border)', background: 'var(--deep)', fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Members
          </div>
          {faction.members?.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)' }}>No members yet.</div>
          ) : faction.members?.map((m: any) => (
            <Link key={m.id} href={`/profile/${m.user?.username}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1.25rem', borderBottom: '0.5px solid var(--border)', textDecoration: 'none', background: 'var(--void)', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--deep)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--void)'}
            >
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--surface)', border: `0.5px solid ${faction.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{m.user?.avatarEmoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)' }}>@{m.user?.username}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>{m.role}</div>
              </div>
              {m.role === 'leader' && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: faction.color, border: `0.5px solid ${faction.color}44`, padding: '0.15rem 0.5rem', borderRadius: '2px' }}>Leader</span>}
            </Link>
          ))}
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <Link href="/factions" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--text-dim)' }}>← All factions</Link>
        </div>
      </div>
    </>
  )
}
