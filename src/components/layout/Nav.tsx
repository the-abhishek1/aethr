'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import NotificationBell from '@/components/ui/NotificationBell'

const links = [
  { label: 'Worlds', href: '/worlds' },
  { label: 'Factions', href: '/factions' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Profile', href: '/profile' },
  { label: 'Galaxy TV', href: '/galaxy-tv' },
  { label: 'Messages', href: '/messages' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim().length >= 2) { router.push(`/search?q=${encodeURIComponent(search.trim())}`); setSearch('') }
  }

  return (
    <>
      <style>{`
        .nav-desktop { display: flex !important; }
        .nav-hamburger { display: none !important; }
        .mobile-menu { display: none !important; }
        .nav-search { display: flex !important; }
        @media (max-width: 900px) { .nav-search { display: none !important; } }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .mobile-menu { display: flex !important; }
        }
      `}</style>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: scrolled ? '0.5px solid var(--border)' : '0.5px solid transparent', background: scrolled || open ? 'rgba(4,4,10,0.97)' : 'transparent', backdropFilter: scrolled || open ? 'blur(20px)' : 'none', transition: 'background 0.4s ease, border-color 0.4s ease', gap: '1rem' }}>

        <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text)', textDecoration: 'none', zIndex: 110, flexShrink: 0 }}>
          <span style={{ color: 'var(--aether)' }}>Æ</span>thr
        </Link>

        {/* Search bar — desktop only */}
        <form className="nav-search" onSubmit={handleSearch} style={{ flex: 1, maxWidth: 280 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search the galaxy..." style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '0.5px solid var(--border)', borderRadius: '2px', outline: 'none', padding: '0.45rem 0.9rem 0.45rem 2rem', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text)', letterSpacing: '0.04em', transition: 'border-color 0.2s' }} onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--border-bright)'} onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--border)'} />
            <span style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>⌕</span>
          </div>
        </form>

        {/* Desktop nav links */}
        <div className="nav-desktop" style={{ gap: '2rem', alignItems: 'center' }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: pathname === l.href ? 'var(--text)' : 'var(--text-muted)', borderBottom: pathname === l.href ? '0.5px solid var(--aether)' : 'none', paddingBottom: '2px', transition: 'color 0.2s' }}>{l.label}</Link>
          ))}

          {!loading && (
            user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <NotificationBell />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'none' }} onClick={() => router.push('/profile')}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface)', border: '0.5px solid var(--border-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>{user.avatarEmoji}</div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>@{user.username}</span>
                </div>
                <button onClick={signOut} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', background: 'transparent', border: '0.5px solid var(--border)', padding: '0.35rem 0.8rem', borderRadius: '2px', cursor: 'none' }}>Exit</button>
              </div>
            ) : (
              <Link href="/signin" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--aether)', border: '0.5px solid rgba(168,155,255,0.4)', padding: '0.5rem 1.25rem', borderRadius: '2px' }}>Enter Aethr</Link>
            )
          )}
        </div>

        {/* Hamburger */}
        <button className="nav-hamburger" onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'none', flexDirection: 'column', gap: '5px', padding: '6px', zIndex: 110 }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{ display: 'block', width: 22, height: '0.5px', background: 'var(--text)', transition: 'all 0.3s ease', transform: open ? (i === 0 ? 'rotate(45deg) translate(4px, 4px)' : i === 2 ? 'rotate(-45deg) translate(4px, -4px)' : 'scaleX(0)') : 'none', opacity: open && i === 1 ? 0 : 1 }} />
          ))}
        </button>
      </nav>

      {/* Mobile menu */}
      <div className="mobile-menu" style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'rgba(4,4,10,0.98)', backdropFilter: 'blur(24px)', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none', transition: 'opacity 0.3s ease' }}>

        {/* Mobile search */}
        <form onSubmit={e => { handleSearch(e); setOpen(false) }} style={{ width: '80%', marginBottom: '1.5rem', animation: open ? 'fadeUp 0.4s 0s both' : 'none' }}>
          <div style={{ position: 'relative' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search the galaxy..." style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.7rem 1rem 0.7rem 2.2rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text)' }} />
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)' }}>⌕</span>
          </div>
        </form>

        {links.map((l, i) => (
          <Link key={l.href} href={l.href} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,8vw,3rem)', fontWeight: 300, textDecoration: 'none', color: pathname === l.href ? 'var(--aether)' : 'var(--text)', padding: '0.4rem 0', animation: open ? `fadeUp 0.4s ${(i + 1) * 0.07}s both` : 'none' }}>{l.label}</Link>
        ))}

        <div style={{ width: 40, height: '0.5px', background: 'var(--border-bright)', margin: '0.75rem 0', animation: open ? 'fadeUp 0.4s 0.35s both' : 'none' }} />

        {!loading && (user ? (
          <>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--aether)', animation: open ? 'fadeUp 0.4s 0.4s both' : 'none' }}>@{user.username}</div>
            <button onClick={signOut} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', background: 'transparent', border: '0.5px solid var(--border)', padding: '0.7rem 2rem', borderRadius: '2px', cursor: 'none', marginTop: '0.5rem', animation: open ? 'fadeUp 0.4s 0.45s both' : 'none' }}>Exit the galaxy</button>
          </>
        ) : (
          <Link href="/signin" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--void)', background: 'var(--aether)', padding: '0.85rem 2.5rem', borderRadius: '2px', marginTop: '0.5rem', animation: open ? 'fadeUp 0.4s 0.38s both' : 'none' }}>Enter Aethr</Link>
        ))}

        <div style={{ position: 'absolute', bottom: '3rem', display: 'flex', gap: '1rem', alignItems: 'center', animation: open ? 'fadeUp 0.4s 0.5s both' : 'none' }}>
          {['#1D9E75', '#BA7517', '#D85A30', '#378ADD', '#7F77DD'].map((c, i) => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: c, boxShadow: `0 0 6px ${c}`, opacity: 0.7 }} />
          ))}
        </div>
      </div>
    </>
  )
}
