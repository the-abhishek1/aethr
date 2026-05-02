'use client'
import { useState } from 'react'
import SectionLabel from '@/components/ui/SectionLabel'

const liveEvents = [
  { id: 1, creator: 'Lyra', title: 'Nebula Study Vol. 4', type: 'Music', listeners: 142, tips: '₳ 234', color: '#BA7517', live: true },
  { id: 2, creator: 'Mira', title: 'Drawing the Void', type: 'Visual art', listeners: 67, tips: '₳ 89', color: '#a89bff', live: true },
]
const recentCreations = [
  { creator: 'Kael', title: 'On the nature of emergence', type: 'Essay', views: 312, color: '#378ADD' },
  { creator: 'Sol', title: 'Fractal garden #7', type: 'Digital art', views: 544, color: '#1D9E75' },
  { creator: 'Ryn', title: 'Midnight protocol', type: 'Music', views: 189, color: '#D85A30' },
  { creator: 'Aer', title: 'Architecture of feeling', type: 'Essay', views: 423, color: '#d4b896' },
  { creator: 'Nova', title: 'Signal loss', type: 'Visual art', views: 267, color: '#a89bff' },
  { creator: 'Lyra', title: 'Nebula Study Vol. 3', type: 'Music', views: 891, color: '#BA7517' },
]
const contextTips = [
  { emoji: '🧠', label: 'Changed my mind', count: 48 },
  { emoji: '😂', label: 'Made me laugh', count: 134 },
  { emoji: '💙', label: 'Not alone', count: 67 },
  { emoji: '✨', label: 'Best of year', count: 23 },
]

export default function ForgePage() {
  const [activeTab, setActiveTab] = useState('live')
  const [selected, setSelected] = useState(liveEvents[0])
  const [tipSent, setTipSent] = useState(false)

  return (
    <>
      <style>{`
        .forge-layout { display: grid; grid-template-columns: 1fr 360px; }
        .forge-detail { border-left: 0.5px solid var(--border); }
        .live-grid { grid-template-columns: 1fr 1fr !important; }
        .creations-grid { grid-template-columns: repeat(3,1fr) !important; }
        @media (max-width: 1024px) {
          .forge-layout { grid-template-columns: 1fr !important; }
          .forge-detail { border-left: none !important; border-top: 0.5px solid var(--border) !important; }
        }
        @media (max-width: 768px) {
          .forge-header { flex-direction: column !important; align-items: flex-start !important; gap: 1rem !important; }
          .live-grid { grid-template-columns: 1fr !important; }
          .creations-grid { grid-template-columns: 1fr 1fr !important; }
          .forge-pad { padding: 1.25rem !important; }
        }
        @media (max-width: 480px) {
          .creations-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ paddingTop: '7rem' }}>
        {/* Header */}
        <div className="forge-header" style={{ padding: '0 1.5rem 2rem', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem' }}>
          <div>
            <SectionLabel>World I</SectionLabel>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,6vw,4rem)', fontWeight: 300, lineHeight: 0.95 }}>🔥 The Forge</h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>2 live performances · 6 new creations today</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['live','recent','trending'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'capitalize', padding: '0.4rem 0.9rem', borderRadius: '2px', cursor: 'none', background: activeTab===t?'rgba(186,117,23,0.12)':'transparent', border: `0.5px solid ${activeTab===t?'#BA7517':'var(--border)'}`, color: activeTab===t?'#BA7517':'var(--text-dim)' }}>{t}</button>
            ))}
          </div>
        </div>

        <div className="forge-layout">
          {/* Left */}
          <div className="forge-pad" style={{ padding: '1.5rem 2rem' }}>
            {/* Live now */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D85A30', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D85A30', animation: 'pulse-soft 1.5s infinite' }} /> Live now
              </div>
              <div className="live-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)' }}>
                {liveEvents.map(ev => (
                  <div key={ev.id} onClick={() => setSelected(ev)} style={{ padding: '1.5rem', background: selected.id===ev.id?'var(--mid)':'var(--void)', cursor: 'none', borderBottom: selected.id===ev.id?`2px solid ${ev.color}`:'2px solid transparent', transition: 'background 0.2s' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: ev.color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{ev.type}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1rem,2.5vw,1.3rem)', color: 'var(--text)', marginBottom: '0.25rem' }}>{ev.title}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>by {ev.creator}</div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)' }}>{ev.listeners} listening</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: ev.color }}>{ev.tips} tipped</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Creations grid */}
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1rem' }}>Recent creations</div>
              <div className="creations-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)' }}>
                {recentCreations.map(c => (
                  <div key={c.title} style={{ padding: '1.25rem', background: 'var(--void)', transition: 'background 0.2s', cursor: 'none' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='var(--deep)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='var(--void)'}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: c.color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{c.type}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(0.9rem,2vw,1.05rem)', color: 'var(--text)', marginBottom: '0.2rem', lineHeight: 1.3 }}>{c.title}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>by {c.creator}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)' }}>{c.views} views</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right detail */}
          <div className="forge-detail forge-pad" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ border: `0.5px solid ${selected.color}44`, borderRadius: '2px', padding: '1.25rem', background: `${selected.color}08` }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: selected.color, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: selected.color, animation: 'pulse-soft 1.5s infinite' }} /> Live · {selected.type}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem,3vw,1.6rem)', fontWeight: 400, color: 'var(--text)', marginBottom: '0.2rem' }}>{selected.title}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>by {selected.creator}</div>
              <div style={{ height: 2, background: 'var(--border)', borderRadius: 1, marginBottom: '1rem', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '60%', background: selected.color, borderRadius: 1, opacity: 0.7, animation: 'pulse-soft 2s ease-in-out infinite' }} />
              </div>
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)' }}>{selected.listeners} listening</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: selected.color }}>{selected.tips} tipped</span>
              </div>
            </div>

            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Tip with context</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {contextTips.map(t => (
                  <button key={t.label} onClick={() => { setTipSent(true); setTimeout(() => setTipSent(false), 2000) }} style={{ padding: '0.75rem', border: '0.5px solid var(--border)', background: 'var(--deep)', borderRadius: '2px', cursor: 'none', textAlign: 'left', transition: 'all 0.2s' }}
                    onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.borderColor=selected.color+'55'; el.style.background=selected.color+'08' }}
                    onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.borderColor='var(--border)'; el.style.background='var(--deep)' }}
                  >
                    <div style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{t.emoji}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.57rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{t.label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>{t.count} sent</div>
                  </button>
                ))}
              </div>
              {tipSent && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: selected.color, textAlign: 'center', padding: '0.5rem', animation: 'fadeIn 0.3s ease' }}>✦ Tip sent with meaning</div>}
            </div>

            <div style={{ marginTop: 'auto', padding: '1.25rem', border: '0.5px solid var(--border)', borderRadius: '2px', background: 'var(--deep)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Ready to create?</div>
              <button style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.85rem', background: 'rgba(186,117,23,0.15)', border: '0.5px solid #BA751766', color: '#BA7517', borderRadius: '2px', cursor: 'none' }}>Schedule a performance →</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
