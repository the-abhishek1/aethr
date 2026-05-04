'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import SectionLabel from '@/components/ui/SectionLabel'
import SignalCard from '@/components/ui/SignalCard'
import Link from 'next/link'

const REP_COLORS: Record<string, string> = {
  wisdom: '#a89bff', creativity: '#d4b896', discovery: '#1D9E75',
  trust: '#378ADD', debate: '#D85A30', legacy: '#888780',
}

const AVATARS = ['⚗️','🌀','🔭','⚔️','🌿','🔥','🌑','🪞','🏛️','🌊','🦉','🧬','🌙','⚡','🎭','🧿','🔮','🌌','🦋','🌀']

export default function ProfilePage() {
  const { user, refresh } = useAuth()
  const [data, setData]           = useState<any>(null)
  const [loading, setLoading]     = useState(true)
  const [editing, setEditing]     = useState(false)
  const [bio, setBio]             = useState('')
  const [avatarEmoji, setAvatarEmoji] = useState('')
  const [saving, setSaving]       = useState(false)
  const [tab, setTab]             = useState<'signals'|'rooms'|'factions'>('signals')

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(d => {
        setData(d)
        setBio(d.user?.bio || '')
        setAvatarEmoji(d.user?.avatarEmoji || '⚗️')
        setLoading(false)
      })
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    await Promise.all([
      fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, avatarEmoji }),
      }),
      fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_profile', bio, avatarEmoji }),
      })
    ])
    await refresh()
    setEditing(false)
    setSaving(false)
    // Refresh local data
    fetch('/api/profile').then(r => r.json()).then(setData)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.2em' }}>
      Loading your identity...
    </div>
  )

  const u       = data?.user
  const rep     = u?.reputation
  const rooms   = u?.roomMembers || []
  const factions = u?.factionMembers || []
  const signals = data?.signals || []
  const counts  = u?._count || {}
  const totalRep = rep ? Object.entries(REP_COLORS).reduce((s, [k]) => s + ((rep as any)[k] || 0), 0) : 0
  const joinedDate = u?.joinedAt ? new Date(u.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''

  return (
    <>
      <style>{`
        .profile-layout { display: grid; grid-template-columns: 1fr 300px; gap: 2rem; }
        .profile-pad { padding: 7rem 2rem 4rem; max-width: 1000px; margin: 0 auto; }
        @media (max-width: 900px) { .profile-layout { grid-template-columns: 1fr !important; } }
        @media (max-width: 640px) { .profile-pad { padding: 6rem 1.25rem 3rem !important; } }
      `}</style>

      <div className="profile-pad">
        {/* Header */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ flexShrink: 0 }}>
            {editing ? (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)', marginBottom: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Choose avatar</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', maxWidth: 200 }}>
                  {AVATARS.map(a => (
                    <button key={a} onClick={() => setAvatarEmoji(a)} style={{ width: 36, height: 36, borderRadius: '50%', border: `1.5px solid ${avatarEmoji === a ? 'var(--aether)' : 'var(--border)'}`, background: avatarEmoji === a ? 'var(--aether-dim)' : 'var(--deep)', fontSize: '1.1rem', cursor: 'none', boxShadow: avatarEmoji === a ? '0 0 8px rgba(168,155,255,0.4)' : 'none', transition: 'all 0.15s' }}>{a}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--surface)', border: '0.5px solid var(--border-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem' }}>
                  {u?.avatarEmoji}
                </div>
                <div style={{ position: 'absolute', bottom: 4, right: 4, width: 14, height: 14, borderRadius: '50%', background: 'var(--aether)', border: '2px solid var(--void)', boxShadow: '0 0 8px var(--aether)' }} />
              </div>
            )}
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--aether)', marginTop: '0.5rem', textAlign: 'center' }}>
              {u?.presence?.state || 'open'}
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <SectionLabel>Your identity</SectionLabel>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 300, lineHeight: 1, marginBottom: '0.35rem' }}>
              {u?.username}
            </h1>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
              {u?.email} · Joined {joinedDate}
            </div>

            {editing ? (
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell the galaxy who you are..." rows={3}
                style={{ width: '100%', background: 'var(--deep)', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text)', resize: 'vertical', marginBottom: '1rem' }} />
            ) : (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '0.75rem' }}>
                {u?.bio || <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>No bio yet — tell the galaxy who you are</span>}
              </p>
            )}

            {/* Persona chips */}
            {u?.personas?.length > 0 && (
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {u.personas.map((p: any) => (
                  <span key={p.id} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', padding: '0.2rem 0.7rem', borderRadius: '2px', border: `0.5px solid ${p.isActive ? 'var(--aether)' : 'var(--border)'}`, color: p.isActive ? 'var(--aether)' : 'var(--text-dim)' }}>{p.name}</span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {editing ? (
                <>
                  <button onClick={saveProfile} disabled={saving} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 1.25rem', background: 'var(--aether)', color: 'var(--void)', border: 'none', borderRadius: '2px', cursor: 'none' }}>{saving ? 'Saving...' : 'Save'}</button>
                  <button onClick={() => setEditing(false)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 1.25rem', background: 'transparent', color: 'var(--text-dim)', border: '0.5px solid var(--border)', borderRadius: '2px', cursor: 'none' }}>Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => setEditing(true)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 1.1rem', background: 'transparent', color: 'var(--text-muted)', border: '0.5px solid var(--border)', borderRadius: '2px', cursor: 'none' }}>Edit profile</button>
                  <Link href="/settings" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 1.1rem', background: 'transparent', color: 'var(--text-dim)', border: '0.5px solid var(--border)', borderRadius: '2px', textDecoration: 'none' }}>Settings</Link>
                </>
              )}
            </div>
          </div>

          {/* Rep badge */}
          <div style={{ border: '0.5px solid var(--border-bright)', borderRadius: '2px', padding: '1.25rem', background: 'var(--deep)', flexShrink: 0, minWidth: 160 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Reputation</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 300, color: 'var(--aether)', lineHeight: 1, marginBottom: '0.5rem' }}>{totalRep}</div>
            {rep && Object.entries(REP_COLORS).map(([key, color]) => (rep as any)[key] > 0 && (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>{key}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color }}>{(rep as any)[key]}</span>
              </div>
            ))}
            <Link href="/market" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)', textDecoration: 'none', display: 'block', marginTop: '0.5rem' }}>Leaderboard →</Link>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: 1, background: 'var(--border)', border: '0.5px solid var(--border)', marginBottom: '2rem' }}>
          {[
            { label: 'Signals',     val: counts.signals     || 0, color: '#1D9E75', href: undefined },
            { label: 'Discoveries', val: counts.discoveries || 0, color: '#378ADD', href: '/the-deep' },
            { label: 'Followers',   val: counts.followers   || 0, color: 'var(--aether)', href: undefined },
            { label: 'Following',   val: counts.following   || 0, color: 'var(--text-muted)', href: undefined },
            { label: 'Factions',    val: factions.length,         color: '#D85A30', href: '/factions' },
            { label: 'Rooms',       val: rooms.length,            color: '#BA7517', href: '/commons' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, padding: '1rem', background: 'var(--deep)', textAlign: 'center', cursor: s.href ? 'none' : 'default', transition: 'background 0.15s' }}
              onClick={() => s.href && (window.location.href = s.href)}
              onMouseEnter={e => { if (s.href)(e.currentTarget as HTMLElement).style.background = 'var(--mid)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--deep)' }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.25rem,3vw,1.75rem)', fontWeight: 300, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="profile-layout">
          {/* Left — content tabs */}
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {(['signals', 'rooms', 'factions'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'capitalize', padding: '0.4rem 1rem', borderRadius: '2px', cursor: 'none', background: tab === t ? 'var(--aether-dim)' : 'transparent', border: `0.5px solid ${tab === t ? 'var(--aether)' : 'var(--border)'}`, color: tab === t ? 'var(--aether)' : 'var(--text-dim)', transition: 'all 0.15s' }}>
                  {t === 'signals' ? `📡 Signals (${counts.signals || 0})` : t === 'rooms' ? `🏛️ Rooms (${rooms.length})` : `⚔️ Factions (${factions.length})`}
                </button>
              ))}
            </div>

            {/* Signals tab */}
            {tab === 'signals' && (
              <div>
                {signals.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', border: '0.5px solid var(--border)', borderRadius: '2px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📡</div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>No signals yet.</p>
                    <Link href="/commons" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--aether)', border: '0.5px solid rgba(168,155,255,0.3)', padding: '0.6rem 1.25rem', borderRadius: '2px' }}>Go to The Commons →</Link>
                  </div>
                ) : signals.map((s: any) => <SignalCard key={s.id} signal={s} showReplies={false} />)}
                {signals.length > 0 && (
                  <Link href="/commons" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)', textDecoration: 'none', display: 'block', textAlign: 'center', padding: '1rem', borderTop: '0.5px solid var(--border)' }}>Post a new signal →</Link>
                )}
              </div>
            )}

            {/* Rooms tab */}
            {tab === 'rooms' && (
              <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                {rooms.length === 0 ? (
                  <div style={{ padding: '2.5rem', textAlign: 'center' }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>No memory rooms yet.</p>
                    <Link href="/commons" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--aether)', border: '0.5px solid rgba(168,155,255,0.3)', padding: '0.6rem 1.25rem', borderRadius: '2px' }}>Browse rooms →</Link>
                  </div>
                ) : rooms.map((rm: any) => (
                  <Link key={rm.id} href={`/rooms/${rm.room.id}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderBottom: '0.5px solid var(--border)', textDecoration: 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--deep)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: '50%', border: `0.5px solid ${rm.room.color}55`, background: `${rm.room.color}11`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>🏛️</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)' }}>{rm.room.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)' }}>{rm.room._count?.members || 0} members</div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: rm.room.color }}>Enter →</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Factions tab */}
            {tab === 'factions' && (
              <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                {factions.length === 0 ? (
                  <div style={{ padding: '2.5rem', textAlign: 'center' }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>Not in any faction yet.</p>
                    <Link href="/factions" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: '#D85A30', border: '0.5px solid rgba(216,90,48,0.3)', padding: '0.6rem 1.25rem', borderRadius: '2px' }}>Browse factions →</Link>
                  </div>
                ) : factions.map((fm: any) => (
                  <Link key={fm.id} href={`/factions/${fm.faction.id}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderBottom: '0.5px solid var(--border)', textDecoration: 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--deep)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: fm.faction.color, flexShrink: 0, boxShadow: `0 0 6px ${fm.faction.color}` }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)' }}>{fm.faction.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>{fm.role}</div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: fm.faction.color }}>View →</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar — rep detail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Full rep breakdown */}
            <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', padding: '1.25rem', background: 'var(--deep)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1.1rem' }}>Rep breakdown</div>
              {rep ? Object.entries(REP_COLORS).map(([key, color]) => (
                <div key={key} style={{ marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{key}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color, fontWeight: 500 }}>{(rep as any)[key] || 0}</span>
                  </div>
                  <div style={{ height: 2, background: 'var(--border)', borderRadius: 1 }}>
                    <div style={{ height: '100%', width: `${Math.min((rep as any)[key] || 0, 100)}%`, background: color, borderRadius: 1, opacity: 0.8, transition: 'width 1s ease' }} />
                  </div>
                </div>
              )) : (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)', lineHeight: 1.8 }}>Start participating to build your reputation.</p>
              )}
            </div>

            {/* Quick links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {[
                { label: '📊 Leaderboard',    href: '/market' },
                { label: '💱 Trade rep',       href: '/market' },
                { label: '🌑 Solve a mystery', href: '/the-void' },
                { label: '🔭 Drop discovery',  href: '/the-deep' },
                { label: '⚔️ Open a debate',  href: '/arena' },
              ].map(a => (
                <Link key={a.label} href={a.href} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.04em', textDecoration: 'none', color: 'var(--text-dim)', padding: '0.5rem 0.85rem', border: '0.5px solid var(--border)', borderRadius: '2px', display: 'flex', justifyContent: 'space-between', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--aether)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(168,155,255,0.3)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}
                >{a.label} <span>→</span></Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
