'use client'
import Link from 'next/link'
import type { World } from '@/types'

const statusLabel: Record<string, string> = {
  live: 'Live',
  coming: 'Phase II',
  far: 'Phase III',
  future: 'Phase IV',
}

export default function WorldCard({ world, large }: { world: World; large?: boolean }) {
  return (
    <Link href={world.href} style={{
      display: 'block', textDecoration: 'none',
      background: 'var(--void)',
      border: '0.5px solid var(--border)',
      padding: large ? '2.5rem 2rem' : '2rem 1.75rem',
      position: 'relative', overflow: 'hidden',
      transition: 'background 0.3s, border-color 0.3s',
      cursor: 'none',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.background = 'var(--deep)'
      ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border-bright)'
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.background = 'var(--void)'
      ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
    }}
    >
      {/* Accent glow on hover */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0,
        background: `radial-gradient(ellipse at 25% 25%, ${world.accent}, transparent 65%)`,
        transition: 'opacity 0.3s', pointerEvents: 'none',
      }} className="world-glow" />

      {/* Status badge */}
      <div style={{
        position: 'absolute', top: '1.25rem', right: '1.25rem',
        fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: world.status === 'live' ? world.color : 'var(--text-dim)',
        border: `0.5px solid ${world.status === 'live' ? world.color + '55' : 'var(--border)'}`,
        padding: '0.25rem 0.6rem', borderRadius: '2px',
      }}>
        {statusLabel[world.status]}
      </div>

      <div style={{ fontSize: large ? '2rem' : '1.6rem', marginBottom: '1rem' }}>
        {world.glyph}
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: large ? '1.5rem' : '1.25rem',
        fontWeight: 400, color: 'var(--text)',
        marginBottom: '0.35rem', letterSpacing: '0.01em',
      }}>
        {world.name}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
        lineHeight: 1.9, color: 'var(--text-muted)',
      }}>
        {world.desc}
      </div>

      {large && (
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {world.features.map(f => (
            <div key={f} style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
              color: 'var(--text-dim)', display: 'flex', gap: '0.5rem', alignItems: 'center',
            }}>
              <span style={{ color: world.color, opacity: 0.8 }}>—</span> {f}
            </div>
          ))}
        </div>
      )}
    </Link>
  )
}
