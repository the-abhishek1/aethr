'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import NotificationBell from '@/components/ui/NotificationBell'

const PUBLIC_LINKS = [
  { label: 'Worlds',    href: '/worlds' },
  { label: 'Factions',  href: '/factions' },
  { label: 'The Arena', href: '/arena' },
]
const AUTH_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Galaxy TV', href: '/galaxy-tv' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)
  const pathname  = usePathname()
  const router    = useRouter()
  const { user, loading, signOut } = useAuth()
  const isAdmin = user?.isAdmin === true

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <style>{`
        .nav-links   { display: flex; align-items: center; gap: 1.25rem; }
        .nav-srch    { display: flex; }
        .nav-ham     { display: none !important; }
        .nav-mob     { display: none !important; }
        .nav-lg-only { display: inline !important; }
        @media (max-width: 1100px) { .nav-srch { display: none !important; } }
        @media (max-width: 900px)  { .nav-lg-only { display: none !important; } }
        @media (max-width: 768px)  {
          .nav-links { display: none !important; }
          .nav-ham   { display: flex !important; }
          .nav-mob   { display: flex !important; }
        }
      `}</style>

      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.8rem 1.5rem', borderBottom: scrolled ? '0.5px solid var(--border)' : '0.5px solid transparent', background: scrolled||open ? 'rgba(4,4,10,0.97)' : 'transparent', backdropFilter: scrolled||open ? 'blur(20px)' : 'none', transition:'background 0.4s,border-color 0.4s', gap:'1rem' }}>

        {/* Logo */}
        <Link href={user ? '/dashboard' : '/'} style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--text)', textDecoration:'none', zIndex:110, flexShrink:0 }}>
          <span style={{ color:'var(--aether)' }}>Æ</span>thr
        </Link>

        {/* Search shortcut — desktop only, hides at medium */}
        <Link href="/search" className="nav-srch" style={{ alignItems:'center', gap:'0.4rem', padding:'0.38rem 0.9rem', border:'0.5px solid var(--border)', borderRadius:'2px', textDecoration:'none', color:'var(--text-dim)', fontFamily:'var(--font-mono)', fontSize:'0.6rem', background:'rgba(255,255,255,0.04)', flex:1, maxWidth:180, transition:'border-color 0.2s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor='var(--border-bright)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor='var(--border)'}
        >
          <span>⌕</span> Search...
        </Link>

        {/* Desktop links */}
        <div className="nav-links">
          {PUBLIC_LINKS.map(l => (
            <Link key={l.href} href={l.href} style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', letterSpacing:'0.1em', textTransform:'uppercase', textDecoration:'none', color: pathname.startsWith(l.href) ? 'var(--text)' : 'var(--text-dim)', borderBottom: pathname.startsWith(l.href) ? '0.5px solid var(--aether)' : 'none', paddingBottom:'2px', whiteSpace:'nowrap', transition:'color 0.2s' }}>{l.label}</Link>
          ))}
          {!loading && user && AUTH_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="nav-lg-only" style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', letterSpacing:'0.1em', textTransform:'uppercase', textDecoration:'none', color: pathname.startsWith(l.href) ? 'var(--text)' : 'var(--text-dim)', borderBottom: pathname.startsWith(l.href) ? '0.5px solid var(--aether)' : 'none', paddingBottom:'2px', whiteSpace:'nowrap', transition:'color 0.2s' }}>{l.label}</Link>
          ))}

          {!loading && (user ? (
            <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
              <NotificationBell />
              <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', cursor:'none' }} onClick={() => router.push('/profile')}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--surface)', border:'0.5px solid var(--border-bright)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem' }}>{user.avatarEmoji}</div>
                <span className="nav-lg-only" style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--text-muted)', whiteSpace:'nowrap' }}>@{user.username}</span>
              </div>
              {isAdmin && <Link href="/admin" style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'#D85A30', textDecoration:'none', border:'0.5px solid rgba(216,90,48,0.3)', padding:'0.25rem 0.5rem', borderRadius:'2px' }} title="Admin">⚙</Link>}
              <button onClick={signOut} style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-dim)', background:'transparent', border:'0.5px solid var(--border)', padding:'0.3rem 0.65rem', borderRadius:'2px', cursor:'none', whiteSpace:'nowrap' }}>Exit</button>
            </div>
          ) : (
            <Link href="/signin" style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', letterSpacing:'0.1em', textTransform:'uppercase', textDecoration:'none', color:'var(--aether)', border:'0.5px solid rgba(168,155,255,0.4)', padding:'0.4rem 1rem', borderRadius:'2px', whiteSpace:'nowrap' }}>Enter →</Link>
          ))}
        </div>

        {/* Hamburger */}
        <button className="nav-ham" onClick={() => setOpen(o => !o)} style={{ background:'none', border:'none', cursor:'none', flexDirection:'column', gap:'5px', padding:'6px', zIndex:110 }}>
          {[0,1,2].map(i => <span key={i} style={{ display:'block', width:22, height:'0.5px', background:'var(--text)', transition:'all 0.3s', transform: open ? (i===0?'rotate(45deg) translate(4px,4px)':i===2?'rotate(-45deg) translate(4px,-4px)':'scaleX(0)'):'none', opacity: open&&i===1?0:1 }} />)}
        </button>
      </nav>

      {/* Mobile overlay — no search form, search is in tab bar */}
      <div className="nav-mob" style={{ position:'fixed', inset:0, zIndex:99, background:'rgba(4,4,10,0.98)', backdropFilter:'blur(24px)', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'0.3rem', opacity: open?1:0, pointerEvents: open?'all':'none', transition:'opacity 0.3s' }}>
        {[...PUBLIC_LINKS, ...(user ? AUTH_LINKS : [])].map((l, i) => (
          <Link key={l.href} href={l.href} style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.8rem,7vw,2.75rem)', fontWeight:300, textDecoration:'none', color: pathname.startsWith(l.href)?'var(--aether)':'var(--text)', padding:'0.35rem 0', animation: open?`fadeUp 0.4s ${i*0.07}s both`:'none' }}>{l.label}</Link>
        ))}

        <div style={{ width:40, height:'0.5px', background:'var(--border-bright)', margin:'0.75rem 0' }} />

        {!loading && (user ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.6rem' }}>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.75rem', color:'var(--aether)' }}>@{user.username}</span>
            <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', justifyContent:'center' }}>
              <Link href="/profile"  onClick={()=>setOpen(false)} style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', letterSpacing:'0.08em', textTransform:'uppercase', textDecoration:'none', color:'var(--text-muted)', border:'0.5px solid var(--border)', padding:'0.55rem 1rem', borderRadius:'2px' }}>Profile</Link>
              <Link href="/messages" onClick={()=>setOpen(false)} style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', letterSpacing:'0.08em', textTransform:'uppercase', textDecoration:'none', color:'var(--text-muted)', border:'0.5px solid var(--border)', padding:'0.55rem 1rem', borderRadius:'2px' }}>Messages</Link>
              <Link href="/settings" onClick={()=>setOpen(false)} style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', letterSpacing:'0.08em', textTransform:'uppercase', textDecoration:'none', color:'var(--text-muted)', border:'0.5px solid var(--border)', padding:'0.55rem 1rem', borderRadius:'2px' }}>Settings</Link>
              {isAdmin && <Link href="/admin" onClick={()=>setOpen(false)} style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', letterSpacing:'0.08em', textTransform:'uppercase', textDecoration:'none', color:'#D85A30', border:'0.5px solid rgba(216,90,48,0.3)', padding:'0.55rem 1rem', borderRadius:'2px' }}>Admin</Link>}
            </div>
            <button onClick={signOut} style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-dim)', background:'transparent', border:'0.5px solid var(--border)', padding:'0.65rem 1.75rem', borderRadius:'2px', cursor:'none', marginTop:'0.25rem' }}>Exit galaxy</button>
          </div>
        ) : (
          <Link href="/signin" style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', letterSpacing:'0.12em', textTransform:'uppercase', textDecoration:'none', color:'var(--void)', background:'var(--aether)', padding:'0.8rem 2.25rem', borderRadius:'2px' }}>Enter Aethr</Link>
        ))}
      </div>
    </>
  )
}
