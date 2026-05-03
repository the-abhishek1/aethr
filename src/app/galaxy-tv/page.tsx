'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import SectionLabel from '@/components/ui/SectionLabel'

const WORLD_COLORS: Record<string, string> = {
  commons: '#1D9E75', forge: '#BA7517', arena: '#D85A30',
  'the-deep': '#378ADD', 'the-void': '#7F77DD', market: '#639922',
  sanctum: '#a89bff', archive: '#D4537E',
}

function getYTId(url: string) {
  return url?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]
}

function MediaThumb({ url, title }: { url?: string; title: string }) {
  if (!url) return null
  const ytId = getYTId(url)
  if (ytId) return (
    <div style={{ position: 'relative', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem', aspectRatio: '16/9' }}>
      <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>▶</div>
      </div>
    </div>
  )
  if (url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) || url.includes('supabase')) return (
    <div style={{ borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
      <img src={url} alt={title} style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} loading="lazy" />
    </div>
  )
  return null
}

export default function GalaxyTVPage() {
  const [digest, setDigest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    fetch('/api/galaxy-tv')
      .then(r => r.json())
      .then(d => { setDigest(d); setLoading(false) })
  }, [])

  const segments = digest?.segments || []
  const filtered = activeFilter === 'all' ? segments : segments.filter((s: any) => s.type === activeFilter)

  return (
    <>
      <style>{`
        .gtv-pad   { padding: 7rem 2rem 4rem; max-width: 1100px; margin: 0 auto; }
        .gtv-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); border: 0.5px solid var(--border); }
        .gtv-card  { background: var(--void); padding: 1.5rem; transition: background 0.2s; cursor: default; }
        .gtv-card:hover { background: var(--deep); }
        .gtv-hero  { display: grid; grid-template-columns: 2fr 1fr; gap: 1px; }
        .gtv-filters { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 2rem; }
        @media (max-width: 900px) { .gtv-cards { grid-template-columns: 1fr 1fr !important; } .gtv-hero { grid-template-columns: 1fr !important; } }
        @media (max-width: 600px) { .gtv-cards { grid-template-columns: 1fr !important; } .gtv-pad { padding: 6rem 1.25rem 3rem !important; } }
      `}</style>

      <div className="gtv-pad">
        <SectionLabel>Galaxy TV</SectionLabel>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem,6vw,5rem)', fontWeight: 300, lineHeight: 0.95 }}>
              📺 The Daily<br /><em style={{ color: 'var(--gold)' }}>Galaxy Digest</em>
            </h1>
            {digest?.date && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>{digest.date} · Everything that mattered in Aethr today</p>}
          </div>
          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.9rem', border: '0.5px solid rgba(29,158,117,0.4)', borderRadius: '99px', background: 'rgba(29,158,117,0.06)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D9E75', boxShadow: '0 0 6px #1D9E75', display: 'block', animation: 'pulse-soft 2s infinite' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: '#1D9E75', letterSpacing: '0.1em' }}>LIVE</span>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--border)', border: '0.5px solid var(--border)' }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: 'var(--void)', padding: '1.5rem', minHeight: 180 }}>
                <div style={{ height: 120, background: 'var(--deep)', borderRadius: 4, marginBottom: '0.75rem', animation: 'pulse-soft 1.5s infinite' }} />
                <div style={{ height: 14, background: 'var(--deep)', borderRadius: 2, marginBottom: '0.4rem', width: '70%', animation: 'pulse-soft 1.5s infinite' }} />
                <div style={{ height: 10, background: 'var(--deep)', borderRadius: 2, width: '40%', animation: 'pulse-soft 1.5s infinite' }} />
              </div>
            ))}
          </div>
        ) : digest?.empty ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', border: '0.5px solid var(--border)', borderRadius: '2px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📺</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>The galaxy was quiet today.</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '2rem' }}>Be the first to make something happen.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[{ l: '📡 Drop a signal', h: '/commons' }, { l: '🔭 Share a discovery', h: '/the-deep' }, { l: '⚔️ Open a debate', h: '/arena' }, { l: '🌑 Create a mystery', h: '/the-void' }].map(a => (
                <Link key={a.h} href={a.h} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--aether)', border: '0.5px solid rgba(168,155,255,0.3)', padding: '0.65rem 1.25rem', borderRadius: '2px' }}>{a.l} →</Link>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Stats bar */}
            {digest?.stats && (
              <div style={{ display: 'flex', gap: 1, background: 'var(--border)', border: '0.5px solid var(--border)', marginBottom: '2rem' }}>
                {[
                  { label: 'Signals',          val: digest.stats.signals,         color: '#1D9E75' },
                  { label: 'Tips',             val: digest.stats.tips,            color: '#BA7517' },
                  { label: 'Debates',          val: digest.stats.debates,         color: '#D85A30' },
                  { label: 'Discoveries',      val: digest.stats.discoveries,     color: '#378ADD' },
                  { label: 'Mysteries solved', val: digest.stats.mysteriesSolved, color: '#7F77DD' },
                ].map(s => (
                  <div key={s.label} style={{ flex: 1, padding: '1.1rem', background: 'var(--deep)', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: s.color, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.3rem' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Type filters */}
            <div className="gtv-filters">
              {['all', 'signals', 'discoveries', 'debates', 'tips', 'mysteries'].map(f => (
                <button key={f} onClick={() => setActiveFilter(f)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.08em', textTransform: 'capitalize', padding: '0.35rem 0.85rem', borderRadius: '2px', cursor: 'none', background: activeFilter === f ? 'var(--aether-dim)' : 'transparent', border: `0.5px solid ${activeFilter === f ? 'var(--aether)' : 'var(--border)'}`, color: activeFilter === f ? 'var(--aether)' : 'var(--text-dim)', transition: 'all 0.15s' }}>{f}</button>
              ))}
            </div>

            {/* Cards grid */}
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', border: '0.5px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>Nothing in this category today.</div>
            ) : (
              <div className="gtv-cards">
                {filtered.map((seg: any, i: number) => {
                  // Find first item with media
                  const mediaItem = seg.items?.find((it: any) => it.mediaUrl)
                  return (
                    <div key={i} className="gtv-card" style={{ borderTop: `3px solid ${seg.color || 'var(--border)'}` }}>
                      {/* Media thumbnail if available */}
                      {mediaItem && <MediaThumb url={mediaItem.mediaUrl} title={seg.title} />}

                      {/* Segment header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                        <span style={{ fontSize: '1.1rem' }}>{seg.icon}</span>
                        <div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1 }}>{seg.title}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.1em', color: seg.color, marginTop: '0.15rem', textTransform: 'uppercase' }}>{seg.world}</div>
                        </div>
                      </div>

                      {/* Items */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {seg.items?.slice(0, 4).map((item: any, j: number) => (
                          <div key={j} style={{ paddingBottom: j < Math.min(seg.items.length, 4) - 1 ? '0.5rem' : 0, borderBottom: j < Math.min(seg.items.length, 4) - 1 ? '0.5px solid var(--border)' : 'none' }}>
                            <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.text}</p>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                              {item.stats   && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--text-dim)' }}>{item.stats}</span>}
                              {item.ripples > 0 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: seg.color }}>〜{item.ripples} ripples</span>}
                              {item.mood    && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--text-dim)', padding: '0.1rem 0.4rem', border: '0.5px solid var(--border)', borderRadius: '99px' }}>{item.mood}</span>}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Link to world */}
                      <div style={{ marginTop: '0.85rem' }}>
                        <Link href={`/${seg.world?.toLowerCase().replace('the ', 'the-').replace(' ', '-') || ''}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: seg.color, textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7 }}>View in {seg.world} →</Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
