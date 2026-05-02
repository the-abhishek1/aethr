'use client'
import { useState } from 'react'
import SectionLabel from '@/components/ui/SectionLabel'

const presenceMap = [
  { name: 'Lyra', state: 'creating', color: '#BA7517', x: '22%', y: '35%', size: 48 },
  { name: 'Kael', state: 'deep-work', color: '#1D9E75', x: '58%', y: '28%', size: 36 },
  { name: 'Nova', state: 'open', color: '#a89bff', x: '70%', y: '55%', size: 44 },
  { name: 'Ryn', state: 'exploring', color: '#378ADD', x: '38%', y: '62%', size: 32 },
  { name: 'Sol', state: 'resting', color: '#444441', x: '15%', y: '68%', size: 28 },
  { name: 'Aer', state: 'open', color: '#a89bff', x: '82%', y: '33%', size: 34 },
]
const rooms = [
  { name: 'Midnight Builders', members: 14, age: '1 year', lastActive: '2m ago', color: '#1D9E75' },
  { name: 'Late Nights', members: 8, age: '6mo', lastActive: '1h ago', color: '#a89bff' },
  { name: 'Philosophy at 3am', members: 23, age: '8mo', lastActive: '4h ago', color: '#d4b896' },
  { name: 'The Wanderers', members: 5, age: '2mo', lastActive: 'Yesterday', color: '#378ADD' },
]

export default function CommonsPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [mood, setMood] = useState('open')

  return (
    <>
      <style>{`
        .commons-layout { display: grid; grid-template-columns: 1fr 300px; height: calc(100vh - 260px); }
        .commons-map { position: relative; border-right: 0.5px solid var(--border); min-height: 320px; }
        .mood-bar { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        @media (max-width: 768px) {
          .commons-layout { grid-template-columns: 1fr !important; height: auto !important; }
          .commons-map { height: 320px; border-right: none !important; border-bottom: 0.5px solid var(--border); }
          .mood-bar { gap: 0.35rem; }
          .commons-header { flex-direction: column !important; align-items: flex-start !important; gap: 1rem !important; }
        }
      `}</style>

      <div style={{ paddingTop: '7rem' }}>
        {/* Header */}
        <div className="commons-header" style={{ padding: '0 1.5rem 2rem', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem' }}>
          <div>
            <SectionLabel>World I</SectionLabel>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,6vw,4rem)', fontWeight: 300, lineHeight: 0.95 }}>🌿 The Commons</h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>7 people present · Ambient, quiet</p>
          </div>
          <div className="mood-bar">
            {['open','creating','exploring','deep-work'].map(m => (
              <button key={m} onClick={() => setMood(m)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.08em', padding: '0.4rem 0.8rem', borderRadius: '2px', cursor: 'none', border: `0.5px solid ${mood===m?'var(--commons)':'var(--border)'}`, background: mood===m?'rgba(29,158,117,0.1)':'transparent', color: mood===m?'#1D9E75':'var(--text-dim)', textTransform: 'capitalize' }}>{m.replace('-',' ')}</button>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="commons-layout">
          {/* Presence map */}
          <div className="commons-map">
            <div style={{ position: 'absolute', top: '1rem', left: '1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Presence map</div>
            {[180,260,340].map(r => (
              <div key={r} style={{ position: 'absolute', top: '50%', left: '45%', width: r, height: r, borderRadius: '50%', border: '0.5px solid var(--border)', transform: 'translate(-50%,-50%)', opacity: 0.35, pointerEvents: 'none' }} />
            ))}
            {presenceMap.map(p => (
              <div key={p.name} onClick={() => setSelected(selected===p.name?null:p.name)} style={{ position: 'absolute', left: p.x, top: p.y, cursor: 'none', transform: 'translate(-50%,-50%)', zIndex: 2 }}>
                <div style={{ width: p.size, height: p.size, borderRadius: '50%', background: 'var(--surface)', border: `0.5px solid ${selected===p.name?p.color:p.color+'44'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: p.size*0.38, boxShadow: `0 0 ${selected===p.name?16:6}px ${p.color}${selected===p.name?'66':'22'}`, transition: 'all 0.25s', position: 'relative' }}>
                  {p.name[0]}
                  <div style={{ position: 'absolute', bottom: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: p.color, border: '1.5px solid var(--void)', boxShadow: `0 0 5px ${p.color}` }} />
                </div>
                {selected===p.name && (
                  <div style={{ position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)', background: 'var(--deep)', border: '0.5px solid var(--border-bright)', borderRadius: '2px', padding: '0.4rem 0.75rem', whiteSpace: 'nowrap', zIndex: 10 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)' }}>{p.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: p.color, textTransform: 'capitalize' }}>{p.state.replace('-',' ')}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Memory rooms */}
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Memory rooms</div>
              {rooms.map(r => (
                <div key={r.name} style={{ padding: '0.75rem 0', borderBottom: '0.5px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)' }}>{r.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-dim)' }}>{r.lastActive}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: r.color }}>{r.members} members</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)' }}>{r.age}</span>
                  </div>
                </div>
              ))}
              <button style={{ width: '100%', marginTop: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.6rem', border: '0.5px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', borderRadius: '2px', cursor: 'none' }}>+ Create memory room</button>
            </div>

            {/* Whispers */}
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Ambient whispers</div>
              {[
                { from: 'Lyra', msg: 'just started something new', time: '1m', color: '#BA7517' },
                { from: 'Nova', msg: 'open to connect', time: '3m', color: '#a89bff' },
                { from: 'Kael', msg: 'deep in thought', time: '8m', color: '#1D9E75' },
              ].map((w,i) => (
                <div key={i} style={{ padding: '0.65rem 0', borderBottom: '0.5px solid var(--border)' }}>
                  <span style={{ color: w.color, fontFamily: 'var(--font-display)', fontSize: '0.95rem' }}>{w.from}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text-muted)' }}> {w.msg}</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>{w.time} ago</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
