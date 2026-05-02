'use client'
import Link from 'next/link'
import { WORLDS } from '@/lib/constants'

const company = [
  { label: 'Manifesto', href: '/#manifesto' },
  { label: 'All Worlds', href: '/worlds' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Enter Aethr', href: '/onboarding' },
]

export default function Footer() {
  return (
    <footer style={{ borderTop: '0.5px solid var(--border)', padding: '4rem 2rem 2rem', position: 'relative', zIndex: 10 }}>
      <style>{`
        .footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 3rem; margin-bottom: 3rem; }
        @media (max-width: 1024px) { .footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; } }
        @media (max-width: 640px) { .footer-grid { grid-template-columns: 1fr; gap: 2rem; } }
        .footer-bar { display: flex; justify-content: space-between; align-items: center; }
        @media (max-width: 640px) { .footer-bar { flex-direction: column; gap: 0.75rem; text-align: center; } }
      `}</style>

      <div className="footer-grid">
        {/* Brand */}
        <div>
          <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text)', textDecoration: 'none', display: 'inline-block', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--aether)' }}>Æ</span>thr
          </Link>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', lineHeight: 1.9, color: 'var(--text-muted)', maxWidth: 240 }}>Not a platform. A living universe. Eight worlds. Infinite selves.</p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            {['Discord', 'Twitter', 'GitHub'].map(s => (
              <a key={s} href="#" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em', color: 'var(--text-dim)', textDecoration: 'none', border: '0.5px solid var(--border)', padding: '0.35rem 0.75rem', borderRadius: '2px' }}>{s}</a>
            ))}
          </div>
        </div>

        {/* Worlds */}
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>Worlds</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {WORLDS.map(w => (
              <Link key={w.id} href={w.href} style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: w.status === 'live' ? 'var(--text-muted)' : 'var(--text-dim)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem' }}>{w.glyph}</span>
                {w.name}
                {w.status === 'live' && <span style={{ width: 5, height: 5, borderRadius: '50%', background: w.color, boxShadow: `0 0 4px ${w.color}`, flexShrink: 0 }} />}
              </Link>
            ))}
          </div>
        </div>

        {/* Company */}
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>Aethr</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {company.map(c => (
              <Link key={c.label} href={c.href} style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text-dim)', textDecoration: 'none' }}>{c.label}</Link>
            ))}
          </div>
        </div>

        {/* Signal */}
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>Leave your signal</div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', lineHeight: 1.8, color: 'var(--text-dim)', marginBottom: '1rem' }}>Be first through the gate when The Commons opens.</p>
          <input type="email" placeholder="your@signal.here" id="footer-email" style={{ width: '100%', background: 'transparent', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.6rem 0.9rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text)', letterSpacing: '0.05em', marginBottom: '0.5rem' }} />
          <button onClick={() => { const el = document.getElementById('footer-email') as HTMLInputElement; if (el?.value?.includes('@')) { el.value = ''; el.placeholder = '✦ Signal received' } }} style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.6rem', background: 'var(--aether-dim)', border: '0.5px solid rgba(168,155,255,0.3)', color: 'var(--aether)', borderRadius: '2px', cursor: 'none' }}>Join the founding</button>
        </div>
      </div>

      <div className="footer-bar" style={{ borderTop: '0.5px solid var(--border)', paddingTop: '1.5rem' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em', color: 'var(--text-dim)' }}>© 2025 Aethr · The fifth element, inhabited</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em', color: 'var(--text-dim)' }}>Built in The Forge</span>
      </div>
    </footer>
  )
}
