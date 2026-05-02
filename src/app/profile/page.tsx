'use client'
import { useState } from 'react'
import SectionLabel from '@/components/ui/SectionLabel'
import { PERSONAS, PRESENCE_STATES } from '@/lib/constants'

const repScores = [
  { label: 'Wisdom', value: 72, color: '#a89bff', change: '+3 this week' },
  { label: 'Creativity', value: 88, color: '#d4b896', change: '+12 this week' },
  { label: 'Discovery', value: 45, color: '#1D9E75', change: '+1 this week' },
  { label: 'Trust', value: 93, color: '#378ADD', change: 'Stable' },
  { label: 'Debate', value: 61, color: '#D85A30', change: '+7 this week' },
  { label: 'Legacy', value: 29, color: '#888780', change: 'Growing' },
]
const timeline = [
  { date: 'Today', events: ['Performed live in The Forge — 89 attended', 'Memory Room "Late Nights" hit 6 months'] },
  { date: 'Yesterday', events: ['Won debate in The Arena — +7 Debate rep', "Discovery rippled across The Deep — 142 reached"] },
  { date: '3 days ago', events: ['Created "Nebula Study" — 312 views', 'Joined faction "The Builders"'] },
]

export default function ProfilePage() {
  const [activePersona, setActivePersona] = useState('creative')

  return (
    <>
      <style>{`
        .profile-header { display: flex; gap: 2rem; align-items: flex-start; margin-bottom: 3rem; flex-wrap: wrap; }
        .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .rep-badge { min-width: 180px; }
        @media (max-width: 768px) {
          .profile-header { gap: 1.25rem; }
          .profile-grid { grid-template-columns: 1fr !important; }
          .rep-badge { width: 100%; min-width: unset; }
          .profile-pad { padding: 6rem 1.25rem 3rem !important; }
          .persona-name { font-size: clamp(2rem,8vw,3.5rem) !important; }
        }
      `}</style>

      <div className="profile-pad" style={{ paddingTop: '7rem', paddingBottom: '4rem', padding: '7rem 2rem 4rem' }}>
        <div className="profile-header">
          {/* Avatar */}
          <div style={{ flexShrink: 0, textAlign: 'center' }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', border: '0.5px solid var(--border-bright)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', marginBottom: '0.6rem', position: 'relative' }}>
              ⚗️
              <div style={{ position: 'absolute', bottom: 4, right: 4, width: 14, height: 14, borderRadius: '50%', background: '#a89bff', border: '2px solid var(--void)', boxShadow: '0 0 8px #a89bff' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--aether)' }}>Creating</div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <SectionLabel>Your identity</SectionLabel>
            <h1 className="persona-name" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem,6vw,4rem)', fontWeight: 300, lineHeight: 1, marginBottom: '0.4rem' }}>0xIdiot</h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Founding member · Joined Day 1 · The Forge native</p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {PERSONAS.map(p => (
                <button key={p.id} onClick={() => setActivePersona(p.id)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.06em', padding: '0.3rem 0.8rem', borderRadius: '2px', cursor: 'none', background: 'transparent', border: `0.5px solid ${activePersona===p.id?p.color:'var(--border)'}`, color: activePersona===p.id?p.color:'var(--text-dim)', transition: 'all 0.15s' }}>{p.name}</button>
              ))}
            </div>
          </div>

          {/* Portable rep */}
          <div className="rep-badge" style={{ border: '0.5px solid var(--border-bright)', borderRadius: '2px', padding: '1.25rem', background: 'var(--deep)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.6rem' }}>Portable reputation</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 300, color: 'var(--aether)', lineHeight: 1, marginBottom: '0.2rem' }}>681</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Total rep score</div>
            <div style={{ padding: '0.4rem 0.7rem', border: '0.5px solid var(--border)', borderRadius: '2px', fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)' }}>Exportable to any protocol</div>
          </div>
        </div>

        <div className="profile-grid">
          {/* Rep breakdown */}
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', padding: '1.5rem', background: 'var(--deep)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>Reputation breakdown</div>
            {repScores.map(r => (
              <div key={r.label} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>{r.label}</span>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)' }}>{r.change}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: r.color, fontWeight: 500 }}>{r.value}</span>
                  </div>
                </div>
                <div style={{ height: 2, background: 'var(--border)', borderRadius: 1 }}>
                  <div style={{ height: '100%', width: r.value+'%', background: r.color, borderRadius: 1, opacity: 0.8 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', padding: '1.5rem', background: 'var(--deep)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>Your galaxy timeline</div>
            {timeline.map((t,i) => (
              <div key={i} style={{ marginBottom: '1.5rem', paddingLeft: '1rem', borderLeft: '0.5px solid var(--border)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--aether)', marginBottom: '0.4rem', opacity: 0.8 }}>{t.date}</div>
                {t.events.map((ev,j) => (
                  <div key={j} style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.3rem' }}>— {ev}</div>
                ))}
              </div>
            ))}
          </div>

          {/* Presence */}
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', padding: '1.5rem', background: 'var(--deep)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1.1rem' }}>Presence aura</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {PRESENCE_STATES.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.55rem 0.75rem', border: '0.5px solid var(--border)', borderRadius: '2px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', flex: 1 }}>{s.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)' }}>{s.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Memory rooms */}
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', padding: '1.5rem', background: 'var(--deep)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1.1rem' }}>Memory rooms</div>
            {[
              { name: 'Late Nights', members: 8, age: '6 months', color: '#a89bff' },
              { name: 'Midnight Builders', members: 14, age: '1 year', color: '#1D9E75' },
              { name: 'The Wanderers', members: 5, age: '2 months', color: '#d4b896' },
            ].map(r => (
              <div key={r.name} style={{ padding: '0.8rem 0', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', border: `0.5px solid ${r.color}55`, background: `${r.color}11`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>🏛️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)' }}>{r.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)' }}>{r.members} members · {r.age}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
