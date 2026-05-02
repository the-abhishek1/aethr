import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '404 — Lost in the Void · Aethr' }

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '8rem 2rem',
      position: 'relative',
    }}>
      {/* Void glow */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -55%)',
        width: 480, height: 480,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(127,119,221,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Glyph */}
      <div style={{
        fontSize: '4rem', marginBottom: '2rem',
        animation: 'drift 6s ease-in-out infinite',
      }}>🌑</div>

      {/* Error code */}
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
        letterSpacing: '0.28em', textTransform: 'uppercase',
        color: '#7F77DD', marginBottom: '1.5rem',
        border: '0.5px solid rgba(127,119,221,0.3)',
        padding: '0.35rem 1rem', borderRadius: '2px',
        display: 'inline-block',
      }}>Error 404 — Lost in The Void</div>

      {/* Title */}
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 300,
        lineHeight: 0.95, letterSpacing: '-0.02em',
        marginBottom: '1.5rem',
      }}>
        This world<br />
        <em style={{ color: '#7F77DD' }}>doesn't exist.</em>
        <br />
        <span style={{ fontSize: '0.42em', fontStyle: 'italic', color: 'var(--text-dim)', fontWeight: 300 }}>
          Yet.
        </span>
      </h1>

      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
        lineHeight: 1.9, color: 'var(--text-muted)',
        maxWidth: 400, marginBottom: '3rem',
      }}>
        The Void swallowed this page. Some corners of the galaxy are still being forged. Return to known space.
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
          letterSpacing: '0.12em', textTransform: 'uppercase',
          textDecoration: 'none', color: 'var(--void)',
          background: 'var(--aether)', padding: '0.75rem 2rem',
          borderRadius: '2px', transition: 'opacity 0.2s',
        }}>Return home</Link>
        <Link href="/worlds" style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
          letterSpacing: '0.12em', textTransform: 'uppercase',
          textDecoration: 'none', color: 'var(--text-muted)',
          border: '0.5px solid var(--border-bright)',
          padding: '0.75rem 2rem', borderRadius: '2px',
          transition: 'color 0.2s, border-color 0.2s',
        }}>All worlds</Link>
        <Link href="/dashboard" style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
          letterSpacing: '0.12em', textTransform: 'uppercase',
          textDecoration: 'none', color: 'var(--text-muted)',
          border: '0.5px solid var(--border-bright)',
          padding: '0.75rem 2rem', borderRadius: '2px',
          transition: 'color 0.2s, border-color 0.2s',
        }}>Dashboard</Link>
      </div>
    </div>
  )
}
