'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import SectionLabel from '@/components/ui/SectionLabel'
import SignalCard from '@/components/ui/SignalCard'
import { SignalSkeleton, CardSkeleton } from '@/components/ui/Skeleton'
import Link from 'next/link'

const REP_COLORS: Record<string, string> = {
  wisdom: '#a89bff', creativity: '#d4b896', discovery: '#1D9E75',
  trust: '#378ADD', debate: '#D85A30', legacy: '#888780',
}

export default function FactionDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()

  const [faction, setFaction]     = useState<any>(null)
  const [signals, setSignals]     = useState<any[]>([])
  const [debates, setDebates]     = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [sigLoading, setSigLoading] = useState(false)
  const [tab, setTab]             = useState<'feed'|'members'|'debates'|'leaderboard'>('feed')
  const [joining, setJoining]     = useState(false)
  const [posting, setPosting]     = useState(false)
  const [postContent, setPostContent] = useState('')
  const [showPost, setShowPost]   = useState(false)

  const loadFaction = useCallback(async () => {
    const res = await fetch(`/api/factions/${id}`)
    if (!res.ok) { setLoading(false); return }
    const data = await res.json()
    setFaction(data.faction)
    setLoading(false)
  }, [id])

  const loadSignals = useCallback(async () => {
    if (!faction) return
    setSigLoading(true)
    // Load signals from all members of this faction
    const memberIds = faction.members?.map((m: any) => m.userId) || []
    if (memberIds.length === 0) { setSigLoading(false); return }
    // Fetch recent signals — filter by member IDs client-side (simple approach)
    const res = await fetch(`/api/signals?limit=50`)
    const data = await res.json()
    const factionSignals = (data.signals || []).filter((s: any) =>
      memberIds.includes(s.authorId || s.author?.id)
    )
    setSignals(factionSignals)
    setSigLoading(false)
  }, [faction])

  const loadDebates = useCallback(async () => {
    const res = await fetch('/api/debate?limit=20')
    const data = await res.json()
    // Show debates created by faction members
    const memberIds = faction?.members?.map((m: any) => m.userId) || []
    setDebates((data.debates || []).filter((d: any) => memberIds.includes(d.creatorId)))
  }, [faction])

  useEffect(() => { loadFaction() }, [loadFaction])
  useEffect(() => {
    if (faction) { loadSignals(); loadDebates() }
  }, [faction, loadSignals, loadDebates])

  const isMember = faction?.members?.some((m: any) => m.userId === user?.id)

  const join = async () => {
    setJoining(true)
    await fetch(`/api/factions/${id}`, { method: 'POST' })
    setJoining(false)
    loadFaction()
  }

  const leave = async () => {
    await fetch(`/api/factions/${id}`, { method: 'DELETE' })
    loadFaction()
  }

  const postSignal = async () => {
    if (!postContent.trim()) return
    setPosting(true)
    const res = await fetch('/api/signals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: postContent, worldId: 'commons', mood: 'energized' }),
    })
    const data = await res.json()
    if (data.signal) {
      setSignals(prev => [data.signal, ...prev])
      setPostContent('')
      setShowPost(false)
    }
    setPosting(false)
  }

  // Total faction rep
  const totalRep = faction?.members?.reduce((total: number, m: any) => {
    if (!m.user?.reputation) return total
    return total + Object.values(m.user.reputation)
      .filter((v): v is number => typeof v === 'number')
      .reduce((s, v) => s + v, 0)
  }, 0) || 0

  // Rep leaderboard — members sorted by total rep
  const repLeaderboard = [...(faction?.members || [])]
    .map((m: any) => ({
      ...m,
      totalRep: m.user?.reputation
        ? Object.values(m.user.reputation).filter((v): v is number => typeof v === 'number').reduce((s, v) => s + v, 0)
        : 0
    }))
    .sort((a, b) => b.totalRep - a.totalRep)

  if (loading) return (
    <div style={{ padding: '7rem 2rem 4rem', maxWidth: 800, margin: '0 auto' }}>
      <CardSkeleton />
    </div>
  )

  if (!faction) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <div style={{ fontSize: '3rem' }}>⚔️</div>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'var(--text-muted)' }}>Faction not found.</p>
      <Link href="/factions" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--aether)', border: '0.5px solid rgba(168,155,255,0.3)', padding: '0.6rem 1.25rem', borderRadius: '2px' }}>All factions →</Link>
    </div>
  )

  return (
    <>
      <style>{`
        .faction-layout { display: grid; grid-template-columns: 1fr 280px; gap: 2rem; }
        .faction-pad { padding: 7rem 2rem 4rem; max-width: 1000px; margin: 0 auto; }
        @media (max-width: 900px) { .faction-layout { grid-template-columns: 1fr !important; } }
        @media (max-width: 640px) { .faction-pad { padding: 6rem 1.25rem 3rem !important; } }
      `}</style>

      <div className="faction-pad">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <SectionLabel>Faction</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: faction.color, boxShadow: `0 0 12px ${faction.color}`, flexShrink: 0 }} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,6vw,3.5rem)', fontWeight: 300, lineHeight: 0.95 }}>{faction.name}</h1>
          </div>
          {faction.description && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.9, maxWidth: 520, marginBottom: '1rem' }}>{faction.description}</p>
          )}
          {faction.territory && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: faction.color, marginBottom: '1rem' }}>
              Territory: {faction.territory}
            </div>
          )}

          {/* Join / Leave + Stats row */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'Members', val: faction._count?.members || 0, color: faction.color },
              { label: 'Total rep', val: totalRep, color: 'var(--aether)' },
              { label: 'Signals', val: signals.length, color: '#1D9E75' },
            ].map(s => (
              <div key={s.label}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 300, color: s.color }}>{s.val}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)', marginLeft: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</span>
              </div>
            ))}

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              {user && (isMember ? (
                <>
                  <button onClick={() => setShowPost(s => !s)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 1.1rem', background: showPost ? `${faction.color}18` : 'transparent', border: `0.5px solid ${faction.color}66`, color: faction.color, borderRadius: '2px', cursor: 'none' }}>
                    {showPost ? '× Cancel' : '+ Post to faction'}
                  </button>
                  <button onClick={leave} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.5rem 1rem', background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--text-dim)', borderRadius: '2px', cursor: 'none' }}>Leave</button>
                </>
              ) : (
                <button onClick={join} disabled={joining} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.6rem 1.75rem', background: `${faction.color}18`, border: `0.5px solid ${faction.color}66`, color: faction.color, borderRadius: '2px', cursor: 'none' }}>
                  {joining ? 'Joining...' : 'Join this faction →'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Post composer (members only) */}
        {showPost && isMember && (
          <div style={{ border: `0.5px solid ${faction.color}44`, borderRadius: '2px', padding: '1.1rem', background: `${faction.color}06`, marginBottom: '1.5rem', animation: 'fadeUp 0.2s ease' }}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface)', border: `0.5px solid ${faction.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>{user?.avatarEmoji}</div>
              <textarea value={postContent} onChange={e => setPostContent(e.target.value)} placeholder={`Post to ${faction.name}...`} rows={3}
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) postSignal() }}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)', resize: 'none', lineHeight: 1.6 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={postSignal} disabled={posting || !postContent.trim()} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 1.25rem', background: postContent.trim() ? faction.color : 'transparent', color: postContent.trim() ? 'white' : faction.color, border: `0.5px solid ${faction.color}`, borderRadius: '2px', cursor: 'none' }}>
                {posting ? 'Posting...' : 'Send →'}
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '0.5px solid var(--border)', paddingBottom: '1rem' }}>
          {(['feed', 'members', 'debates', 'leaderboard'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'capitalize', padding: '0.4rem 1rem', borderRadius: '2px', cursor: 'none', background: tab === t ? `${faction.color}18` : 'transparent', border: `0.5px solid ${tab === t ? faction.color : 'var(--border)'}`, color: tab === t ? faction.color : 'var(--text-dim)', transition: 'all 0.15s' }}>
              {t === 'feed' ? '📡 Feed' : t === 'members' ? `⚔️ Members (${faction._count?.members || 0})` : t === 'debates' ? `🗣 Debates` : '🏆 Leaderboard'}
            </button>
          ))}
        </div>

        {/* Feed tab */}
        {tab === 'feed' && (
          <div>
            {sigLoading ? (
              [1,2,3].map(i => <SignalSkeleton key={i} />)
            ) : signals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', border: '0.5px solid var(--border)', borderRadius: '2px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📡</div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No signals from this faction yet.</p>
                {isMember ? (
                  <button onClick={() => setShowPost(true)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.6rem 1.25rem', background: `${faction.color}18`, border: `0.5px solid ${faction.color}66`, color: faction.color, borderRadius: '2px', cursor: 'none', marginTop: '1rem' }}>Be the first to post →</button>
                ) : (
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>Join the faction to post.</p>
                )}
              </div>
            ) : (
              <div>
                {signals.map(s => <SignalCard key={s.id} signal={s} />)}
              </div>
            )}
          </div>
        )}

        {/* Members tab */}
        {tab === 'members' && (
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
            {faction.members?.map((m: any) => (
              <Link key={m.id} href={`/profile/${m.user?.username}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderBottom: '0.5px solid var(--border)', textDecoration: 'none', background: 'var(--void)', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--deep)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--void)'}
              >
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--surface)', border: `0.5px solid ${faction.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{m.user?.avatarEmoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)' }}>@{m.user?.username}</div>
                  {m.user?.bio && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.user.bio.slice(0, 60)}</div>}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {m.role === 'leader' && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: faction.color, border: `0.5px solid ${faction.color}44`, padding: '0.15rem 0.5rem', borderRadius: '2px' }}>Leader</span>}
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)' }}>
                    Joined {new Date(m.joinedAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Debates tab */}
        {tab === 'debates' && (
          <div>
            {debates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', border: '0.5px solid var(--border)', borderRadius: '2px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🗣</div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No debates from this faction yet.</p>
                <Link href="/arena" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: '#D85A30', border: '0.5px solid rgba(216,90,48,0.3)', padding: '0.6rem 1.25rem', borderRadius: '2px', display: 'inline-block', marginTop: '1rem' }}>Open a debate in The Arena →</Link>
              </div>
            ) : debates.map(d => {
              const forVotes = d.votes?.filter((v: any) => v.side === 'for').length || 0
              const againstVotes = d.votes?.filter((v: any) => v.side === 'against').length || 0
              const total = forVotes + againstVotes
              return (
                <Link key={d.id} href="/arena" style={{ display: 'block', padding: '1.25rem', border: '0.5px solid var(--border)', borderRadius: '2px', marginBottom: '0.75rem', textDecoration: 'none', background: 'var(--deep)', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--mid)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--deep)'}
                >
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text)', marginBottom: '0.4rem' }}>{d.title}</div>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--aether)' }}>@{d.creator?.username}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)' }}>{d._count?.arguments || 0} arguments · {total} votes</span>
                  </div>
                  {total > 0 && (
                    <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', gap: 1 }}>
                      <div style={{ flex: forVotes || 0.01, background: '#1D9E75', opacity: 0.8 }} />
                      <div style={{ flex: againstVotes || 0.01, background: '#D85A30', opacity: 0.8 }} />
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}

        {/* Leaderboard tab */}
        {tab === 'leaderboard' && (
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)', marginBottom: '1rem', lineHeight: 1.8 }}>
              Combined reputation of all {faction._count?.members || 0} members. Total: <span style={{ color: 'var(--aether)' }}>{totalRep}</span> rep.
            </div>
            <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
              {repLeaderboard.map((m: any, i: number) => (
                <Link key={m.id} href={`/profile/${m.user?.username}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderBottom: '0.5px solid var(--border)', textDecoration: 'none', background: i === 0 ? `${faction.color}0a` : 'var(--void)', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--deep)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i === 0 ? `${faction.color}0a` : 'var(--void)'}
                >
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: i === 0 ? 'var(--gold)' : i === 1 ? '#aaa' : 'var(--text-dim)', minWidth: 28, textAlign: 'center' }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </div>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--surface)', border: `0.5px solid ${faction.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{m.user?.avatarEmoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)' }}>@{m.user?.username}</div>
                    {m.user?.reputation && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                        {Object.entries(REP_COLORS).map(([key, color]) => (m.user.reputation[key] || 0) > 0 && (
                          <span key={key} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color }}>{m.user.reputation[key]} {key.slice(0,3)}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 300, color: faction.color }}>{m.totalRep}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: '2rem' }}>
          <Link href="/factions" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--text-dim)' }}>← All factions</Link>
        </div>
      </div>
    </>
  )
}
