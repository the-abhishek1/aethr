import { WORLDS } from '@/lib/constants'
import WorldCard from '@/components/worlds/WorldCard'
import SectionLabel from '@/components/ui/SectionLabel'
import Link from 'next/link'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Worlds — Aethr' }

export default function WorldsPage() {
  const live    = WORLDS.filter(w => w.status === 'live')
  const coming  = WORLDS.filter(w => w.status === ('coming' as string))
  const horizon = WORLDS.filter(w => w.status === ('far' as string) || w.status === ('future' as string))

  return (
    <>
      <style>{`
        .worlds-page-pad { padding: 7rem 2rem 5rem; }
        .worlds-grid-2 { grid-template-columns: 1fr 1fr !important; }
        .worlds-grid-4 { grid-template-columns: repeat(4,1fr) !important; }
        @media (max-width: 1024px) { .worlds-grid-4 { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 768px) {
          .worlds-page-pad { padding: 6rem 1.25rem 3rem !important; }
          .worlds-grid-2 { grid-template-columns: 1fr !important; }
          .worlds-grid-4 { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) { .worlds-grid-4 { grid-template-columns: 1fr !important; } }
      `}</style>

      <div className="worlds-page-pad">
        <SectionLabel>The galaxy map</SectionLabel>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem,7vw,5.5rem)', fontWeight: 300, lineHeight: 0.95, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
          Eight worlds.<br /><em style={{ color: 'var(--aether)' }}>One civilization.</em>
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.65rem,1.5vw,0.75rem)', lineHeight: 1.9, color: 'var(--text-muted)', maxWidth: 520, marginBottom: '1.5rem' }}>
          You don't open an app and scroll. Each world is a different domain of human experience — you choose where to go based on what you need right now.
        </p>

        {/* Browse without account notice */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', border: '0.5px solid rgba(168,155,255,0.2)', borderRadius: '2px', padding: '0.5rem 1rem', marginBottom: '4rem', background: 'var(--aether-dim)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--aether)' }}>✦ Browse all worlds freely — no account needed to explore</span>
        </div>

        {/* Phase I */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1D9E75', display: 'inline-block', boxShadow: '0 0 6px #1D9E75' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1D9E75' }}>Phase I — Live now · Enter without signup</span>
          </div>
          <div className="worlds-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)' }}>
            {live.map(w => <WorldCard key={w.id} world={w} large />)}
          </div>
        </div>

        {/* Phase II */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#378ADD', display: 'inline-block', opacity: 0.7 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#378ADD' }}>Phase II — In development</span>
          </div>
          <div className="worlds-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)' }}>
            {coming.map(w => <WorldCard key={w.id} world={w} large />)}
          </div>
        </div>

        {/* Horizon */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-dim)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Phase III & IV — The horizon</span>
          </div>
          <div className="worlds-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)' }}>
            {horizon.map(w => <WorldCard key={w.id} world={w} />)}
          </div>
        </div>

        {/* CTA */}
        <div style={{ border: '0.5px solid var(--border-bright)', borderRadius: '2px', padding: '2rem', background: 'var(--deep)', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.25rem,3vw,2rem)', fontWeight: 300, marginBottom: '1rem' }}>
            Ready to <em style={{ color: 'var(--aether)' }}>inhabit</em> the galaxy?
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--void)', background: 'var(--aether)', padding: '0.75rem 2rem', borderRadius: '2px' }}>Create account →</Link>
            <Link href="/commons" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--text-muted)', padding: '0.75rem 2rem', borderRadius: '2px', border: '0.5px solid var(--border-bright)' }}>Browse The Commons →</Link>
          </div>
        </div>
      </div>
    </>
  )
}
