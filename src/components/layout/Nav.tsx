'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const links = [
  { label: 'Worlds', href: '/worlds' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Profile', href: '/profile' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, signOut } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [open])

  return (
    <>
      <style>{`
        .nav-desktop { display: flex !important; }
        .nav-hamburger { display: none !important; }
        .mobile-menu { display: none !important; }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .mobile-menu { display: flex !important; }
        }
      `}</style>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: scrolled?'0.5px solid var(--border)':'0.5px solid transparent', background: scrolled||open?'rgba(4,4,10,0.97)':'transparent', backdropFilter: scrolled||open?'blur(20px)':'none', transition: 'background 0.4s ease, border-color 0.4s ease' }}>

        <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text)', textDecoration: 'none', zIndex: 110 }}>
          <span style={{ color: 'var(--aether)' }}>Æ</span>thr
        </Link>

        {/* Desktop */}
        <div className="nav-desktop" style={{ gap: '2.5rem', alignItems: 'center' }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: pathname===l.href?'var(--text)':'var(--text-muted)', borderBottom: pathname===l.href?'0.5px solid var(--aether)':'none', paddingBottom: '2px', transition: 'color 0.2s' }}>{l.label}</Link>
          ))}

          {!loading && (
            user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'none' }} onClick={() => router.push('/profile')}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface)', border: '0.5px solid var(--border-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>{user.avatarEmoji}</div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>@{user.username}</span>
                </div>
                <button onClick={signOut} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', background: 'transparent', border: '0.5px solid var(--border)', padding: '0.4rem 0.9rem', borderRadius: '2px', cursor: 'none' }}>Exit</button>
              </div>
            ) : (
              <Link href="/signin" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--aether)', border: '0.5px solid rgba(168,155,255,0.4)', padding: '0.5rem 1.25rem', borderRadius: '2px' }}>Enter Aethr</Link>
            )
          )}
        </div>

        {/* Hamburger */}
        <button className="nav-hamburger" onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'none', flexDirection: 'column', gap: '5px', padding: '6px', zIndex: 110 }}>
          {[0,1,2].map(i => (
            <span key={i} style={{ display: 'block', width: 22, height: '0.5px', background: 'var(--text)', transition: 'all 0.3s ease', transform: open?(i===0?'rotate(45deg) translate(4px, 4px)':i===2?'rotate(-45deg) translate(4px, -4px)':'scaleX(0)'):'none', opacity: open&&i===1?0:1 }} />
          ))}
        </button>
      </nav>

      {/* Mobile menu */}
      <div className="mobile-menu" style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'rgba(4,4,10,0.98)', backdropFilter: 'blur(24px)', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: open?1:0, pointerEvents: open?'all':'none', transition: 'opacity 0.3s ease' }}>
        {links.map((l,i) => (
          <Link key={l.href} href={l.href} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem,8vw,3.2rem)', fontWeight: 300, textDecoration: 'none', color: pathname===l.href?'var(--aether)':'var(--text)', padding: '0.5rem 0', animation: open?`fadeUp 0.4s ${i*0.07}s both`:'none' }}>{l.label}</Link>
        ))}
        <div style={{ width: 40, height: '0.5px', background: 'var(--border-bright)', margin: '1rem 0', animation: open?'fadeUp 0.4s 0.22s both':'none' }} />

        {!loading && (
          user ? (
            <>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--aether)', animation: open?'fadeUp 0.4s 0.28s both':'none' }}>@{user.username}</div>
              <button onClick={signOut} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', background: 'transparent', border: '0.5px solid var(--border)', padding: '0.75rem 2rem', borderRadius: '2px', cursor: 'none', marginTop: '0.5rem', animation: open?'fadeUp 0.4s 0.33s both':'none' }}>Exit the galaxy</button>
            </>
          ) : (
            <Link href="/signin" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--void)', background: 'var(--aether)', padding: '0.85rem 2.5rem', borderRadius: '2px', marginTop: '0.5rem', animation: open?'fadeUp 0.4s 0.3s both':'none' }}>Enter Aethr</Link>
          )
        )}

        <div style={{ position: 'absolute', bottom: '3rem', display: 'flex', gap: '1rem', alignItems: 'center', animation: open?'fadeUp 0.4s 0.4s both':'none' }}>
          {['#1D9E75','#BA7517','#D85A30','#378ADD','#7F77DD'].map((c,i) => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: c, boxShadow: `0 0 6px ${c}`, opacity: 0.7 }} />
          ))}
        </div>
      </div>
    </>
  )
}
