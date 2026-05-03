'use client'
import { useEffect, useState } from 'react'
import SectionLabel from '@/components/ui/SectionLabel'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

const FACTION_COLORS = ['#a89bff','#1D9E75','#D85A30','#378ADD','#BA7517','#d4b896']

export default function FactionsPage() {
  const { user } = useAuth()
  const [factions, setFactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#a89bff')
  const [showForm, setShowForm] = useState(false)
  const [joining, setJoining] = useState<string | null>(null)

  const load = async () => {
    const res = await fetch('/api/factions')
    const data = await res.json()
    setFactions(data.factions || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    if (!name.trim()) return
    setCreating(true)
    await fetch('/api/factions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, color }),
    })
    setName(''); setDescription(''); setShowForm(false); setCreating(false)
    load()
  }

  const join = async (id: string) => {
    setJoining(id)
    await fetch(`/api/factions/${id}`, { method: 'POST' })
    setJoining(null)
    load()
  }

  const leave = async (id: string) => {
    await fetch(`/api/factions/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <>
      <style>{`
        .factions-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border); border: 0.5px solid var(--border); }
        @media (max-width: 1024px) { .factions-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 640px) { .factions-grid { grid-template-columns: 1fr !important; } .factions-pad { padding: 6rem 1.25rem 3rem !important; } }
      `}</style>
      <div className="factions-pad" style={{ padding: '7rem 2rem 4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <SectionLabel>The Arena</SectionLabel>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem,6vw,5rem)', fontWeight: 300, lineHeight: 0.95 }}>⚔️ Factions</h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.75rem', maxWidth: 420 }}>Communities with identity, territory, and reputation. Join one or forge your own.</p>
          </div>
          {user && (
            <button onClick={() => setShowForm(!showForm)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.75rem 1.5rem', background: showForm ? 'var(--aether-dim)' : 'transparent', border: `0.5px solid ${showForm ? 'var(--aether)' : 'var(--border)'}`, color: showForm ? 'var(--aether)' : 'var(--text-muted)', borderRadius: '2px', cursor: 'none' }}>
              {showForm ? '× Cancel' : '+ Forge a faction'}
            </button>
          )}
        </div>

        {/* Create form */}
        {showForm && (
          <div style={{ border: '0.5px solid var(--border-bright)', borderRadius: '2px', padding: '1.5rem', background: 'var(--deep)', marginBottom: '2rem', animation: 'fadeUp 0.3s ease' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--aether)', marginBottom: '1.25rem' }}>Forge a new faction</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Faction name" style={{ background: 'transparent', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text)' }} />
              <input value={description} onChange={e => setDescription(e.target.value)} placeholder="What does your faction stand for?" style={{ background: 'transparent', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text)' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)' }}>Color:</span>
              {FACTION_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: `2px solid ${color === c ? 'white' : 'transparent'}`, cursor: 'none', transition: 'all 0.15s', boxShadow: color === c ? `0 0 8px ${c}` : 'none' }} />
              ))}
            </div>
            <button onClick={create} disabled={creating || !name.trim()} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.75rem 2rem', background: name.trim() ? 'var(--aether)' : 'var(--aether-dim)', color: name.trim() ? 'var(--void)' : 'var(--aether)', border: 'none', borderRadius: '2px', cursor: 'none' }}>{creating ? 'Forging...' : 'Forge faction →'}</button>
          </div>
        )}

        {loading ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', textAlign: 'center', padding: '4rem' }}>Loading factions...</div>
        ) : factions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', border: '0.5px solid var(--border)', borderRadius: '2px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚔️</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No factions yet.</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>Be the first to forge one.</p>
          </div>
        ) : (
          <div className="factions-grid">
            {factions.map((f: any) => {
              const isMember = f.members?.some((m: any) => m.userId === user?.id)
              return (
                <div key={f.id} style={{ position: 'relative', background: 'var(--void)', padding: '1.75rem', transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--deep)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--void)'}
                >
                  <Link href={`/factions/${f.id}`} style={{ position: 'absolute', inset: 0, zIndex: 0 }} aria-label={`View ${f.name}`} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: f.color, boxShadow: `0 0 8px ${f.color}`, flexShrink: 0 }} />
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--text)' }}>{f.name}</div>
                  </div>
                  {f.description && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>{f.description}</p>}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {f.members?.slice(0, 5).map((m: any) => (
                      <span key={m.id} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-dim)', padding: '0.2rem 0.5rem', border: '0.5px solid var(--border)', borderRadius: '99px' }}>@{m.user?.username}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)' }}>{f._count.members} member{f._count.members !== 1 ? 's' : ''}</span>
                    {user && (
                      isMember ? (
                        <button onClick={() => leave(f.id)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.35rem 0.9rem', background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--text-dim)', borderRadius: '2px', cursor: 'none', position: 'relative', zIndex: 1 }}>Leave</button>
                      ) : (
                        <button onClick={() => join(f.id)} disabled={joining === f.id} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.35rem 0.9rem', background: `${f.color}18`, border: `0.5px solid ${f.color}66`, color: f.color, borderRadius: '2px', cursor: 'none', position: 'relative', zIndex: 1 }}>{joining === f.id ? '...' : 'Join'}</button>
                      )
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
