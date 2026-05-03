'use client'
import Link from 'next/link'
import { WORLDS } from '@/lib/constants'
import { useAuth } from '@/context/AuthContext'

const liveWorlds = () => WORLDS.filter(w => w.status === 'live')
const upcomingWorlds = () => WORLDS.filter(w => w.status === ('coming' as string))

export default function Footer() {
  const { user } = useAuth()

  return (
    <footer style={{ borderTop: '0.5px solid var(--border)', padding: '3.5rem 2rem 2rem', position: 'relative', zIndex: 10 }}>
      <style>{`
        .footer-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 2.5rem; margin-bottom: 2.5rem; }
        @media (max-width: 900px) { .footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; } }
        @media (max-width: 540px) { .footer-grid { grid-template-columns: 1fr; gap: 1.75rem; } }
        .footer-bar { display: flex; justify-content: space-between; align-items: center; }
        @media (max-width: 600px) { .footer-bar { flex-direction: column; gap: 0.75rem; text-align: center; } }
        .footer-link { font-family: var(--font-display); font-size: 0.95rem; text-decoration: none; transition: color 0.2s; display: flex; align-items: center; gap: 0.4rem; }
        .footer-link:hover { color: var(--text) !important; }
      `}</style>

      <div className="footer-grid">
        {/* Brand */}
        <div>
          <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text)', textDecoration: 'none', display: 'inline-block', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--aether)' }}>Æ</span>thr
          </Link>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', lineHeight: 1.9, color: 'var(--text-muted)', maxWidth: 220, marginBottom: '1.25rem' }}>
            Not a platform. A living universe. Eight worlds. Your reputation belongs to you.
          </p>
          {!user ? (
            <Link href="/signup" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--void)', background: 'var(--aether)', padding: '0.5rem 1.25rem', borderRadius: '2px', display: 'inline-block' }}>Join free →</Link>
          ) : (
            <Link href="/dashboard" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--aether)', border: '0.5px solid rgba(168,155,255,0.3)', padding: '0.5rem 1.25rem', borderRadius: '2px', display: 'inline-block' }}>Dashboard →</Link>
          )}
        </div>

        {/* Live worlds */}
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1.1rem' }}>Live now</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {liveWorlds().map(w => (
              <Link key={w.id} href={w.href} className="footer-link" style={{ color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '0.75rem' }}>{w.glyph}</span>
                {w.name}
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: w.color, boxShadow: `0 0 4px ${w.color}`, flexShrink: 0 }} />
              </Link>
            ))}
            {upcomingWorlds().map(w => (
              <Link key={w.id} href={w.href} className="footer-link" style={{ color: 'var(--text-dim)', opacity: 0.6 }}>
                <span style={{ fontSize: '0.75rem' }}>{w.glyph}</span>
                {w.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Explore */}
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1.1rem' }}>Explore</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {[
              { label: 'All worlds',  href: '/worlds' },
              { label: 'Factions',    href: '/factions' },
              { label: 'The Arena',   href: '/arena' },
              { label: 'Galaxy TV',   href: '/galaxy-tv' },
              { label: 'Search',      href: '/search' },
              { label: 'The Archive', href: '/archive' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="footer-link" style={{ color: 'var(--text-dim)' }}>{l.label}</Link>
            ))}
          </div>
        </div>

        {/* Account */}
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1.1rem' }}>Account</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {!user ? (
              <>
                <Link href="/signup" className="footer-link" style={{ color: 'var(--aether)' }}>Create account</Link>
                <Link href="/signin" className="footer-link" style={{ color: 'var(--text-dim)' }}>Sign in</Link>
              </>
            ) : (
              <>
                <Link href="/dashboard"  className="footer-link" style={{ color: 'var(--text-muted)' }}>Dashboard</Link>
                <Link href="/profile"    className="footer-link" style={{ color: 'var(--text-muted)' }}>Profile</Link>
                <Link href="/messages"   className="footer-link" style={{ color: 'var(--text-muted)' }}>Messages</Link>
                <Link href="/sanctum"    className="footer-link" style={{ color: 'var(--text-muted)' }}>The Sanctum</Link>
                <Link href="/settings"   className="footer-link" style={{ color: 'var(--text-dim)' }}>Settings</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bar" style={{ borderTop: '0.5px solid var(--border)', paddingTop: '1.5rem' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em', color: 'var(--text-dim)' }}>© 2025 Aethr · The fifth element, inhabited</span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {[
            { label: 'Manifesto', href: '/#manifesto' },
            { label: 'Admin',     href: '/admin' },
          ].map(l => (
            <Link key={l.href} href={l.href} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)'}
            >{l.label}</Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
