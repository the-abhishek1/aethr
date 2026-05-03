'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Admin status comes from server via AuthContext — no client-side username check

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [tab, setTab] = useState<'overview' | 'users' | 'monuments'>('overview')
  const [monumentForm, setMonumentForm] = useState({ title: '', description: '', type: 'milestone', worldId: 'archive' })
  const [creating, setCreating] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user || !user.isAdmin) return

    fetch('/api/archive').then(r => r.json()).then(d => setStats(d.lore))
    fetch('/api/admin').then(r => r.json()).then(d => setUsers(d.users || []))
  }, [user])

  const createMonument = async () => {
    if (!monumentForm.title || !monumentForm.description) return
    setCreating(true)
    await fetch('/api/archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(monumentForm),
    })
    setMsg('Monument created ✓')
    setMonumentForm({ title: '', description: '', type: 'milestone', worldId: 'archive' })
    setCreating(false)
    setTimeout(() => setMsg(''), 3000)
  }

  if (loading || !user || !user.isAdmin) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>Checking access...</div>
  }

  return (
    <>
      <style>{`
        .admin-pad { padding: 7rem 2rem 4rem; }
        @media (max-width: 640px) { .admin-pad { padding: 6rem 1.25rem 3rem !important; } }
      `}</style>

      <div className="admin-pad">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D85A30', border: '0.5px solid #D85A3044', padding: '0.2rem 0.6rem', borderRadius: '2px' }}>Admin</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 300, marginBottom: '2.5rem' }}>
          Galaxy Control <em style={{ color: '#D85A30' }}>Panel</em>
        </h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem' }}>
          {(['overview', 'users', 'monuments'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'capitalize', padding: '0.5rem 1.25rem', borderRadius: '2px', cursor: 'none', background: tab === t ? 'rgba(216,90,48,0.12)' : 'transparent', border: `0.5px solid ${tab === t ? '#D85A30' : 'var(--border)'}`, color: tab === t ? '#D85A30' : 'var(--text-dim)' }}>{t}</button>
          ))}
        </div>

        {tab === 'overview' && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)', marginBottom: '2rem' }}>
            {[
              { label: 'Total users', val: stats.userCount, color: 'var(--aether)' },
              { label: 'Signals', val: stats.signalCount, color: '#1D9E75' },
              { label: 'Debates', val: stats.debateCount, color: '#D85A30' },
              { label: 'Discoveries', val: stats.discoveryCount, color: '#378ADD' },
              { label: 'Mysteries solved', val: stats.mysteriesSolved, color: '#7F77DD' },
              { label: 'Factions', val: stats.factionCount, color: '#a89bff' },
            ].map(s => (
              <div key={s.label} style={{ padding: '1.5rem', background: 'var(--void)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 300, color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.4rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'users' && (
          <div>
            {/* Summary */}
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
              {users.length} total users
            </div>

            <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1.2fr', gap: '0.5rem', padding: '0.6rem 1rem', borderBottom: '0.5px solid var(--border)', background: 'var(--deep)' }}>
                {['User', 'Email', 'Signals', 'Followers', 'Rep', 'Joined'].map(h => (
                  <div key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>{h}</div>
                ))}
              </div>

              {users.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                  Loading users...
                </div>
              ) : users.map((u: any, i: number) => {
                const totalRep = u.reputation
                  ? Object.values(u.reputation).reduce((s: number, v: any) => s + (v || 0), 0)
                  : 0
                return (
                  <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1.2fr', gap: '0.5rem', padding: '0.75rem 1rem', borderBottom: '0.5px solid var(--border)', background: i % 2 === 0 ? 'var(--void)' : 'transparent', alignItems: 'center', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--deep)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? 'var(--void)' : 'transparent'}
                  >
                    {/* User */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>{u.avatarEmoji}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{u.username}</div>
                        {u.presence?.state && (
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--aether)', opacity: 0.7 }}>{u.presence.state}</div>
                        )}
                      </div>
                    </div>
                    {/* Email */}
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                    {/* Signals */}
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#1D9E75' }}>{u._count?.signals || 0}</div>
                    {/* Followers */}
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#378ADD' }}>{u._count?.followers || 0}</div>
                    {/* Rep */}
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--aether)' }}>{totalRep}</div>
                    {/* Joined */}
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-dim)' }}>
                      {new Date(u.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'monuments' && (
          <div style={{ maxWidth: 560 }}>
            <div style={{ border: '0.5px solid var(--border-bright)', borderRadius: '2px', padding: '1.5rem', background: 'var(--deep)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>Create monument</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input value={monumentForm.title} onChange={e => setMonumentForm(f => ({ ...f, title: e.target.value }))} placeholder="Monument title" style={{ background: 'transparent', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.7rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text)' }} />
                <textarea value={monumentForm.description} onChange={e => setMonumentForm(f => ({ ...f, description: e.target.value }))} placeholder="Description — what happened? Why is this recorded?" rows={3} style={{ background: 'transparent', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.7rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text)', resize: 'vertical', lineHeight: 1.6 }} />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select value={monumentForm.type} onChange={e => setMonumentForm(f => ({ ...f, type: e.target.value }))} style={{ flex: 1, background: 'var(--deep)', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.7rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text)', cursor: 'none' }}>
                    {['milestone', 'mystery_solved', 'first_discovery', 'faction_war', 'debate_winner'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select value={monumentForm.worldId} onChange={e => setMonumentForm(f => ({ ...f, worldId: e.target.value }))} style={{ flex: 1, background: 'var(--deep)', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.7rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text)', cursor: 'none' }}>
                    {['archive', 'commons', 'forge', 'arena', 'the-deep', 'the-void'].map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                {msg && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#1D9E75' }}>{msg}</p>}
                <button onClick={createMonument} disabled={creating} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.75rem', background: '#D85A30', color: 'white', border: 'none', borderRadius: '2px', cursor: 'none' }}>{creating ? 'Creating...' : 'Create monument →'}</button>
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link href="/archive" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--gold)', border: '0.5px solid rgba(212,184,150,0.3)', padding: '0.6rem 1.25rem', borderRadius: '2px' }}>View archive →</Link>
              <Link href="/galaxy-tv" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--aether)', border: '0.5px solid rgba(168,155,255,0.3)', padding: '0.6rem 1.25rem', borderRadius: '2px' }}>Galaxy TV →</Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
