import { WORLDS } from '@/lib/constants'
import WorldCard from '@/components/worlds/WorldCard'
import SectionLabel from '@/components/ui/SectionLabel'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Worlds — Aethr' }

export default function WorldsPage() {
  const sections = [
    { label: 'Phase I — Live now', color: '#1D9E75', worlds: WORLDS.filter(w => w.status === 'live'), cols: 2, large: true },
    { label: 'Phase II — In development', color: '#378ADD', worlds: WORLDS.filter(w => w.status === 'coming'), cols: 2, large: true },
    { label: 'Phase III & IV — The horizon', color: 'var(--text-dim)', worlds: WORLDS.filter(w => w.status === 'far' || w.status === 'future'), cols: 4, large: false },
  ]
  return (
    <>
      <style>{`
        .worlds-hero { padding: 8rem 3rem 5rem; }
        .worlds-grid-2 { grid-template-columns: 1fr 1fr !important; }
        .worlds-grid-4 { grid-template-columns: repeat(4,1fr) !important; }
        @media (max-width: 1024px) { .worlds-grid-4 { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 768px) {
          .worlds-hero { padding: 7rem 1.25rem 3rem !important; }
          .worlds-grid-2 { grid-template-columns: 1fr !important; }
          .worlds-grid-4 { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) { .worlds-grid-4 { grid-template-columns: 1fr !important; } }
      `}</style>
      <div className="worlds-hero">
        <SectionLabel>The galaxy map</SectionLabel>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem,7vw,6rem)', fontWeight: 300, lineHeight: 0.95, letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>
          Eight worlds.<br /><em style={{ color: 'var(--aether)' }}>One civilization.</em>
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.65rem,1.5vw,0.75rem)', lineHeight: 1.9, color: 'var(--text-muted)', maxWidth: 480, marginBottom: '4rem' }}>You don't open an app and scroll. You arrive somewhere based on how you feel.</p>
        {sections.map(s => (
          <div key={s.label} style={{ marginBottom: '4rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: s.color, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }} />{s.label}
            </div>
            <div className={s.cols === 4 ? 'worlds-grid-4' : 'worlds-grid-2'} style={{ display: 'grid', gridTemplateColumns: `repeat(${s.cols},1fr)`, gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)' }}>
              {s.worlds.map(w => <WorldCard key={w.id} world={w} large={s.large} />)}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
