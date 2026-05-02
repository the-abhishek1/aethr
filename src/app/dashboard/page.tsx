'use client'
import Link from 'next/link'
import { WORLDS } from '@/lib/constants'
import SectionLabel from '@/components/ui/SectionLabel'
import GettingStarted from '@/components/ui/GettingStarted'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'

const PRESENCE_STATES = [
  { id: 'deep-work', label: 'Deep work',       color: '#1D9E75' },
  { id: 'open',      label: 'Open to connect', color: '#a89bff' },
  { id: 'creating',  label: 'Creating',        color: '#BA7517' },
  { id: 'exploring', label: 'Exploring',       color: '#378ADD' },
  { id: 'competing', label: 'In the Arena',    color: '#D85A30' },
  { id: 'resting',   label: 'Resting',         color: '#444441' },
]

const REP_FIELDS = [
  { key: 'wisdom',     color: '#a89bff' },
  { key: 'creativity', color: '#d4b896' },
  { key: 'discovery',  color: '#1D9E75' },
  { key: 'trust',      color: '#378ADD' },
  { key: 'legacy',     color: '#888780' },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [presence, setPresence] = useState('open')
  const [signals, setSignals]   = useState<any[]>([])
  const [rep, setRep]           = useState<any>(null)
  const [persona, setPersona]   = useState('creator')

  const loadData = useCallback(async () => {
    try {
      const [presRes, profRes, sigRes] = await Promise.all([
        fetch('/api/presence'),
        fetch('/api/profile'),
        fetch('/api/signals?limit=6'),
      ])
      const [presData, profData, sigData] = await Promise.all([
        presRes.json(), profRes.json(), sigRes.json()
      ])
      if (presData.presence?.state) setPresence(presData.presence.state)
      if (profData.user?.reputation)  setRep(profData.user.reputation)
      if (profData.user?.personas?.[0]) setPersona(profData.user.personas[0].type)
      setSignals(sigData.signals || [])
    } catch {}
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

  const galaxyEvents = signals.map(s => ({
    time: new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    world: s.worldId,
    event: `@${s.author?.username}: ${s.content.slice(0, 65)}${s.content.length > 65 ? '…' : ''}`,
    color: '#1D9E75',
  }))

  const totalRep = rep ? REP_FIELDS.reduce((s, r) => s + (rep[r.key] || 0), 0) : 0

  return (
    <>
      <style>{`
        .dash-root { padding: 7rem 2rem 4rem; }
        .presence-strip { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.25rem; margin-bottom: 2rem; scrollbar-width: none; flex-wrap: wrap; }
        .presence-strip::-webkit-scrollbar { display: none; }
        .pchip { display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.45rem 0.9rem; border-radius: 99px; border: 0.5px solid var(--border); background: transparent; cursor: none; white-space: nowrap; font-family: var(--font-mono); font-size: 0.6rem; color: var(--text-dim); transition: all 0.15s; }
        .pchip.active { background: rgba(168,155,255,0.1); border-color: var(--aether); color: var(--text); }
        .dash-grid { display: grid; grid-template-columns: 220px 1fr 250px; gap: 1.5rem; }
        .dash-sidebar { display: flex; flex-direction: column; gap: 1rem; }
        @media (max-width: 1100px) {
          .dash-grid { grid-template-columns: 200px 1fr !important; }
          .dash-sidebar { grid-column: 1/-1 !important; display: grid !important; grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 700px) {
          .dash-root { padding: 6.5rem 1.25rem 3rem !important; }
          .dash-grid { grid-template-columns: 1fr !important; gap: 1.25rem !important; }
          .dash-sidebar { grid-column: 1 !important; display: flex !important; flex-direction: column !important; }
        }
      `}</style>

      <div className="dash-root">
        {/* Header */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <SectionLabel>Your galaxy</SectionLabel>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 300, lineHeight: 1.1 }}>
              Welcome back,<br /><em style={{ color: 'var(--aether)' }}>{user?.username || 'traveller'}.</em>
            </h1>
          </div>
          {totalRep > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 300, color: 'var(--aether)', lineHeight: 1 }}>{totalRep}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Total rep</div>
            </div>
          )}
        </div>

        {/* Getting started checklist */}
        <GettingStarted />

        {/* Presence chips */}
        <div className="presence-strip">
          {PRESENCE_STATES.map(s => (
            <button key={s.id} className={`pchip${presence === s.id ? ' active' : ''}`} onClick={() => updatePresence(s.id)}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, flexShrink: 0, opacity: presence === s.id ? 1 : 0.4, boxShadow: presence === s.id ? `0 0 6px ${s.color}` : 'none', transition: 'all 0.2s' }} />
              {s.label}
            </button>
          ))}
        </div>

        <div className="dash-grid">
          {/* Worlds */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Worlds</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)' }}>
              {WORLDS.map(w => (
                <Link key={w.id} href={w.href} style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', padding: '0.8rem 1rem', background: 'var(--void)', textDecoration: 'none', transition: 'background 0.15s', opacity: w.status === 'live' ? 1 : 0.4 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--deep)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--void)' }}
                >
                  <span style={{ fontSize: '0.95rem', flexShrink: 0 }}>{w.glyph}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--text-dim)' }}>{w.phase}</div>
                  </div>
                  {w.status === 'live' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: w.color, flexShrink: 0, boxShadow: `0 0 5px ${w.color}`, animation: 'pulse-soft 2.5s ease-in-out infinite' }} />}
                </Link>
              ))}
            </div>
          </div>

          {/* Galaxy pulse */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Galaxy pulse</div>
            <div style={{ border: '0.5px solid var(--border)', background: 'var(--deep)', borderRadius: '2px' }}>
              {galaxyEvents.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📡</div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>The galaxy is quiet.</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>Be the first to drop a signal.</p>
                  <Link href="/commons" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--aether)', border: '0.5px solid rgba(168,155,255,0.3)', padding: '0.6rem 1.25rem', borderRadius: '2px' }}>Go to The Commons →</Link>
                </div>
              ) : galaxyEvents.map((ev, i) => (
                <div key={i} style={{ padding: '0.9rem 1.1rem', borderBottom: i < galaxyEvents.length - 1 ? '0.5px solid var(--border)' : 'none', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 3, height: 3, borderRadius: '50%', background: ev.color, flexShrink: 0, marginTop: 7, boxShadow: `0 0 4px ${ev.color}` }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.4, marginBottom: '0.2rem' }}>{ev.event}</div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: ev.color, opacity: 0.8, textTransform: 'capitalize' }}>{ev.world}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)' }}>{ev.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="dash-sidebar">
            {/* Persona */}
            <div style={{ border: '0.5px solid var(--border-bright)', background: 'var(--deep)', borderRadius: '2px', padding: '1rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.6rem' }}>Active persona</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--aether)', textTransform: 'capitalize', marginBottom: '0.25rem' }}>{persona}</div>
              <Link href="/profile" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)', textDecoration: 'none' }}>Manage →</Link>
            </div>

            {/* Rep */}
            <div style={{ border: '0.5px solid var(--border)', background: 'var(--deep)', borderRadius: '2px', padding: '1rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Reputation</div>
              {rep ? REP_FIELDS.map(r => (
                <div key={r.key} style={{ marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.18rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>{r.key}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: r.color }}>{rep[r.key] || 0}</span>
                  </div>
                  <div style={{ height: 1, background: 'var(--border)' }}>
                    <div style={{ height: '100%', width: `${Math.min(rep[r.key] || 0, 100)}%`, background: r.color, opacity: 0.7 }} />
                  </div>
                </div>
              )) : (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)', lineHeight: 1.8 }}>
                  Start participating to earn rep.
                </p>
              )}
            </div>

            {/* Quick links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { label: 'The Commons', href: '/commons',   color: '#1D9E75' },
                { label: 'The Forge',   href: '/forge',     color: '#BA7517' },
                { label: 'The Arena',   href: '/arena',     color: '#D85A30' },
                { label: 'Factions',    href: '/factions',  color: '#a89bff' },
                { label: 'Galaxy TV',   href: '/galaxy-tv', color: 'var(--gold)' },
              ].map(a => (
                <Link key={a.label} href={a.href} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.06em', textDecoration: 'none', color: a.color, padding: '0.6rem 0.9rem', border: `0.5px solid ${a.color}22`, borderRadius: '2px', display: 'flex', justifyContent: 'space-between', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${a.color}0d`}
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
