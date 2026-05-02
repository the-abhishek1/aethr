'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const TABS = [
  { href: '/dashboard', icon: '⬡', label: 'Home' },
  { href: '/worlds',    icon: '🌌', label: 'Worlds' },
  { href: '/search',    icon: '⌕',  label: 'Search' },
  { href: '/messages',  icon: '✉',  label: 'Messages' },
  { href: '/profile',   icon: '⚗️', label: 'Profile' },
]

export default function MobileTabBar() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user) return null

  return (
    <>
      <style>{`
        .mobile-tabbar { display: none; }
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
        }
        /* Push page content above tab bar on mobile */
        @media (max-width: 768px) {
          main { padding-bottom: 70px !important; }
        }
      `}</style>

      <nav className="mobile-tabbar">
        {TABS.map(tab => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
          return (
            <Link key={tab.href} href={tab.href} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '0.2rem',
              textDecoration: 'none', padding: '0.4rem 0',
              transition: 'opacity 0.15s',
            }}>
              <span style={{
                fontSize: tab.icon === '⌕' ? '1.1rem' : '1.1rem',
                lineHeight: 1,
                opacity: active ? 1 : 0.4,
                filter: active ? 'none' : 'grayscale(1)',
                transition: 'all 0.15s',
              }}>{tab.icon}</span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.5rem',
                letterSpacing: '0.05em',
                color: active ? 'var(--aether)' : 'var(--text-dim)',
                transition: 'color 0.15s',
              }}>{tab.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
