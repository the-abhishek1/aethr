'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const TABS = [
  { href: '/dashboard', icon: '⬡',  label: 'Home'    },
  { href: '/commons',   icon: '🌿', label: 'Commons' },
  { href: '/messages',  icon: '✉',  label: 'DMs'     },
  { href: '/settings',  icon: '⚙',  label: 'Settings'},
]

export default function MobileTabBar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { user } = useAuth()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery]           = useState('')

  if (!user) return null

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
      setSearchOpen(false)
    }
  }

  return (
    <>
      <style>{`
        .mobile-tabbar { display: none; }
        .mobile-search-overlay { display: none; }
        @media (max-width: 768px) {
          .mobile-tabbar {
            display: flex !important;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            z-index: 98;
            background: rgba(4,4,10,0.97);
            backdrop-filter: blur(20px);
            border-top: 0.5px solid var(--border);
            padding: 0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom));
          }
          .mobile-search-overlay {
            display: flex !important;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            z-index: 99;
            background: rgba(4,4,10,0.98);
            backdrop-filter: blur(24px);
            border-top: 0.5px solid var(--border-bright);
            padding: 1rem 1.25rem calc(1rem + env(safe-area-inset-bottom));
            flex-direction: column;
            gap: 0.75rem;
          }
          main { padding-bottom: 70px !important; }
        }
      `}</style>

      {/* Search overlay — slides up from bottom */}
      {searchOpen && (
        <div className="mobile-search-overlay">
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button onClick={() => { setSearchOpen(false); setQuery('') }} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'none', padding: '0.5rem', flexShrink: 0 }}>←</button>
            <form onSubmit={handleSearch} style={{ flex: 1 }}>
              <div style={{ position: 'relative' }}>
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search travellers, signals, debates..."
                  autoFocus
                  style={{ width: '100%', background: 'var(--deep)', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.7rem 1rem 0.7rem 2.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text)' }}
                />
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)' }}>⌕</span>
              </div>
            </form>
          </div>
          {/* Quick links */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['The Commons', 'The Forge', 'The Arena', 'Factions', 'The Deep'].map(label => {
              const hrefs: Record<string, string> = { 'The Commons': '/commons', 'The Forge': '/forge', 'The Arena': '/arena', 'Factions': '/factions', 'The Deep': '/the-deep' }
              return (
                <Link key={label} href={hrefs[label]} onClick={() => setSearchOpen(false)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)', border: '0.5px solid var(--border)', padding: '0.3rem 0.7rem', borderRadius: '99px', textDecoration: 'none' }}>
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <nav className="mobile-tabbar">
        {TABS.map(tab => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
          return (
            <Link key={tab.href} href={tab.href} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', textDecoration: 'none', padding: '0.4rem 0' }}>
              <span style={{ fontSize: '1.1rem', lineHeight: 1, opacity: active ? 1 : 0.4, filter: active ? 'none' : 'grayscale(1)', transition: 'all 0.15s' }}>{tab.icon}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.05em', color: active ? 'var(--aether)' : 'var(--text-dim)', transition: 'color 0.15s' }}>{tab.label}</span>
            </Link>
          )
        })}

        {/* Search tab — opens overlay */}
        <button onClick={() => setSearchOpen(true)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', background: 'none', border: 'none', cursor: 'none', padding: '0.4rem 0' }}>
          <span style={{ fontSize: '1.1rem', lineHeight: 1, opacity: 0.4, transition: 'all 0.15s' }}>⌕</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.05em', color: 'var(--text-dim)', transition: 'color 0.15s' }}>Search</span>
        </button>
      </nav>
    </>
  )
}
