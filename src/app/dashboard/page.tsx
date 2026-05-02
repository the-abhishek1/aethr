'use client'
import Link from 'next/link'
import { WORLDS } from '@/lib/constants'
import SectionLabel from '@/components/ui/SectionLabel'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'

const PRESENCE_STATES = [
  { id: 'deep-work', label: 'Deep work', color: '#1D9E75' },
  { id: 'open', label: 'Open to connect', color: '#a89bff' },
  { id: 'creating', label: 'Creating', color: '#BA7517' },
  { id: 'exploring', label: 'Exploring', color: '#378ADD' },
  { id: 'competing', label: 'In the Arena', color: '#D85A30' },
  { id: 'resting', label: 'Resting', color: '#444441' },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [presence, setPresence] = useState('open')
  const [persona, setPersona] = useState('creative')
  const [signals, setSignals] = useState<any[]>([])
  const [rep, setRep] = useState<any>(null)

  const loadData = useCallback(async () => {
    const [presRes, profRes, sigRes] = await Promise.all([
      fetch('/api/presence'),
      fetch('/api/profile'),
      fetch('/api/signals?limit=5'),
    ])
    const [presData, profData, sigData] = await Promise.all([
      presRes.json(), profRes.json(), sigRes.json()
    ])
    if (presData.presence?.state) setPresence(presData.presence.state)
    if (profData.user?.reputation) setRep(profData.user.reputation)
    if (profData.user?.personas?.[0]) setPersona(profData.user.personas[0].type)
    setSignals(sigData.signals || [])
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const updatePresence = async (state: string) => {
    setPresence(state)
    await fetch('/api/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
    })
  }

  const REP_FIELDS = [
    { key: 'wisdom', color: '#a89bff' }, { key: 'creativity', color: '#d4b896' },
    { key: 'discovery', color: '#1D9E75' }, { key: 'trust', color: '#378ADD' },
    { key: 'legacy', color: '#888780' },
  ]

  // Live galaxy events — mix of real signals + demo events
  const galaxyEvents = [
    ...signals.map(s => ({ time: new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), world: s.worldId, event: `@${s.author?.username}: ${s.content.slice(0, 60)}${s.content.length > 60 ? '...' : ''}`, color: '#1D9E75' })),
    { time: '8m ago', world: 'The Arena', event: 'Faction war: Builders vs Wanderers — Round 3', color: '#D85A30' },
    { time: '14m ago', world: 'The Void', event: 'New mystery dropped — 38 explorers entered', color: '#7F77DD' },
  ].slice(0, 6)

  return (
    <>
      <style>{`
        .dash-root { padding: 7rem 2rem 4rem; }
        .presence-strip { display: flex; gap: 0.5rem; overflow-x: auto; padding: 1rem 0; margin-bottom: 2rem; scrollbar-width: none; }
        .presence-strip::-webkit-scrollbar { display: none; }
        .presence-chip { display: flex; align-items: center; gap: 0.5rem; padding: 0.45rem 0.9rem; border-radius: 99px; border: 0.5px solid var(--border); background: transparent; cursor: none; white-space: nowrap; flex-shrink: 0; font-family: var(--font-mono); font-size: 0.6rem; color: var(--text-dim); transition: all 0.15s; }
        .presence-chip.active { background: rgba(168,155,255,0.1); border-color: var(--aether); color: var(--text); }
        .dash-grid { display: grid; grid-template-columns: 240px 1fr 260px; gap: 1.5rem; }
        .dash-sidebar { display: flex; flex-direction: column; gap: 1rem; }
        @media (max-width: 1100px) { .dash-grid { grid-template-columns: 220px 1fr !important; } .dash-sidebar { grid-column: 1 / -1 !important; display: grid !important; grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 700px) { .dash-root { padding: 6.5rem 1.25rem 3rem !important; } .dash-grid { grid-template-columns: 1fr !important; gap: 1.25rem !important; } .dash-sidebar { grid-column: 1 !important; display: flex !important; flex-direction: column !important; } }
      `}</style>

      <div className="dash-root">
        <div style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>Your galaxy</SectionLabel>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,5vw,3.5rem)', fontWeight: 300, lineHeight: 1.1 }}>
            Welcome back,<br /><em style={{ color: 'var(--aether)' }}>{user?.username || 'traveller'}.</em>
          </h1>
        </div>

        {/* Presence chips */}
        <div className="presence-strip">
          {PRESENCE_STATES.map(s => (
            <button key={s.id} className={`presence-chip${presence === s.id ? ' active' : ''}`} onClick={() => updatePresence(s.id)}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, flexShrink: 0, opacity: presence === s.id ? 1 : 0.4, boxShadow: presence === s.id ? `0 0 6px ${s.color}` : 'none', transition: 'all 0.2s' }} />
              {s.label}
            </button>
          ))}
        </div>

        <div className="dash-grid">
          {/* Worlds */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Enter a world</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)' }}>
              {WORLDS.map(w => (
                <Link key={w.id} href={w.href} style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', padding: '0.85rem 1rem', background: 'var(--void)', textDecoration: 'none', transition: 'background 0.2s', opacity: w.status === 'live' ? 1 : 0.4, pointerEvents: w.status === 'live' ? 'auto' : 'none' }}
                  onMouseEnter={e => { if (w.status === 'live')(e.currentTarget as HTMLElement).style.background = 'var(--deep)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--void)' }}
                >
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{w.glyph}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)' }}>{w.phase}</div>
                  </div>
                  {w.status === 'live' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: w.color, flexShrink: 0, boxShadow: `0 0 5px ${w.color}`, animation: 'pulse-soft 2.5s ease-in-out infinite' }} />}
                </Link>
              ))}
            </div>
          </div>

          {/* Galaxy pulse */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Galaxy pulse</div>
            <div style={{ border: '0.5px solid var(--border)', background: 'var(--deep)', borderRadius: '2px' }}>
              {galaxyEvents.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>The galaxy is quiet. Be the first to send a signal.</div>
              ) : galaxyEvents.map((ev, i) => (
                <div key={i} style={{ padding: '1rem 1.1rem', borderBottom: i < galaxyEvents.length - 1 ? '0.5px solid var(--border)' : 'none', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 3, height: 3, borderRadius: '50%', background: ev.color, flexShrink: 0, marginTop: 7, boxShadow: `0 0 4px ${ev.color}` }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(0.85rem,1.8vw,0.95rem)', color: 'var(--text)', lineHeight: 1.4, marginBottom: '0.2rem' }}>{ev.event}</div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: ev.color, opacity: 0.8 }}>{ev.world}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-dim)' }}>{ev.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="dash-sidebar">
            {/* Persona */}
            <div style={{ border: '0.5px solid var(--border-bright)', background: 'var(--deep)', borderRadius: '2px', padding: '1.1rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Active persona</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                Your <span style={{ color: 'var(--aether)', textTransform: 'capitalize' }}>{persona}</span> self is active.
              </div>
              <Link href="/profile" style={{ display: 'inline-block', marginTop: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)', textDecoration: 'none' }}>Manage personas →</Link>
            </div>

            {/* Reputation */}
            <div style={{ border: '0.5px solid var(--border)', background: 'var(--deep)', borderRadius: '2px', padding: '1.1rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Reputation</div>
              {REP_FIELDS.map(r => (
                <div key={r.key} style={{ marginBottom: '0.55rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>{r.key}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: r.color }}>{rep?.[r.key] ?? 0}</span>
                  </div>
                  <div style={{ height: 1, background: 'var(--border)' }}>
                    <div style={{ height: '100%', width: `${Math.min(rep?.[r.key] ?? 0, 100)}%`, background: r.color, opacity: 0.7 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'The Commons', href: '/commons', color: '#1D9E75' },
                { label: 'The Forge', href: '/forge', color: '#BA7517' },
                { label: 'Factions', href: '/factions', color: '#D85A30' },
                { label: 'Profile', href: '/profile', color: 'var(--aether)' },
              ].map(a => (
                <Link key={a.label} href={a.href} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.08em', textDecoration: 'none', color: a.color, padding: '0.7rem 1rem', border: `0.5px solid ${a.color}33`, borderRadius: '2px', display: 'flex', justifyContent: 'space-between', transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${a.color}11`}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >{a.label} <span>→</span></Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
