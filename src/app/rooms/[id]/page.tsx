'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import SignalCard from '@/components/ui/SignalCard'
import SectionLabel from '@/components/ui/SectionLabel'
import Link from 'next/link'

export default function RoomPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { user } = useAuth()

  const [room, setRoom]         = useState<any>(null)
  const [signals, setSignals]   = useState<any[]>([])
  const [isMember, setIsMember] = useState(false)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [content, setContent]   = useState('')
  const [posting, setPosting]   = useState(false)
  const [joining, setJoining]   = useState(false)
  const [tab, setTab]           = useState<'feed'|'members'>('feed')

  const bottomRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    const res = await fetch(`/api/rooms/${id}`)
    if (!res.ok) { setNotFound(true); setLoading(false); return }
    const data = await res.json()
    setRoom(data.room)
    setSignals(data.signals || [])
    setIsMember(data.isMember)
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const join = async () => {
    setJoining(true)
    await fetch(`/api/rooms/${id}`, { method: 'POST' })
    setJoining(false)
    load()
  }

  const leave = async () => {
    await fetch(`/api/rooms/${id}`, { method: 'DELETE' })
    load()
  }

  const postSignal = async () => {
    if (!content.trim()) return
    setPosting(true)
    const res = await fetch('/api/signals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, worldId: room.worldId || 'commons', roomId: id }),
    })
    const data = await res.json()
    if (data.signal) {
      setSignals(prev => [{ ...data.signal, _count: { replies: 0, reactions: 0 }, reactions: [] }, ...prev])
      setContent('')
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
    setPosting(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
      Opening memory room...
    </div>
  )

  if (notFound || !room) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <div style={{ fontSize: '3rem' }}>🏛️</div>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'var(--text-muted)' }}>Room not found.</p>
      <Link href="/commons" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--aether)', textDecoration: 'none', border: '0.5px solid rgba(168,155,255,0.3)', padding: '0.6rem 1.25rem', borderRadius: '2px' }}>← Back to Commons</Link>
    </div>
  )

  return (
    <>
      <style>{`
        .room-layout { display: grid; grid-template-columns: 1fr 280px; gap: 0; min-height: calc(100vh - 180px); }
        .room-feed { border-right: 0.5px solid var(--border); display: flex; flex-direction: column; }
        .room-sidebar { padding: 1.5rem; }
        @media (max-width: 768px) {
          .room-layout { grid-template-columns: 1fr !important; }
          .room-feed { border-right: none !important; }
          .room-sidebar { display: none !important; }
        }
      `}</style>

      <div style={{ paddingTop: '7rem' }}>
        {/* Header */}
        <div style={{ padding: '0 1.5rem 1.25rem', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <SectionLabel>Memory Room</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: room.color, boxShadow: `0 0 8px ${room.color}` }} />
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem,5vw,3rem)', fontWeight: 300, lineHeight: 1 }}>{room.name}</h1>
            </div>
            {room.description && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>{room.description}</p>}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)' }}>{room._count?.members || 0} members</span>
            {user && (isMember ? (
              <button onClick={leave} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.45rem 1rem', background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--text-dim)', borderRadius: '2px', cursor: 'none' }}>Leave</button>
            ) : (
              <button onClick={join} disabled={joining} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.45rem 1.25rem', background: `${room.color}18`, border: `0.5px solid ${room.color}66`, color: room.color, borderRadius: '2px', cursor: 'none' }}>{joining ? '...' : 'Join room →'}</button>
            ))}
            <Link href="/commons" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)', textDecoration: 'none' }}>← Commons</Link>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1.5rem', borderBottom: '0.5px solid var(--border)' }}>
          {(['feed', 'members'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'capitalize', padding: '0.35rem 0.85rem', borderRadius: '2px', cursor: 'none', background: tab === t ? `${room.color}18` : 'transparent', border: `0.5px solid ${tab === t ? room.color : 'var(--border)'}`, color: tab === t ? room.color : 'var(--text-dim)', transition: 'all 0.15s' }}>
              {t === 'feed' ? `📡 Feed (${signals.length})` : `👥 Members (${room._count?.members || 0})`}
            </button>
          ))}
        </div>

        <div className="room-layout">
          {/* Feed */}
          <div className="room-feed">
            {/* Composer — members only */}
            {isMember && user && (
              <div style={{ padding: '1rem 1.5rem', borderBottom: '0.5px solid var(--border)', background: 'var(--deep)' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface)', border: `0.5px solid ${room.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>{user.avatarEmoji}</div>
                  <div style={{ flex: 1 }}>
                    <textarea value={content} onChange={e => setContent(e.target.value)} placeholder={`Signal to ${room.name}...`} rows={2} onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) postSignal() }}
                      style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)', resize: 'none', lineHeight: 1.6 }} />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                      <button onClick={postSignal} disabled={posting || !content.trim()} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.45rem 1.1rem', background: content.trim() ? room.color : 'transparent', color: content.trim() ? 'white' : room.color, border: `0.5px solid ${room.color}`, borderRadius: '2px', cursor: 'none', transition: 'all 0.15s' }}>
                        {posting ? '...' : 'Send →'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Feed tab */}
            {tab === 'feed' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.5rem' }}>
                {signals.length === 0 ? (
                  <div style={{ padding: '4rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📡</div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No signals in this room yet.</p>
                    {!isMember && user && <button onClick={join} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.6rem 1.25rem', background: `${room.color}18`, border: `0.5px solid ${room.color}66`, color: room.color, borderRadius: '2px', cursor: 'none', marginTop: '1rem' }}>Join to post →</button>}
                  </div>
                ) : signals.map(s => <SignalCard key={s.id} signal={s} />)}
                <div ref={bottomRef} />
              </div>
            )}

            {/* Members tab */}
            {tab === 'members' && (
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {room.members?.map((m: any) => (
                  <Link key={m.id} href={`/profile/${m.user?.username}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '0.5px solid var(--border)', textDecoration: 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--deep)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface)', border: `0.5px solid ${room.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>{m.user?.avatarEmoji}</div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)' }}>@{m.user?.username}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-dim)' }}>Joined {new Date(m.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                    {m.userId === room.creatorId && <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: room.color, border: `0.5px solid ${room.color}44`, padding: '0.15rem 0.5rem', borderRadius: '2px' }}>Creator</span>}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="room-sidebar">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1rem' }}>About this room</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '1rem', border: '0.5px solid var(--border)', borderRadius: '2px', background: 'var(--deep)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)' }}>Members</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: room.color }}>{room._count?.members || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)' }}>Signals</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--aether)' }}>{signals.length}</span>
                </div>
              </div>

              {/* Active members */}
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Members</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {room.members?.slice(0, 12).map((m: any) => (
                    <Link key={m.id} href={`/profile/${m.user?.username}`} title={`@${m.user?.username}`} style={{ textDecoration: 'none' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface)', border: `0.5px solid ${room.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', transition: 'border-color 0.15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = room.color}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = `${room.color}33`}
                      >{m.user?.avatarEmoji}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
