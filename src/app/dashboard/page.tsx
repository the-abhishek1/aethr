'use client'
import Link from 'next/link'
import { WORLDS } from '@/lib/constants'
import SectionLabel from '@/components/ui/SectionLabel'
import GettingStarted from '@/components/ui/GettingStarted'
import SignalCard from '@/components/ui/SignalCard'
import WeeklyChallenge from '@/components/ui/WeeklyChallenge'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'

const PRESENCE_STATES = [
  { id: 'deep-work', label: 'Deep work',       color: '#1D9E75' },
  { id: 'open',      label: 'Open to connect', color: '#a89bff' },
  { id: 'creating',  label: 'Creating',        color: '#BA7517' },
  { id: 'exploring', label: 'Exploring',       color: '#378ADD' },
  { id: 'competing', label: 'In the Arena',    color: '#D85A30' },
  { id: 'resting',   label: 'Resting',         color: '#444441' },
]

const REP_FIELDS = [
  { key: 'wisdom',     color: '#a89bff' },
  { key: 'creativity', color: '#d4b896' },
  { key: 'discovery',  color: '#1D9E75' },
  { key: 'trust',      color: '#378ADD' },
  { key: 'debate',     color: '#D85A30' },
  { key: 'legacy',     color: '#888780' },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [presence, setPresence]   = useState('open')
  const [signals, setSignals]     = useState<any[]>([])
  const [following, setFollowing] = useState<any[]>([])
  const [rep, setRep]             = useState<any>(null)
  const [persona, setPersona]     = useState('creator')
  const [feedTab, setFeedTab]     = useState<'pulse'|'following'|'trending'>('pulse')
  const [trending, setTrending]   = useState<any>(null)
  const [loadingFeed, setLoadingFeed] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])

  const loadBase = useCallback(async () => {
    try {
      const [presRes, profRes] = await Promise.all([
        fetch('/api/presence'),
        fetch('/api/profile'),
      ])
      const [presData, profData] = await Promise.all([presRes.json(), profRes.json()])
      if (presData.presence?.state)      setPresence(presData.presence.state)
      if (profData.user?.reputation)     setRep(profData.user.reputation)
      if (profData.user?.personas?.[0])  setPersona(profData.user.personas[0].type)
    } catch {}
  }, [])

  const loadFeed = useCallback(async (tab: string) => {
    setLoadingFeed(true)
    try {
      if (tab === 'pulse') {
        const res = await fetch('/api/signals?limit=10')
        const data = await res.json()
        setSignals(data.signals || [])
      } else if (tab === 'following') {
        const res = await fetch('/api/signals?feed=following&limit=10')
        const data = await res.json()
        setFollowing(data.signals || [])
      } else if (tab === 'trending') {
        if (!trending) {
          const res = await fetch('/api/trending')
          const data = await res.json()
          setTrending(data)
        }
      }
    } catch {}
    setLoadingFeed(false)
  }, [trending])

  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?unread=true')
      const data = await res.json()
      setNotifications((data.notifications || []).slice(0, 5))
    } catch {}
  }, [])

  useEffect(() => { loadBase(); loadNotifications() }, [loadBase, loadNotifications])
  useEffect(() => { loadFeed(feedTab) }, [feedTab]) // eslint-disable-line

  const updatePresence = async (state: string) => {
    setPresence(state)
    await fetch('/api/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
    })
  }

  const totalRep = rep ? REP_FIELDS.reduce((s, r) => s + (rep[r.key] || 0), 0) : 0
  const currentFeedSignals = feedTab === 'following' ? following : signals

  const TYPE_ICON: Record<string, string> = {
    tip_received: '✦', debate_reply: '⚔️', signal_reply: '📡',
    discovery_ripple: '🔭', reaction: '🌀', new_follower: '👤',
    mystery_solved: '🌑', rep_trade: '💱', new_mystery: '🌑',
  }

  return (
    <>
      <style>{`
        .dash-root { padding: 7rem 2rem 4rem; max-width: 1200px; margin: 0 auto; }
        .dash-layout { display: grid; grid-template-columns: 200px 1fr 260px; gap: 1.5rem; align-items: start; }
        .presence-strip { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.25rem; margin-bottom: 1.5rem; scrollbar-width: none; flex-wrap: wrap; }
        .presence-strip::-webkit-scrollbar { display: none; }
        .pchip { display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.4rem 0.85rem; border-radius: 99px; border: 0.5px solid var(--border); background: transparent; cursor: none; white-space: nowrap; font-family: var(--font-mono); font-size: 0.58rem; color: var(--text-dim); transition: all 0.15s; }
        .pchip.active { background: rgba(168,155,255,0.1); border-color: var(--aether); color: var(--text); }
        .feed-tabs { display: flex; gap: 0.4rem; margin-bottom: 0.75rem; }
        @media (max-width: 1050px) { .dash-layout { grid-template-columns: 180px 1fr !important; } .dash-right { display: none !important; } }
        @media (max-width: 700px) {
          .dash-root { padding: 6.5rem 1.25rem 3rem !important; }
          .dash-layout { grid-template-columns: 1fr !important; gap: 1.25rem !important; }
          .dash-worlds { display: none !important; }
        }
      `}</style>

      <div className="dash-root">
        {/* Header */}
        <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <SectionLabel>Your galaxy</SectionLabel>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 300, lineHeight: 1.1 }}>
              Welcome back,<br /><em style={{ color: 'var(--aether)' }}>{user?.username || 'traveller'}.</em>
            </h1>
          </div>
          {totalRep > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 300, color: 'var(--aether)', lineHeight: 1 }}>{totalRep}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Total rep</div>
            </div>
          )}
        </div>

        <GettingStarted />
        <WeeklyChallenge />

        {/* Presence */}
        <div className="presence-strip">
          {PRESENCE_STATES.map(s => (
            <button key={s.id} className={`pchip${presence === s.id ? ' active' : ''}`} onClick={() => updatePresence(s.id)}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0, opacity: presence === s.id ? 1 : 0.4, boxShadow: presence === s.id ? `0 0 5px ${s.color}` : 'none', transition: 'all 0.2s' }} />
              {s.label}
            </button>
          ))}
        </div>

        <div className="dash-layout">
          {/* Left — worlds nav */}
          <div className="dash-worlds">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.6rem' }}>Worlds</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)' }}>
              {WORLDS.map(w => (
                <Link key={w.id} href={w.href} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0.9rem', background: 'var(--void)', textDecoration: 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--deep)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--void)' }}
                >
                  <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>{w.glyph}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.name}</div>
                  </div>
                  {w.status === 'live' && <span style={{ width: 5, height: 5, borderRadius: '50%', background: w.color, flexShrink: 0, boxShadow: `0 0 4px ${w.color}`, animation: 'pulse-soft 2.5s ease-in-out infinite' }} />}
                </Link>
              ))}
            </div>
          </div>

          {/* Center — feed */}
          <div>
            <div className="feed-tabs">
              {([
                { id: 'pulse',     label: '📡 Pulse' },
                { id: 'following', label: '👥 Following' },
                { id: 'trending',  label: '🔥 Trending' },
              ] as const).map(t => (
                <button key={t.id} onClick={() => setFeedTab(t.id)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.35rem 0.85rem', borderRadius: '2px', cursor: 'none', background: feedTab === t.id ? 'var(--aether-dim)' : 'transparent', border: `0.5px solid ${feedTab === t.id ? 'var(--aether)' : 'var(--border)'}`, color: feedTab === t.id ? 'var(--aether)' : 'var(--text-dim)', transition: 'all 0.15s' }}>{t.label}</button>
              ))}
            </div>

            {/* Pulse / Following feed */}
            {(feedTab === 'pulse' || feedTab === 'following') && (
              <div>
                {loadingFeed ? (
                  <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)' }}>Loading...</div>
                ) : currentFeedSignals.length === 0 ? (
                  <div style={{ padding: '2.5rem', textAlign: 'center', border: '0.5px solid var(--border)', borderRadius: '2px', background: 'var(--deep)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{feedTab === 'following' ? '👥' : '📡'}</div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      {feedTab === 'following' ? 'No signals from people you follow.' : 'The galaxy is quiet.'}
                    </p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>
                      {feedTab === 'following' ? 'Follow people to see their signals here.' : 'Be the first to drop a signal.'}
                    </p>
                    <Link href={feedTab === 'following' ? '/search' : '/commons'} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--aether)', border: '0.5px solid rgba(168,155,255,0.3)', padding: '0.6rem 1.25rem', borderRadius: '2px' }}>
                      {feedTab === 'following' ? 'Find people →' : 'Go to Commons →'}
                    </Link>
                  </div>
                ) : currentFeedSignals.map((s: any) => (
                  <SignalCard key={s.id} signal={s} />
                ))}
              </div>
            )}

            {/* Trending feed */}
            {feedTab === 'trending' && (
              <div style={{ border: '0.5px solid var(--border)', background: 'var(--deep)', borderRadius: '2px' }}>
                {loadingFeed || !trending ? (
                  <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)' }}>Loading trending...</div>
                ) : (
                  <>
                    {trending.signals?.length > 0 && (
                      <>
                        <div style={{ padding: '0.75rem 1.1rem', borderBottom: '0.5px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>🔥 Hot signals</div>
                        {trending.signals.slice(0,5).map((s: any) => (
                          <Link key={s.id} href={`/signals/${s.id}`} style={{ display: 'flex', gap: '0.75rem', padding: '0.9rem 1.1rem', borderBottom: '0.5px solid var(--border)', textDecoration: 'none', transition: 'background 0.15s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--mid)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                          >
                            <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>{s.author?.avatarEmoji}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.4, marginBottom: '0.2rem' }}>{s.content.slice(0,80)}{s.content.length > 80 ? '…' : ''}</div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--text-dim)' }}>@{s.author?.username} · {s._count?.reactions || 0} reactions · {s._count?.replies || 0} replies</div>
                            </div>
                          </Link>
                        ))}
                      </>
                    )}
                    {trending.debates?.length > 0 && (
                      <>
                        <div style={{ padding: '0.75rem 1.1rem', borderBottom: '0.5px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>⚔️ Hot debates</div>
                        {trending.debates.slice(0,3).map((d: any) => (
                          <Link key={d.id} href="/arena" style={{ display: 'block', padding: '0.9rem 1.1rem', borderBottom: '0.5px solid var(--border)', textDecoration: 'none', transition: 'background 0.15s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--mid)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                          >
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.2rem' }}>{d.title}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: '#D85A30' }}>{d._count?.arguments || 0} arguments · {d._count?.votes || 0} votes</div>
                          </Link>
                        ))}
                      </>
                    )}
                    {trending.discoveries?.length > 0 && (
                      <>
                        <div style={{ padding: '0.75rem 1.1rem', borderBottom: '0.5px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>🔭 Rippling</div>
                        {trending.discoveries.map((d: any) => (
                          <div key={d.id} style={{ padding: '0.9rem 1.1rem', borderBottom: '0.5px solid var(--border)' }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.2rem' }}>{d.title}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: '#378ADD' }}>@{d.author?.username} · {d.ripples} ripples</div>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="dash-right" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Unread notifications */}
            {notifications.length > 0 && (
              <div style={{ border: '0.5px solid rgba(168,155,255,0.2)', borderRadius: '2px', background: 'var(--deep)', overflow: 'hidden' }}>
                <div style={{ padding: '0.65rem 1rem', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--aether)' }}>🔔 Unread</span>
                  <Link href="/notifications" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--text-dim)', textDecoration: 'none' }}>See all →</Link>
                </div>
                {notifications.map((n: any) => (
                  <div key={n.id} style={{ padding: '0.7rem 1rem', borderBottom: '0.5px solid var(--border)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>{TYPE_ICON[n.type] || '📡'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-muted)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reputation */}
            <div style={{ border: '0.5px solid var(--border)', background: 'var(--deep)', borderRadius: '2px', padding: '1rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Reputation</div>
              {rep ? REP_FIELDS.map(r => (
                <div key={r.key} style={{ marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.18rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>{r.key}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: r.color }}>{rep[r.key] || 0}</span>
                  </div>
                  <div style={{ height: 1, background: 'var(--border)' }}>
                    <div style={{ height: '100%', width: `${Math.min(rep[r.key] || 0, 100)}%`, background: r.color, opacity: 0.7 }} />
                  </div>
                </div>
              )) : (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)', lineHeight: 1.8 }}>Participate to earn rep.</p>
              )}
              <Link href="/market" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)', textDecoration: 'none', marginTop: '0.5rem', display: 'block' }}>Leaderboard →</Link>
            </div>

            {/* Active persona */}
            <div style={{ border: '0.5px solid var(--border-bright)', background: 'var(--deep)', borderRadius: '2px', padding: '1rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Persona</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--aether)', textTransform: 'capitalize', marginBottom: '0.25rem' }}>{persona}</div>
              <Link href="/profile" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)', textDecoration: 'none' }}>Manage →</Link>
            </div>

            {/* Quick links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {[
                { label: '🌿 The Commons',  href: '/commons',   color: '#1D9E75' },
                { label: '🔥 The Forge',    href: '/forge',     color: '#BA7517' },
                { label: '⚔️ The Arena',   href: '/arena',     color: '#D85A30' },
                { label: '🌑 The Void',     href: '/the-void',  color: '#7F77DD' },
                { label: '📺 Galaxy TV',    href: '/galaxy-tv', color: 'var(--gold)' },
              ].map(a => (
                <Link key={a.label} href={a.href} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.04em', textDecoration: 'none', color: a.color, padding: '0.55rem 0.85rem', border: `0.5px solid ${a.color}22`, borderRadius: '2px', display: 'flex', justifyContent: 'space-between', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${a.color}0d`}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >{a.label} <span>→</span></Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
