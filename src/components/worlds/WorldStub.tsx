'use client'
import Link from 'next/link'
import { WORLDS } from '@/lib/constants'
import type { World } from '@/types'

const phaseColor: Record<string, string> = {
  'Phase II': '#378ADD',
  'Phase III': '#BA7517',
  'Phase IV': '#a89bff',
}

export default function WorldStub({ worldId }: { worldId: string }) {
  const world = WORLDS.find(w => w.id === worldId) as World
  const color = phaseColor[world.phase] ?? 'var(--text-dim)'

  const otherLive = WORLDS.filter(w => w.status === 'live' && w.id !== worldId)

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '8rem 2rem 4rem',
      position: 'relative',
    }}>
      {/* Glow orb behind glyph */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -58%)',
        width: 500, height: 500,
        borderRadius: '50%',
        background: `radial-gradient(ellipse, ${world.color}12 0%, ${world.color}05 40%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Glyph */}
      <div style={{
        fontSize: '4rem', marginBottom: '2rem',
        animation: 'drift 6s ease-in-out infinite',
      }}>{world.glyph}</div>

      {/* Phase badge */}
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
        letterSpacing: '0.28em', textTransform: 'uppercase',
        color, marginBottom: '1.5rem',
        border: `0.5px solid ${color}44`,
        padding: '0.35rem 1rem', borderRadius: '2px',
        display: 'inline-block',
      }}>{world.phase} — In development</div>

      {/* Title */}
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(3rem, 8vw, 6.5rem)', fontWeight: 300,
        lineHeight: 0.92, letterSpacing: '-0.02em',
        marginBottom: '1.75rem',
        animation: 'fadeUp 0.8s 0.2s both',
      }}>
        {world.name.split(' ')[0]}{' '}
        <em style={{ color: world.color }}>
          {world.name.split(' ').slice(1).join(' ')}
        </em>
        <br />
        <span style={{
          fontSize: '0.45em', fontStyle: 'italic',
          color: 'var(--text-dim)', fontWeight: 300,
        }}>is being forged.</span>
      </h1>

      {/* Description */}
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
        lineHeight: 1.9, color: 'var(--text-muted)',
        maxWidth: 480, marginBottom: '2.5rem',
        animation: 'fadeUp 0.8s 0.35s both',
      }}>{world.longDesc}</p>

      {/* Feature pills */}
      <div style={{
        display: 'flex', gap: '0.6rem', flexWrap: 'wrap',
        justifyContent: 'center', marginBottom: '3.5rem',
        animation: 'fadeUp 0.8s 0.5s both',
      }}>
        {world.features.map(f => (
          <span key={f} style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
            letterSpacing: '0.08em',
            padding: '0.35rem 1rem',
            border: `0.5px solid ${world.color}44`,
            borderRadius: '2px',
            color: world.color, opacity: 0.8,
          }}>{f}</span>
        ))}
      </div>

      {/* Divider */}
      <div style={{
        width: 40, height: '0.5px',
        background: 'var(--border-bright)',
        margin: '0 auto 3rem',
      }} />

      {/* Explore live worlds */}
      <div style={{ animation: 'fadeUp 0.8s 0.65s both' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--text-dim)', marginBottom: '1rem',
        }}>Explore what's live now</div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {otherLive.map(w => (
            <Link key={w.id} href={w.href} style={{
              fontFamily: 'var(--font-display)', fontSize: '1.05rem',
              textDecoration: 'none', color: 'var(--text-muted)',
              border: '0.5px solid var(--border)',
              padding: '0.6rem 1.25rem', borderRadius: '2px',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = w.color + '66'
              el.style.color = w.color
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = 'var(--border)'
              el.style.color = 'var(--text-muted)'
            }}
            >
              {w.glyph} {w.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Back link */}
      <Link href="/worlds" style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
        letterSpacing: '0.12em', textTransform: 'uppercase',
        textDecoration: 'none', color: 'var(--text-dim)',
        marginTop: '2.5rem', display: 'inline-block',
        transition: 'color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)'}
      >← All worlds</Link>
    </div>
  )
}
