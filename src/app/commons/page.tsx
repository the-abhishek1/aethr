'use client'
import { useState, useEffect, useCallback } from 'react'
import SectionLabel from '@/components/ui/SectionLabel'
import SignalComposer from '@/components/ui/SignalComposer'
import SignalCard from '@/components/ui/SignalCard'
import { SignalSkeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/context/AuthContext'
import { useRealtimeSignals } from '@/hooks/useRealtime'

const PRESENCE_STATES = [
  { id: 'open', label: 'Open', color: '#a89bff' },
  { id: 'creating', label: 'Creating', color: '#BA7517' },
  { id: 'exploring', label: 'Exploring', color: '#378ADD' },
  { id: 'deep-work', label: 'Deep work', color: '#1D9E75' },
]

export default function CommonsPage() {
  const { user } = useAuth()
  const [presence, setPresence] = useState('open')
  const [feedTab, setFeedTab] = useState<'all'|'following'>('all')
  const [rooms, setRooms] = useState<any[]>([])
  const [signals, setSignals] = useState<any[]>([])
  const [loadingSignals, setLoadingSignals] = useState(true)
  const [newRoom, setNewRoom] = useState('')
  const [creatingRoom, setCreatingRoom] = useState(false)
  const [showRoomInput, setShowRoomInput] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [presenceUsers, setPresenceUsers] = useState<any[]>([])

  const loadRooms = useCallback(async () => {
    const res = await fetch('/api/rooms?world=commons')
    const data = await res.json()
    setRooms(data.rooms || [])
  }, [])

  const loadSignals = useCallback(async () => {
    setLoadingSignals(true)
    const url = feedTab === 'following'
      ? '/api/signals?feed=following&limit=20'
      : '/api/signals?world=commons&limit=20'
    const res = await fetch(url)
    const data = await res.json()
    setSignals(data.signals || [])
    setLoadingSignals(false)
  }, [feedTab])

  useEffect(() => {
    loadRooms()
    loadSignals()
    // Load real presence users
    fetch('/api/presence/all').then(r => r.json()).then(d => setPresenceUsers(d.users || [])).catch(() => {})
  }, [loadRooms, loadSignals])

  // Live realtime — new signals appear instantly
  useRealtimeSignals('commons', setSignals)

  const updatePresence = async (state: string) => {
    setPresence(state)
    await fetch('/api/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state, worldId: 'commons' }),
    })
  }

  const createRoom = async () => {
    if (!newRoom.trim()) return
    setCreatingRoom(true)
    await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newRoom, worldId: 'commons' }),
    })
    setNewRoom('')
    setShowRoomInput(false)
    setCreatingRoom(false)
    loadRooms()
  }

  const joinRoom = async (id: string) => {
    await fetch(`/api/rooms/${id}`, { method: 'POST' })
    loadRooms()
  }

  // Real presence users positioned around the map
  const STATE_COLORS: Record<string,string> = { 'deep-work':'#1D9E75', 'open':'#a89bff', 'creating':'#BA7517', 'exploring':'#378ADD', 'competing':'#D85A30', 'resting':'#444441' }
  // Deterministic positions based on user id
  const getPos = (id: string, i: number) => {
    const angles = [30,75,120,160,200,240,290,330]
    const radii  = [28,35,38,32,40,30,36,42]
    const angle  = (angles[i % angles.length] + parseInt(id.slice(-2),16) % 15) * Math.PI / 180
    const r      = radii[i % radii.length]
    return { x: `${45 + r * Math.cos(angle)}%`, y: `${50 + r * Math.sin(angle)}%` }
  }

  return (
    <>
      <style>{`
        .commons-layout { display: grid; grid-template-columns: 1fr 300px; }
        .commons-map { position: relative; border-right: 0.5px solid var(--border); min-height: 320px; }
        .mood-bar { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .commons-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; padding: 0 1.5rem 2rem; border-bottom: 0.5px solid var(--border); }
        .signals-area { padding: 1.5rem; border-top: 0.5px solid var(--border); }
        @media (max-width: 768px) {
          .commons-layout { grid-template-columns: 1fr !important; }
          .commons-map { height: 280px; border-right: none !important; border-bottom: 0.5px solid var(--border); }
          .commons-header { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>

      <div style={{ paddingTop: '7rem' }}>
        {/* Header */}
        <div className="commons-header">
          <div>
            <SectionLabel>World I</SectionLabel>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,6vw,4rem)', fontWeight: 300, lineHeight: 0.95 }}>🌿 The Commons</h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
              {user?.username && <span style={{ color: 'var(--aether)' }}>@{user.username}</span>} · Ambient, open
            </p>
          </div>
          <div className="mood-bar">
            {PRESENCE_STATES.map(m => (
              <button key={m.id} onClick={() => updatePresence(m.id)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.08em', padding: '0.4rem 0.8rem', borderRadius: '2px', cursor: 'none', border: `0.5px solid ${presence === m.id ? m.color : 'var(--border)'}`, background: presence === m.id ? `${m.color}18` : 'transparent', color: presence === m.id ? m.color : 'var(--text-dim)' }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: m.color, marginRight: '0.4rem', opacity: presence === m.id ? 1 : 0.4, boxShadow: presence === m.id ? `0 0 5px ${m.color}` : 'none' }} />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="commons-layout">
          {/* Left: presence map + signals */}
          <div>
            {/* Presence map */}
            <div className="commons-map" style={{ height: 320 }}>
              <div style={{ position: 'absolute', top: '1rem', left: '1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Presence map</div>
              {[180, 260, 340].map(r => (
                <div key={r} style={{ position: 'absolute', top: '50%', left: '45%', width: r, height: r, borderRadius: '50%', border: '0.5px solid var(--border)', transform: 'translate(-50%,-50%)', opacity: 0.35, pointerEvents: 'none' }} />
              ))}
              {/* Real user dot */}
              {user && (
                <div style={{ position: 'absolute', left: '45%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 3 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--surface)', border: `2px solid var(--aether)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', boxShadow: '0 0 12px rgba(168,155,255,0.4)', position: 'relative' }}>
                    {user.avatarEmoji}
                    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, borderRadius: '50%', background: PRESENCE_STATES.find(p => p.id === presence)?.color || 'var(--aether)', border: '2px solid var(--void)', boxShadow: `0 0 6px ${PRESENCE_STATES.find(p => p.id === presence)?.color || 'var(--aether)'}` }} />
                  </div>
                  <div style={{ position: 'absolute', top: '-1.5rem', left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--aether)', whiteSpace: 'nowrap' }}>You</div>
                </div>
              )}
              {/* Real presence dots */}
              {presenceUsers.filter(p => p.id !== user?.id).map((p, i) => {
                const pos   = getPos(p.id, i)
                const color = STATE_COLORS[p.presence?.state] || '#a89bff'
                const key   = p.username
                return (
                  <div key={key} onClick={() => setSelected(selected === key ? null : key)} style={{ position: 'absolute', left: pos.x, top: pos.y, cursor: 'none', transform: 'translate(-50%,-50%)', zIndex: 2 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface)', border: `0.5px solid ${selected === key ? color : color+'44'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', boxShadow: `0 0 ${selected===key?12:4}px ${color}${selected===key?'66':'22'}`, transition: 'all 0.25s', position: 'relative' }}>
                      {p.avatarEmoji}
                      <div style={{ position: 'absolute', bottom: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: color, border: '1.5px solid var(--void)' }} />
                    </div>
                    {selected === key && (
                      <div style={{ position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)', background: 'var(--deep)', border: '0.5px solid var(--border-bright)', borderRadius: '2px', padding: '0.4rem 0.75rem', whiteSpace: 'nowrap', zIndex: 10 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)' }}>@{p.username}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color }}>{p.presence?.state || 'open'}</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Signals feed */}
            <div className="signals-area">
              {/* Feed tabs */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {(['all', 'following'] as const).map(t => (
                  <button key={t} onClick={() => setFeedTab(t)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'capitalize', padding: '0.35rem 0.85rem', borderRadius: '2px', cursor: 'none', background: feedTab === t ? 'var(--aether-dim)' : 'transparent', border: `0.5px solid ${feedTab === t ? 'var(--aether)' : 'var(--border)'}`, color: feedTab === t ? 'var(--aether)' : 'var(--text-dim)' }}>{t === 'all' ? '🌿 All' : '👥 Following'}</button>
                ))}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                {user ? (
                  <SignalComposer worldId="commons" onPosted={sig => setSignals(prev => [sig, ...prev])} />
                ) : (
                  <a href="/signup" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.1rem', background: 'var(--deep)', border: '0.5px solid var(--border-bright)', borderRadius: '2px', textDecoration: 'none', transition: 'border-color 0.2s' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>Join Aethr to drop signals into the galaxy...</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--aether)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>Join free →</span>
                  </a>
                )}
              </div>
              {loadingSignals ? (
                <>{[1,2,3].map(i => <SignalSkeleton key={i} />)}</>
              ) : signals.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', border: '0.5px solid var(--border)', borderRadius: '2px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{feedTab === 'following' ? '👥' : '📡'}</div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    {feedTab === 'following' ? 'Follow people to see their signals here.' : 'No signals yet.'}
                  </p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>
                    {feedTab === 'following' ? 'Find people to follow by visiting their profiles.' : 'Be the first to drop a signal in The Commons.'}
                  </p>
                  {feedTab === 'following' ? (
                    <a href="/search" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--aether)', border: '0.5px solid rgba(168,155,255,0.3)', padding: '0.6rem 1.25rem', borderRadius: '2px', display: 'inline-block' }}>Search people →</a>
                  ) : !user && (
                    <a href="/signup" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--void)', background: 'var(--aether)', padding: '0.6rem 1.25rem', borderRadius: '2px', display: 'inline-block' }}>Join to post →</a>
                  )}
                </div>
              ) : signals.map((s: any) => (
                <SignalCard key={s.id} signal={s} />
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderLeft: '0.5px solid var(--border)' }}>
            {/* Memory rooms */}
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Memory rooms</div>
              {rooms.length === 0 ? (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)', lineHeight: 1.8, marginBottom: '0.75rem' }}>No rooms yet. Create the first one.</p>
              ) : rooms.map((r: any) => (
                <div key={r.id} style={{ padding: '0.75rem 0', borderBottom: '0.5px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)' }}>{r.name}</span>
                    {r.members.length === 0 && (
                      <button onClick={() => joinRoom(r.id)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--aether)', background: 'transparent', border: '0.5px solid var(--aether)44', padding: '0.2rem 0.6rem', borderRadius: '2px', cursor: 'none' }}>Join</button>
                    )}
                    {r.members.length > 0 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: '#1D9E75' }}>Joined</span>}
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)' }}>{r._count.members} members</span>
                </div>
              ))}

              {showRoomInput ? (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input value={newRoom} onChange={e => setNewRoom(e.target.value)} placeholder="Room name..." onKeyDown={e => e.key === 'Enter' && createRoom()} autoFocus style={{ background: 'transparent', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.5rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text)' }} />
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={createRoom} disabled={creatingRoom} style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.45rem', background: 'var(--aether)', color: 'var(--void)', border: 'none', borderRadius: '2px', cursor: 'none' }}>{creatingRoom ? '...' : 'Create'}</button>
                    <button onClick={() => setShowRoomInput(false)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', padding: '0.45rem 0.75rem', background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--text-dim)', borderRadius: '2px', cursor: 'none' }}>×</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowRoomInput(true)} style={{ width: '100%', marginTop: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.6rem', border: '0.5px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', borderRadius: '2px', cursor: 'none' }}>+ Create memory room</button>
              )}
            </div>

            {/* Ambient whispers */}
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Ambient</div>
              {[
                { from: 'Lyra', msg: 'just started something new', time: '1m', color: '#BA7517' },
                { from: 'Nova', msg: 'open to connect', time: '3m', color: '#a89bff' },
                { from: 'Kael', msg: 'deep in thought', time: '8m', color: '#1D9E75' },
              ].map((w, i) => (
                <div key={i} style={{ padding: '0.65rem 0', borderBottom: '0.5px solid var(--border)' }}>
                  <span style={{ color: w.color, fontFamily: 'var(--font-display)', fontSize: '0.9rem' }}>{w.from}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--text-muted)' }}> {w.msg}</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)', marginTop: '0.1rem' }}>{w.time} ago</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
