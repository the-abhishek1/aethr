'use client'
import { useState, useEffect, useCallback } from 'react'
import SectionLabel from '@/components/ui/SectionLabel'
import SignalComposer from '@/components/ui/SignalComposer'
import SignalCard from '@/components/ui/SignalCard'
import { SignalSkeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/context/AuthContext'

const PRESENCE_STATES = [
  { id: 'open', label: 'Open', color: '#a89bff' },
  { id: 'creating', label: 'Creating', color: '#BA7517' },
  { id: 'exploring', label: 'Exploring', color: '#378ADD' },
  { id: 'deep-work', label: 'Deep work', color: '#1D9E75' },
]

export default function CommonsPage() {
  const { user } = useAuth()
  const [presence, setPresence] = useState('open')
  const [rooms, setRooms] = useState<any[]>([])
  const [signals, setSignals] = useState<any[]>([])
  const [loadingSignals, setLoadingSignals] = useState(true)
  const [newRoom, setNewRoom] = useState('')
  const [creatingRoom, setCreatingRoom] = useState(false)
  const [showRoomInput, setShowRoomInput] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const loadRooms = useCallback(async () => {
    const res = await fetch('/api/rooms?world=commons')
    const data = await res.json()
    setRooms(data.rooms || [])
  }, [])

  const loadSignals = useCallback(async () => {
    setLoadingSignals(true)
    const res = await fetch('/api/signals?world=commons&limit=20')
    const data = await res.json()
    setSignals(data.signals || [])
    setLoadingSignals(false)
  }, [])

  useEffect(() => {
    loadRooms()
    loadSignals()
  }, [loadRooms, loadSignals])

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

  const demoPresence = [
    { name: 'Lyra', state: 'creating', color: '#BA7517', x: '22%', y: '35%', size: 48 },
    { name: 'Kael', state: 'deep-work', color: '#1D9E75', x: '58%', y: '28%', size: 36 },
    { name: 'Nova', state: 'open', color: '#a89bff', x: '70%', y: '55%', size: 44 },
    { name: 'Ryn', state: 'exploring', color: '#378ADD', x: '38%', y: '62%', size: 32 },
    { name: 'Sol', state: 'resting', color: '#444441', x: '15%', y: '68%', size: 28 },
  ]

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
              {/* Demo presence dots */}
              {demoPresence.map(p => (
                <div key={p.name} onClick={() => setSelected(selected === p.name ? null : p.name)} style={{ position: 'absolute', left: p.x, top: p.y, cursor: 'none', transform: 'translate(-50%,-50%)', zIndex: 2 }}>
                  <div style={{ width: p.size, height: p.size, borderRadius: '50%', background: 'var(--surface)', border: `0.5px solid ${selected === p.name ? p.color : p.color + '44'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: p.size * 0.38, boxShadow: `0 0 ${selected === p.name ? 14 : 5}px ${p.color}${selected === p.name ? '66' : '22'}`, transition: 'all 0.25s', position: 'relative' }}>
                    {p.name[0]}
                    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: p.color, border: '1.5px solid var(--void)' }} />
                  </div>
                  {selected === p.name && (
                    <div style={{ position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)', background: 'var(--deep)', border: '0.5px solid var(--border-bright)', borderRadius: '2px', padding: '0.4rem 0.75rem', whiteSpace: 'nowrap', zIndex: 10 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)' }}>{p.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: p.color }}>{p.state}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Signals feed */}
            <div className="signals-area">
              <div style={{ marginBottom: '1rem' }}>
                <SignalComposer worldId="commons" onPosted={sig => setSignals(prev => [sig, ...prev])} />
              </div>
              {loadingSignals ? (
                <>{[1,2,3].map(i => <SignalSkeleton key={i} />)}</>
              ) : signals.length === 0 ? (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', padding: '1rem 0', textAlign: 'center' }}>
                  No signals yet — be the first to drop one.
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
