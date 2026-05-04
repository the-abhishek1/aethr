'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import SectionLabel from '@/components/ui/SectionLabel'
import { useAuth } from '@/context/AuthContext'

const TYPE_ICON: Record<string, string> = {
  tip_received: '✦', debate_reply: '⚔️', faction_joined: '🏴',
  signal_reply: '📡', discovery_ripple: '🔭', message: '✉',
  reaction: '🌀', mystery_solved: '🌑', rep_trade: '💱',
  welcome: '⚗️', new_follower: '👤', new_mystery: '🌑',
  debate_vote: '⚔️', milestone: '🏛️',
}

const TYPE_COLOR: Record<string, string> = {
  tip_received: '#BA7517', debate_reply: '#D85A30', signal_reply: '#1D9E75',
  discovery_ripple: '#378ADD', reaction: '#a89bff', new_follower: '#a89bff',
  mystery_solved: '#7F77DD', rep_trade: '#639922', new_mystery: '#7F77DD',
  message: '#378ADD', milestone: '#d4b896',
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading]             = useState(true)
  const [filter, setFilter]               = useState<'all'|'unread'>('all')
  const [marking, setMarking]             = useState(false)

  const load = useCallback(async () => {
    const url = filter === 'unread' ? '/api/notifications?unread=true' : '/api/notifications'
    const res = await fetch(url)
    const data = await res.json()
    setNotifications(data.notifications || [])
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])

  const markAllRead = async () => {
    setMarking(true)
    await fetch('/api/notifications', { method: 'PATCH' })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setMarking(false)
  }

  const markRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  // Group by date
  const grouped: Record<string, any[]> = {}
  for (const n of notifications) {
    const date = new Date(n.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(n)
  }

  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Link href="/signin" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--aether)', textDecoration: 'none' }}>Sign in to view notifications →</Link>
    </div>
  )

  return (
    <>
      <style>{`
        .notif-pad { padding: 7rem 2rem 4rem; max-width: 680px; margin: 0 auto; }
        @media (max-width: 640px) { .notif-pad { padding: 6rem 1.25rem 3rem !important; } }
      `}</style>

      <div className="notif-pad">
        <SectionLabel>Updates</SectionLabel>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 300, lineHeight: 0.95 }}>
            🔔 Notifications
            {unreadCount > 0 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--aether)', marginLeft: '0.75rem', border: '0.5px solid rgba(168,155,255,0.4)', padding: '0.2rem 0.6rem', borderRadius: '99px', verticalAlign: 'middle' }}>{unreadCount} new</span>}
          </h1>
          {unreadCount > 0 && (
            <button onClick={markAllRead} disabled={marking} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.5rem 1.1rem', background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--text-dim)', borderRadius: '2px', cursor: 'none' }}>
              {marking ? '...' : 'Mark all read'}
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem' }}>
          {(['all', 'unread'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'capitalize', padding: '0.35rem 0.85rem', borderRadius: '2px', cursor: 'none', background: filter === f ? 'var(--aether-dim)' : 'transparent', border: `0.5px solid ${filter === f ? 'var(--aether)' : 'var(--border)'}`, color: filter === f ? 'var(--aether)' : 'var(--text-dim)', transition: 'all 0.15s' }}>{f}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>Loading...</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', border: '0.5px solid var(--border)', borderRadius: '2px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text-muted)' }}>
              {filter === 'unread' ? 'All caught up.' : 'No notifications yet.'}
            </p>
          </div>
        ) : (
          <div>
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date} style={{ marginBottom: '2rem' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '0.5px solid var(--border)' }}>{date}</div>
                <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                  {items.map((n: any) => (
                    <div key={n.id} onClick={() => !n.read && markRead(n.id)} style={{ display: 'flex', gap: '1rem', padding: '1rem 1.25rem', borderBottom: '0.5px solid var(--border)', background: n.read ? 'transparent' : 'rgba(168,155,255,0.03)', cursor: n.read ? 'default' : 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => { if (!n.read) (e.currentTarget as HTMLElement).style.background = 'var(--deep)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = n.read ? 'transparent' : 'rgba(168,155,255,0.03)' }}
                    >
                      {/* Icon */}
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${TYPE_COLOR[n.type] || '#a89bff'}18`, border: `0.5px solid ${TYPE_COLOR[n.type] || '#a89bff'}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                        {TYPE_ICON[n.type] || '📡'}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: n.read ? 'var(--text-muted)' : 'var(--text)', lineHeight: 1.4 }}>{n.title}</div>
                          {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--aether)', flexShrink: 0, marginTop: 4, boxShadow: '0 0 5px var(--aether)' }} />}
                        </div>
                        {n.body && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: '0.3rem' }}>{n.body}</div>}
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)' }}>
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {n.link && (
                            <Link href={n.link} onClick={e => e.stopPropagation()} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: TYPE_COLOR[n.type] || 'var(--aether)', textDecoration: 'none' }}>View →</Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
