'use client'
import Link from 'next/link'
import { WORLDS, PRESENCE_STATES } from '@/lib/constants'
import SectionLabel from '@/components/ui/SectionLabel'
import { useState } from 'react'

const recentEvents = [
  { time: '2m ago', world: 'The Forge', event: 'Lyra dropped a live set — 142 listening', color: '#BA7517' },
  { time: '8m ago', world: 'The Arena', event: 'Faction war: Builders vs Wanderers — Round 3 starting', color: '#D85A30' },
  { time: '14m ago', world: 'The Void', event: 'New mystery dropped — 38 explorers entered', color: '#7F77DD' },
  { time: '31m ago', world: 'The Deep', event: "Kael's discovery on consciousness rippled — 220 reached", color: '#378ADD' },
  { time: '1h ago', world: 'The Commons', event: 'Memory Room "Midnight Builders" hit 1 year old', color: '#1D9E75' },
]

export default function DashboardPage() {
  const [presence, setPresence] = useState('open')
  const [persona, setPersona] = useState('creative')

  return (
    <>
      <style>{`
        .dash-root { padding: 7rem 2rem 4rem; }

        /* ── Presence strip (mobile: horizontal scroll) ── */
        .presence-strip {
          display: flex; gap: 0.5rem; overflow-x: auto;
          padding: 1rem 1.25rem; margin: 0 -2rem 2rem;
          border-top: 0.5px solid var(--border);
          border-bottom: 0.5px solid var(--border);
          scrollbar-width: none;
        }
        .presence-strip::-webkit-scrollbar { display: none; }
        .presence-chip {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.45rem 0.9rem; border-radius: 99px;
          border: 0.5px solid var(--border);
          background: transparent; cursor: none;
          white-space: nowrap; flex-shrink: 0;
          font-family: var(--font-mono); font-size: 0.6rem;
          color: var(--text-dim); transition: all 0.15s;
        }
        .presence-chip.active {
          background: rgba(168,155,255,0.1);
          border-color: var(--aether);
          color: var(--text);
        }

        /* ── Main grid ── */
        .dash-grid {
          display: grid;
          grid-template-columns: 240px 1fr 260px;
          gap: 1.5rem;
        }

        /* ── Sidebar (right col) ── */
        .dash-sidebar { display: flex; flex-direction: column; gap: 1rem; }

        /* ── Tablet: collapse right sidebar under ── */
        @media (max-width: 1100px) {
          .dash-grid {
            grid-template-columns: 220px 1fr !important;
          }
          .dash-sidebar {
            grid-column: 1 / -1 !important;
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 1rem !important;
          }
        }

        /* ── Mobile: full single column ── */
        @media (max-width: 700px) {
          .dash-root { padding: 6.5rem 1.25rem 3rem !important; }
          .dash-grid {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }
          .dash-sidebar {
            grid-column: 1 !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .worlds-col { order: 2; }
          .pulse-col  { order: 1; }
          .dash-sidebar { order: 3; }
        }
      `}</style>

      <div className="dash-root">

        {/* ── Hero ── */}
        <div style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>Your galaxy</SectionLabel>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,5vw,3.5rem)', fontWeight: 300, lineHeight: 1.1 }}>
            Welcome back,<br /><em style={{ color: 'var(--aether)' }}>traveller.</em>
          </h1>
        </div>

        {/* ── Presence — horizontal chip strip on all sizes ── */}
        <div className="presence-strip">
          {PRESENCE_STATES.map(s => (
            <button key={s.id} className={`presence-chip${presence===s.id?' active':''}`} onClick={() => setPresence(s.id)}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, flexShrink: 0, opacity: presence===s.id?1:0.4, boxShadow: presence===s.id?`0 0 6px ${s.color}`:'none', transition: 'all 0.2s' }} />
              {s.label}
            </button>
          ))}
        </div>

        {/* ── Main 3-col grid ── */}
        <div className="dash-grid">

          {/* Col 1 — Worlds list */}
          <div className="worlds-col">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Enter a world</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)' }}>
              {WORLDS.map(w => (
                <Link key={w.id} href={w.href} style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', padding: '0.85rem 1rem', background: 'var(--void)', textDecoration: 'none', transition: 'background 0.2s', opacity: w.status==='live'?1:0.4, pointerEvents: w.status==='live'?'auto':'none' }}
                  onMouseEnter={e => { if(w.status==='live')(e.currentTarget as HTMLElement).style.background='var(--deep)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='var(--void)' }}
                >
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{w.glyph}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)' }}>{w.phase}</div>
                  </div>
                  {w.status==='live' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: w.color, flexShrink: 0, boxShadow: `0 0 5px ${w.color}`, animation: 'pulse-soft 2.5s ease-in-out infinite' }} />}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 2 — Galaxy pulse */}
          <div className="pulse-col">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Galaxy pulse</div>
            <div style={{ border: '0.5px solid var(--border)', background: 'var(--deep)', borderRadius: '2px' }}>
              {recentEvents.map((ev,i) => (
                <div key={i} style={{ padding: '1rem 1.1rem', borderBottom: i<recentEvents.length-1?'0.5px solid var(--border)':'none', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
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

          {/* Col 3 — Sidebar (persona + rep + actions) */}
          <div className="dash-sidebar">

            {/* Persona switcher */}
            <div style={{ border: '0.5px solid var(--border-bright)', background: 'var(--deep)', borderRadius: '2px', padding: '1.1rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Active persona</div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {['creative','work','explorer','social'].map(p => (
                  <button key={p} onClick={() => setPersona(p)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.06em', textTransform: 'capitalize', padding: '0.3rem 0.7rem', borderRadius: '2px', cursor: 'none', background: persona===p?'var(--aether-dim)':'transparent', border: `0.5px solid ${persona===p?'var(--aether)':'var(--border)'}`, color: persona===p?'var(--aether)':'var(--text-dim)', transition: 'all 0.15s' }}>{p}</button>
                ))}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                Your <span style={{ color: 'var(--aether)' }}>{persona}</span> self is active.
              </div>
            </div>

            {/* Reputation */}
            <div style={{ border: '0.5px solid var(--border)', background: 'var(--deep)', borderRadius: '2px', padding: '1.1rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Reputation</div>
              {[
                {label:'Wisdom',v:72,c:'#a89bff'},
                {label:'Creativity',v:88,c:'#d4b896'},
                {label:'Discovery',v:45,c:'#1D9E75'},
                {label:'Trust',v:93,c:'#378ADD'},
                {label:'Legacy',v:29,c:'#888780'},
              ].map(r => (
                <div key={r.label} style={{ marginBottom: '0.55rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)' }}>{r.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: r.c }}>{r.v}</span>
                  </div>
                  <div style={{ height: 1, background: 'var(--border)' }}>
                    <div style={{ height: '100%', width: r.v+'%', background: r.c, opacity: 0.7 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                {label:'Enter The Commons', href:'/commons', color:'#1D9E75'},
                {label:'Enter The Forge',   href:'/forge',   color:'#BA7517'},
                {label:'View profile',       href:'/profile', color:'var(--aether)'},
              ].map(a => (
                <Link key={a.label} href={a.href} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.08em', textDecoration: 'none', color: a.color, padding: '0.7rem 1rem', border: `0.5px solid ${a.color}33`, borderRadius: '2px', display: 'flex', justifyContent: 'space-between', transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background=`${a.color}11`}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='transparent'}
                >{a.label} <span>→</span></Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
