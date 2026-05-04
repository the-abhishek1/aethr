'use client'
import { useEffect, useState, useCallback } from 'react'
import SectionLabel from '@/components/ui/SectionLabel'
import WeeklyChallenge from '@/components/ui/WeeklyChallenge'
import { useAuth } from '@/context/AuthContext'

export default function ArenaPage() {
  const { user } = useAuth()
  const [debates, setDebates] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', description: '' })
  const [creating, setCreating] = useState(false)
  const [argContent, setArgContent] = useState('')
  const [argSide, setArgSide] = useState<'for' | 'against'>('for')
  const [posting, setPosting] = useState(false)
  const [hotTake, setHotTake] = useState('')
  const [postingHT, setPostingHT] = useState(false)
  const [htPosted, setHtPosted] = useState(false)

  const loadDebates = useCallback(async () => {
    const res = await fetch('/api/debate?limit=20')
    const data = await res.json()
    setDebates(data.debates || [])
    setLoading(false)
  }, [])

  const loadDebate = useCallback(async (id: string) => {
    const res = await fetch(`/api/debate/${id}`)
    const data = await res.json()
    setSelected(data.debate)
  }, [])

  useEffect(() => { loadDebates() }, [loadDebates])

  const postHotTake = async () => {
    if (!hotTake.trim()) return
    setPostingHT(true)
    const res = await fetch('/api/debate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: hotTake.trim(), description: '🔥 Hot take — vote and argue.', isHotTake: true }),
    })
    const data = await res.json()
    setPostingHT(false)
    if (data.debate) {
      setDebates(prev => [data.debate, ...prev])
      setHotTake('')
      setHtPosted(true)
      setTimeout(() => setHtPosted(false), 3000)
      loadDebate(data.debate.id)
    }
  }

  const create = async () => {
    if (!form.title.trim()) return
    setCreating(true)
    const res = await fetch('/api/debate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setCreating(false); setShowCreate(false)
    setForm({ title: '', description: '' })
    if (data.debate) {
      setDebates(prev => [data.debate, ...prev])
      loadDebate(data.debate.id)
    }
  }

  const addArgument = async () => {
    if (!argContent.trim() || !selected) return
    setPosting(true)
    const res = await fetch(`/api/debate/${selected.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: argContent, side: argSide }),
    })
    const data = await res.json()
    if (data.argument) {
      setSelected((prev: any) => ({ ...prev, arguments: [...(prev.arguments || []), data.argument] }))
      setArgContent('')
    }
    setPosting(false)
  }

  const upvoteArg = async (argId: string) => {
    if (!selected) return
    const res = await fetch(`/api/debate/${selected.id}?argumentId=${argId}`, { method: 'PUT' })
    const data = await res.json()
    if (res.ok) {
      setSelected((prev: any) => ({
        ...prev,
        arguments: prev.arguments.map((a: any) => a.id === argId
          ? { ...a, upvotes: data.upvoted ? (a.upvotes || 0) + 1 : Math.max(0, (a.upvotes || 0) - 1), argVotes: data.upvoted ? [...(a.argVotes || []), { userId: 'me' }] : (a.argVotes || []).filter((v: any) => v.userId !== 'me') }
          : a
        )
      }))
    }
  }

  const vote = async (side: 'for' | 'against') => {
    if (!selected) return
    await fetch(`/api/debate/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ side }),
    })
    loadDebate(selected.id)
  }

  const forCount = (d: any) => d.votes?.filter((v: any) => v.side === 'for').length || 0
  const againstCount = (d: any) => d.votes?.filter((v: any) => v.side === 'against').length || 0
  const myVote = selected?.votes?.find((v: any) => v.userId === user?.id)?.side

  return (
    <>
      <style>{`
        .arena-layout { display: grid; grid-template-columns: 300px 1fr; min-height: calc(100vh - 200px); }
        .arena-left { border-right: 0.5px solid var(--border); overflow-y: auto; }
        @media (max-width: 768px) {
          .arena-layout { grid-template-columns: 1fr !important; }
          .arena-left { border-right: none !important; border-bottom: 0.5px solid var(--border); max-height: 320px; }
          .arena-pad { padding: 1.25rem !important; }
        }
      `}</style>

      <div style={{ paddingTop: '7rem' }}>
        {/* Header */}
        <div style={{ padding: '0 1.5rem 2rem', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <SectionLabel>World II</SectionLabel>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,6vw,4rem)', fontWeight: 300, lineHeight: 0.95 }}>⚔️ The Arena</h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>Structured debates. Ideas with stakes.</p>
          </div>
          {user && (
            <button onClick={() => setShowCreate(!showCreate)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.6rem 1.5rem', background: showCreate ? 'rgba(216,90,48,0.12)' : 'transparent', border: `0.5px solid ${showCreate ? '#D85A30' : 'var(--border)'}`, color: showCreate ? '#D85A30' : 'var(--text-muted)', borderRadius: '2px', cursor: 'none' }}>{showCreate ? '× Cancel' : '+ Open a debate'}</button>
          )}
        </div>

        {/* Hot Take bar — fast opinion polls */}
        {user && (
          <div style={{ padding: '0.75rem 1.5rem', borderBottom: '0.5px solid var(--border)', background: 'rgba(216,90,48,0.03)', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#D85A30', letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0 }}>🔥 Hot take</span>
            <input value={hotTake} onChange={e => setHotTake(e.target.value)} onKeyDown={e => e.key === 'Enter' && postHotTake()} placeholder="Drop a one-liner. Galaxy votes immediately." maxLength={120}
              style={{ flex: 1, minWidth: 180, background: 'transparent', border: '0.5px solid rgba(216,90,48,0.3)', borderRadius: '2px', outline: 'none', padding: '0.5rem 0.75rem', fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--text)' }} />
            <button onClick={postHotTake} disabled={postingHT || !hotTake.trim()} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.5rem 1.1rem', background: hotTake.trim() ? '#D85A30' : 'rgba(216,90,48,0.2)', color: hotTake.trim() ? 'white' : '#D85A30', border: 'none', borderRadius: '2px', cursor: 'none', flexShrink: 0 }}>{postingHT ? '...' : 'Fire →'}</button>
            {htPosted && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#1D9E75', animation: 'fadeIn 0.3s' }}>✓ Fired into the Arena</span>}
          </div>
        )}

        {/* Create debate */}
        {showCreate && (
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '0.5px solid var(--border)', background: 'var(--deep)', animation: 'fadeUp 0.25s ease' }}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="What should the galaxy debate?" style={{ flex: 1, minWidth: 200, background: 'transparent', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.7rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text)' }} />
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Context (optional)" style={{ flex: 1, minWidth: 200, background: 'transparent', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.7rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text)' }} />
            </div>
            <button onClick={create} disabled={creating || !form.title.trim()} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.6rem 1.5rem', background: form.title.trim() ? '#D85A30' : 'rgba(216,90,48,0.2)', color: form.title.trim() ? 'white' : '#D85A30', border: 'none', borderRadius: '2px', cursor: 'none' }}>{creating ? 'Opening...' : 'Open debate →'}</button>
          </div>
        )}

        <div style={{ padding: '0 1.5rem 1rem' }}><WeeklyChallenge compact /></div>
        <div className="arena-layout">
          {/* Left: debate list */}
          <div className="arena-left">
            {loading ? (
              <div style={{ padding: '2rem', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)', textAlign: 'center' }}>Loading debates...</div>
            ) : debates.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)' }}>No debates yet. Open the first one.</p>
              </div>
            ) : debates.map(d => {
              const fc = forCount(d), ac = againstCount(d), total = fc + ac
              return (
                <div key={d.id} onClick={() => loadDebate(d.id)} style={{ padding: '1rem 1.25rem', borderBottom: '0.5px solid var(--border)', cursor: 'none', background: selected?.id === d.id ? 'var(--deep)' : 'transparent', transition: 'background 0.15s', borderLeft: selected?.id === d.id ? '2px solid #D85A30' : '2px solid transparent' }}
                  onMouseEnter={e => { if (selected?.id !== d.id)(e.currentTarget as HTMLElement).style.background = 'var(--mid)' }}
                  onMouseLeave={e => { if (selected?.id !== d.id)(e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.5rem', lineHeight: 1.4 }}>{d.title}</div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)' }}>@{d.creator?.username}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)' }}>{d._count?.arguments} args</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)' }}>{total} votes</span>
                  </div>
                  {total > 0 && (
                    <div style={{ display: 'flex', height: 3, borderRadius: 2, overflow: 'hidden', gap: 1 }}>
                      <div style={{ flex: fc, background: '#1D9E75', opacity: 0.8 }} />
                      <div style={{ flex: ac, background: '#D85A30', opacity: 0.8 }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right: debate detail */}
          <div className="arena-pad" style={{ padding: '1.5rem 2rem', overflowY: 'auto' }}>
            {!selected ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', textAlign: 'center' }}>Select a debate to enter the arena.</p>
              </div>
            ) : (
              <>
                {/* Debate header */}
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,4vw,2.5rem)', fontWeight: 300, lineHeight: 1.1, marginBottom: '0.5rem' }}>{selected.title}</h2>
                  {selected.description && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>{selected.description}</p>}
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)' }}>Opened by @{selected.creator?.username}</div>
                </div>

                {/* Vote bar */}
                {(() => {
                  const fc = forCount(selected), ac = againstCount(selected), total = fc + ac
                  return (
                    <div style={{ marginBottom: '2rem', padding: '1.25rem', border: '0.5px solid var(--border)', borderRadius: '2px', background: 'var(--deep)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#1D9E75' }}>For · {fc} ({total ? Math.round(fc/total*100) : 0}%)</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#D85A30' }}>{ac} ({total ? Math.round(ac/total*100) : 0}%) · Against</span>
                      </div>
                      <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', gap: 2, marginBottom: '1rem', background: 'var(--border)' }}>
                        <div style={{ flex: fc || 0.01, background: '#1D9E75', opacity: 0.8, transition: 'flex 0.5s ease' }} />
                        <div style={{ flex: ac || 0.01, background: '#D85A30', opacity: 0.8, transition: 'flex 0.5s ease' }} />
                      </div>
                      {user && (
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button onClick={() => vote('for')} style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.6rem', background: myVote === 'for' ? 'rgba(29,158,117,0.2)' : 'transparent', border: `0.5px solid ${myVote === 'for' ? '#1D9E75' : 'var(--border)'}`, color: myVote === 'for' ? '#1D9E75' : 'var(--text-dim)', borderRadius: '2px', cursor: 'none', transition: 'all 0.15s' }}>✓ Vote for</button>
                          <button onClick={() => vote('against')} style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.6rem', background: myVote === 'against' ? 'rgba(216,90,48,0.2)' : 'transparent', border: `0.5px solid ${myVote === 'against' ? '#D85A30' : 'var(--border)'}`, color: myVote === 'against' ? '#D85A30' : 'var(--text-dim)', borderRadius: '2px', cursor: 'none', transition: 'all 0.15s' }}>✗ Vote against</button>
                        </div>
                      )}
                    </div>
                  )
                })()}

                {/* Arguments */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1rem' }}>
                    {selected.arguments?.length || 0} Arguments
                  </div>
                  {selected.arguments?.length === 0 ? (
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', padding: '1rem 0' }}>No arguments yet. Be the first to make your case.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)' }}>
                      {selected.arguments?.map((a: any) => (
                        <div key={a.id} style={{ padding: '1rem 1.25rem', background: 'var(--void)', borderLeft: `3px solid ${a.side === 'for' ? '#1D9E75' : '#D85A30'}` }}>
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.9rem' }}>{a.author?.avatarEmoji}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--aether)' }}>@{a.author?.username}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: a.side === 'for' ? '#1D9E75' : '#D85A30', padding: '0.1rem 0.5rem', border: `0.5px solid ${a.side === 'for' ? '#1D9E7544' : '#D85A3044'}`, borderRadius: '99px' }}>{a.side}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>{new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)', lineHeight: 1.5, marginBottom: '0.6rem' }}>{a.content}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {user && user.id !== a.author?.id && (
                              <button onClick={() => upvoteArg(a.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.06em', padding: '0.25rem 0.65rem', background: (a.argVotes || []).some((v: any) => v.userId === user?.id) ? 'rgba(168,155,255,0.15)' : 'transparent', border: `0.5px solid ${(a.argVotes || []).some((v: any) => v.userId === user?.id) ? 'var(--aether)' : 'var(--border)'}`, color: (a.argVotes || []).some((v: any) => v.userId === user?.id) ? 'var(--aether)' : 'var(--text-dim)', borderRadius: '99px', cursor: 'none', transition: 'all 0.15s' }}>
                                ↑ {a.upvotes || 0}
                              </button>
                            )}
                            {(!user || user.id === a.author?.id) && (a.upvotes || 0) > 0 && (
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)' }}>↑ {a.upvotes || 0}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add argument */}
                {user && (
                  <div style={{ border: '0.5px solid var(--border-bright)', borderRadius: '2px', padding: '1.1rem', background: 'var(--deep)' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      {(['for', 'against'] as const).map(s => (
                        <button key={s} onClick={() => setArgSide(s)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.35rem 1rem', borderRadius: '2px', cursor: 'none', background: argSide === s ? (s === 'for' ? 'rgba(29,158,117,0.15)' : 'rgba(216,90,48,0.15)') : 'transparent', border: `0.5px solid ${argSide === s ? (s === 'for' ? '#1D9E75' : '#D85A30') : 'var(--border)'}`, color: argSide === s ? (s === 'for' ? '#1D9E75' : '#D85A30') : 'var(--text-dim)' }}>{s === 'for' ? '✓ Argue for' : '✗ Argue against'}</button>
                      ))}
                    </div>
                    <textarea value={argContent} onChange={e => setArgContent(e.target.value)} placeholder="Make your case..." rows={3} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)', resize: 'none', lineHeight: 1.6, marginBottom: '0.75rem' }} />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={addArgument} disabled={posting || !argContent.trim()} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.6rem 1.5rem', background: argContent.trim() ? (argSide === 'for' ? '#1D9E75' : '#D85A30') : 'var(--aether-dim)', color: argContent.trim() ? 'white' : 'var(--text-dim)', border: 'none', borderRadius: '2px', cursor: 'none', transition: 'all 0.15s' }}>{posting ? 'Posting...' : `Argue ${argSide} →`}</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
