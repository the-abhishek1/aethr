'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRealtimeNotifications } from '@/hooks/useRealtime'

const TYPE_ICON: Record<string, string> = {
  tip_received:      '✦',
  debate_reply:      '⚔️',
  faction_joined:    '🏴',
  signal_reply:      '📡',
  discovery_ripple:  '🔭',
  message:           '✉',
  reaction:          '🌀',
  mystery_solved:    '🌑',
  rep_trade:         '💱',
  welcome:           '⚗️',
}

export default function NotificationBell() {
  const { user } = useAuth()
  const [unread, setUnread]               = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [open, setOpen]                   = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    if (!user) return
    const res  = await fetch('/api/notifications')
    const data = await res.json()
    setUnread(data.unreadCount || 0)
    setNotifications(data.notifications || [])
  }, [user])

  // Initial load + 30s poll fallback
  useEffect(() => {
    if (user) load()
    const iv = setInterval(() => { if (user) load() }, 30000)
    return () => clearInterval(iv)
  }, [user, load])

  // Live realtime — new notifications pop instantly
  useRealtimeNotifications(useCallback((n: any) => {
    setUnread(prev => prev + 1)
    setNotifications(prev => [n, ...prev])
  }, []))

  // Click outside to close
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const markAllRead = useCallback(async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
    setUnread(0)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  if (!user) return null

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen(o => !o); if (!open && unread > 0) markAllRead() }}
        style={{ background: 'none', border: 'none', cursor: 'none', position: 'relative', padding: '4px', display: 'flex', alignItems: 'center' }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: unread > 0 ? 'var(--aether)' : 'var(--text-dim)' }}>⬡</span>
        {unread > 0 && (
          <span style={{ position: 'absolute', top: 0, right: 0, width: 14, height: 14, borderRadius: '50%', background: '#D85A30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.48rem', color: 'white', fontWeight: 700 }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: 320, background: 'rgba(8,8,20,0.98)', border: '0.5px solid var(--border-bright)', borderRadius: '4px', backdropFilter: 'blur(20px)', zIndex: 200, animation: 'fadeUp 0.2s ease', maxHeight: 420, overflowY: 'auto' }}>
          <div style={{ padding: '0.85rem 1rem', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'rgba(8,8,20,0.98)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Notifications</span>
            {notifications.some(n => !n.read) && (
              <button onClick={markAllRead} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--aether)', background: 'none', border: 'none', cursor: 'none' }}>Mark all read</button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)' }}>The galaxy is quiet.</div>
          ) : notifications.map(n => (
            <Link key={n.id} href={n.link || '/dashboard'} onClick={() => setOpen(false)} style={{ display: 'block', padding: '0.85rem 1rem', borderBottom: '0.5px solid var(--border)', textDecoration: 'none', background: n.read ? 'transparent' : 'rgba(168,155,255,0.04)', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = n.read ? 'transparent' : 'rgba(168,155,255,0.04)'}
            >
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.9rem', flexShrink: 0, marginTop: 1 }}>{TYPE_ICON[n.type] || '●'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: n.read ? 'var(--text-muted)' : 'var(--text)', lineHeight: 1.4, marginBottom: '0.2rem' }}>{n.title}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.57rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>{n.body}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {!n.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--aether)', flexShrink: 0, marginTop: 4, boxShadow: '0 0 5px var(--aether)' }} />}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
