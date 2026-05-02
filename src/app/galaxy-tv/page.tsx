'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import SectionLabel from '@/components/ui/SectionLabel'

export default function GalaxyTVPage() {
  const [digest, setDigest] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/galaxy-tv')
      .then(r => r.json())
      .then(d => { setDigest(d); setLoading(false) })
  }, [])

  return (
    <>
      <style>{`
        .gtv-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 1px; background: var(--border); border: 0.5px solid var(--border); }
        @media (max-width: 768px) { .gtv-grid { grid-template-columns: 1fr !important; } .gtv-pad { padding: 6rem 1.25rem 3rem !important; } }
      `}</style>

      <div className="gtv-pad" style={{ padding: '7rem 2rem 4rem', maxWidth: 900, margin: '0 auto' }}>
        <SectionLabel>Galaxy TV</SectionLabel>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem,6vw,5rem)', fontWeight: 300, lineHeight: 0.95, marginBottom: '0.75rem' }}>
          📺 The Daily<br /><em style={{ color: 'var(--gold)' }}>Galaxy Digest</em>
        </h1>

        {loading ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', padding: '4rem', textAlign: 'center' }}>Compiling the galaxy's story...</div>
        ) : (
          <>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '3rem' }}>{digest?.date} · Everything that happened in Aethr in the last 24 hours.</p>

            {/* Stats bar */}
            {digest?.stats && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '3rem', padding: '1.25rem', border: '0.5px solid var(--border)', borderRadius: '2px', background: 'var(--deep)' }}>
                {[
                  { label: 'Signals', val: digest.stats.signals, color: '#1D9E75' },
                  { label: 'Tips', val: digest.stats.tips, color: '#BA7517' },
                  { label: 'Debates', val: digest.stats.debates, color: '#D85A30' },
                  { label: 'Discoveries', val: digest.stats.discoveries, color: '#378ADD' },
                  { label: 'Factions', val: digest.stats.factions, color: '#a89bff' },
                  { label: 'Mysteries solved', val: digest.stats.mysteriesSolved, color: '#7F77DD' },
                ].map(s => (
                  <div key={s.label} style={{ flex: '1 1 100px', textAlign: 'center', padding: '0.5rem' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: s.color, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.3rem' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {digest?.empty ? (
              <div style={{ textAlign: 'center', padding: '4rem', border: '0.5px solid var(--border)', borderRadius: '2px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📺</div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>The galaxy was quiet today.</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '2rem' }}>Be the first to make something happen.</p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {[{ label: 'Drop a signal', href: '/commons' }, { label: 'Make a discovery', href: '/the-deep' }, { label: 'Open a debate', href: '/arena' }].map(a => (
                    <Link key={a.label} href={a.href} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--aether)', border: '0.5px solid rgba(168,155,255,0.3)', padding: '0.6rem 1.25rem', borderRadius: '2px' }}>{a.label} →</Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="gtv-grid">
                {digest?.segments?.map((seg: any, i: number) => (
                  <div key={i} style={{ background: 'var(--void)', padding: '2rem', transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--deep)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--void)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>{seg.icon}</span>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text)', lineHeight: 1 }}>{seg.title}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.1em', color: seg.color, marginTop: '0.15rem' }}>{seg.world}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {seg.items?.map((item: any, j: number) => (
                        <div key={j} style={{ padding: '0.65rem 0', borderBottom: j < seg.items.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
                          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.text}</p>
                          {item.stats && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>{item.stats}</div>}
                          {item.ripples > 0 && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: seg.color, marginTop: '0.2rem' }}>{item.ripples} ripples</div>}
                          {item.mood && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--text-dim)', padding: '0.1rem 0.4rem', border: '0.5px solid var(--border)', borderRadius: '99px' }}>{item.mood}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
