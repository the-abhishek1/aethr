'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error('[Aethr Error]', error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ background: '#04040a', color: '#e8e4f0', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🌑</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 300, marginBottom: '1rem', color: '#D85A30' }}>Something broke.</h1>
          <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(232,228,240,0.45)', marginBottom: '2rem', maxWidth: 400 }}>
            The Void swallowed this request. It happens. The galaxy is self-healing.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={reset} style={{ fontFamily: 'monospace', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.75rem 2rem', background: '#a89bff', color: '#04040a', border: 'none', borderRadius: '2px', cursor: 'pointer' }}>Try again</button>
            <Link href="/" style={{ fontFamily: 'monospace', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.75rem 2rem', background: 'transparent', color: 'rgba(232,228,240,0.5)', border: '0.5px solid rgba(180,170,255,0.18)', borderRadius: '2px', textDecoration: 'none' }}>Return home</Link>
          </div>
        </div>
      </body>
    </html>
  )
}
