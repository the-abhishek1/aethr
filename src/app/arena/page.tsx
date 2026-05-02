import Link from 'next/link'
import { WORLDS } from '@/lib/constants'

export default function ArenaPage() {
  const world = WORLDS.find(w => w.id === 'arena')!
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem',
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>⚔️</div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
        letterSpacing: '0.25em', textTransform: 'uppercase',
        color: world.color, marginBottom: '1.5rem',
      }}>Phase II — In development</div>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(3rem, 7vw, 6rem)', fontWeight: 300,
        lineHeight: 0.95, marginBottom: '1.5rem',
      }}>The Arena<br /><em style={{ color: world.color }}>is being forged.</em></h1>
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
        lineHeight: 1.9, color: 'var(--text-muted)', maxWidth: 420, marginBottom: '3rem',
      }}>{world.longDesc}</p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3rem' }}>
        {world.features.map(f => (
          <span key={f} style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
            padding: '0.35rem 0.9rem', border: `0.5px solid ${world.color}44`,
            borderRadius: '2px', color: world.color, opacity: 0.8,
          }}>{f}</span>
        ))}
      </div>
      <Link href="/worlds" style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
        letterSpacing: '0.12em', textTransform: 'uppercase',
        textDecoration: 'none', color: 'var(--text-muted)',
        border: '0.5px solid var(--border)', padding: '0.75rem 2rem', borderRadius: '2px',
      }}>← Back to all worlds</Link>
    </div>
  )
}
