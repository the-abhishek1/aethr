'use client'
import { useState, useEffect, useCallback } from 'react'
import MediaPlayer from '@/components/ui/MediaPlayer'
import { useRealtimeSignals } from '@/hooks/useRealtime'
import SectionLabel from '@/components/ui/SectionLabel'
import SignalComposer from '@/components/ui/SignalComposer'
import { useAuth } from '@/context/AuthContext'

const TYPES = ['Music', 'Visual art', 'Essay', 'Live talk', 'Code', 'Podcast']
const TIP_CONTEXTS = [
  { id: 'changed-my-mind', emoji: '🧠', label: 'Changed my mind' },
  { id: 'made-me-laugh', emoji: '😂', label: 'Made me laugh' },
  { id: 'not-alone', emoji: '💙', label: 'Not alone' },
  { id: 'best-of-year', emoji: '✨', label: 'Best of year' },
]

export default function ForgePage() {
  const { user } = useAuth()
  const [transmissions, setTransmissions] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [tab, setTab] = useState<'live' | 'all'>('live')
  const [tipSent, setTipSent] = useState('')
  const [tipSummary, setTipSummary] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'Music', description: '', isLive: false, mediaUrl: '' })
  const [signals, setSignals] = useState<any[]>([])
  const [txComment, setTxComment] = useState('')
  const [txComments, setTxComments] = useState<any[]>([])
  const [postingTxComment, setPostingTxComment] = useState(false)

  const loadTransmissions = useCallback(async () => {
    const url = tab === 'live' ? '/api/transmissions?world=forge&live=true' : '/api/transmissions?world=forge&limit=30'
    const res = await fetch(url)
    const data = await res.json()
    const txs = data.transmissions || []
    setTransmissions(txs)
    if (txs.length > 0 && !selected) setSelected(txs[0])
  }, [tab, selected])

  const loadSignals = useCallback(async () => {
    const res = await fetch('/api/signals?world=forge&limit=10')
    const data = await res.json()
    setSignals(data.signals || [])
  }, [])

  useEffect(() => { loadTransmissions(); loadSignals() }, [tab])

  // Live signals in The Forge
  useRealtimeSignals('forge', setSignals)

  useEffect(() => {
    if (!selected) return
    fetch(`/api/tips?transmissionId=${selected.id}`)
      .then(r => r.json())
      .then(d => setTipSummary(d.summary || []))
    // Load comments for this transmission
    fetch(`/api/signals?worldId=forge&limit=50`)
      .then(r => r.json())
      .then(d => setTxComments((d.signals || []).filter((s: any) => s.content?.includes(`[tx:${selected.id}]`))))
  }, [selected])

  const create = async () => {
    if (!form.title.trim()) return
    setCreating(true)
    const res = await fetch('/api/transmissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, worldId: 'forge', mediaUrl: form.mediaUrl || undefined }),
    })
    const data = await res.json()
    setCreating(false); setShowCreate(false)
    setForm({ title: '', type: 'Music', description: '', isLive: false, mediaUrl: '' })
    if (data.transmission) {
      setTransmissions(prev => [data.transmission, ...prev])
      setSelected(data.transmission)
    }
  }

  const toggleLive = async (tx: any) => {
    const res = await fetch(`/api/transmissions/${tx.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isLive: !tx.isLive }),
    })
    const data = await res.json()
    if (data.transmission) {
      setTransmissions(prev => prev.map(t => t.id === tx.id ? data.transmission : t))
      if (selected?.id === tx.id) setSelected(data.transmission)
    }
  }

  const postTxComment = async () => {
    if (!txComment.trim() || !selected || !user) return
    setPostingTxComment(true)
    const res = await fetch('/api/signals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: `[tx:${selected.id}] ${txComment}`, worldId: 'forge', mood: 'energized' }),
    })
    const data = await res.json()
    if (data.signal) {
      setTxComments(prev => [data.signal, ...prev])
      setTxComment('')
    }
    setPostingTxComment(false)
  }

  const sendTip = async (context: string) => {
    if (!selected || !user) return
    await fetch('/api/tips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toUserId: selected.creator.id, transmissionId: selected.id, context }),
    })
    setTipSent(context)
    setTimeout(() => setTipSent(''), 2500)
    // Refresh tip summary
    fetch(`/api/tips?transmissionId=${selected.id}`)
      .then(r => r.json()).then(d => setTipSummary(d.summary || []))
  }

  return (
    <>
      <style>{`
        .forge-layout { display: grid; grid-template-columns: 1fr 360px; }
        .forge-right { border-left: 0.5px solid var(--border); }
        .tx-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); border: 0.5px solid var(--border); }
        .forge-pad { padding: 1.5rem 2rem; }
        @media (max-width: 1024px) { .forge-layout { grid-template-columns: 1fr !important; } .forge-right { border-left: none !important; border-top: 0.5px solid var(--border); } }
        @media (max-width: 640px) { .tx-grid { grid-template-columns: 1fr !important; } .forge-pad { padding: 1.25rem !important; } .forge-header { flex-direction: column !important; align-items: flex-start !important; } }
      `}</style>

      <div style={{ paddingTop: '7rem' }}>
        {/* Header */}
        <div className="forge-header" style={{ padding: '0 1.5rem 2rem', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem' }}>
          <div>
            <SectionLabel>World I</SectionLabel>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,6vw,4rem)', fontWeight: 300, lineHeight: 0.95 }}>🔥 The Forge</h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
              {transmissions.filter(t => t.isLive).length} live · {transmissions.length} total transmissions
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {['live', 'all'].map(t => (
              <button key={t} onClick={() => setTab(t as any)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'capitalize', padding: '0.4rem 0.9rem', borderRadius: '2px', cursor: 'none', background: tab === t ? 'rgba(186,117,23,0.12)' : 'transparent', border: `0.5px solid ${tab === t ? '#BA7517' : 'var(--border)'}`, color: tab === t ? '#BA7517' : 'var(--text-dim)' }}>{t === 'live' ? '● Live' : 'All'}</button>
            ))}
            {user && (
              <button onClick={() => setShowCreate(!showCreate)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.4rem 1rem', borderRadius: '2px', cursor: 'none', background: showCreate ? 'var(--aether-dim)' : 'transparent', border: `0.5px solid ${showCreate ? 'var(--aether)' : 'var(--border)'}`, color: showCreate ? 'var(--aether)' : 'var(--text-muted)' }}>{showCreate ? '× Cancel' : '+ Transmit'}</button>
            )}
          </div>
        </div>

        {/* Create form */}
        {showCreate && (
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '0.5px solid var(--border)', background: 'var(--deep)', animation: 'fadeUp 0.25s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Transmission title..." style={{ background: 'transparent', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.65rem 0.9rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text)' }} />
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ background: 'var(--deep)', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.65rem 0.9rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text)', cursor: 'none' }}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" style={{ background: 'transparent', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.65rem 0.9rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text)' }} />
              <input value={form.mediaUrl} onChange={e => setForm(f => ({ ...f, mediaUrl: e.target.value }))} placeholder="Media URL — YouTube, SoundCloud, Spotify, Vimeo, or direct file link" style={{ background: 'transparent', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.65rem 0.9rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text)' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'none' }}>
                <input type="checkbox" checked={form.isLive} onChange={e => setForm(f => ({ ...f, isLive: e.target.checked }))} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>Start live</span>
              </label>
              <button onClick={create} disabled={creating || !form.title.trim()} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.6rem 1.5rem', background: form.title.trim() ? 'var(--aether)' : 'var(--aether-dim)', color: form.title.trim() ? 'var(--void)' : 'var(--aether)', border: 'none', borderRadius: '2px', cursor: 'none' }}>{creating ? 'Launching...' : 'Launch transmission →'}</button>
            </div>
          </div>
        )}

        <div className="forge-layout">
          {/* Left: transmissions */}
          <div className="forge-pad">
            {/* Live now */}
            {tab === 'live' && (
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D85A30', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D85A30', animation: 'pulse-soft 1.5s infinite' }} /> Live now
                </div>
                {transmissions.filter(t => t.isLive).length === 0 ? (
                  <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', padding: '2rem', textAlign: 'center' }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>No live transmissions right now.</p>
                    {user && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--aether)', marginTop: '0.5rem', cursor: 'none' }} onClick={() => setShowCreate(true)}>Start one →</p>}
                  </div>
                ) : (
                  <div className="tx-grid">
                    {transmissions.filter(t => t.isLive).map(tx => (
                      <TxCard key={tx.id} tx={tx} selected={selected?.id === tx.id} onSelect={setSelected} onToggleLive={user?.id === tx.creator.id ? () => toggleLive(tx) : undefined} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* All transmissions */}
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1rem' }}>{tab === 'live' ? 'Recent' : 'All transmissions'}</div>
              {transmissions.filter(t => tab === 'all' || !t.isLive).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', border: '0.5px solid var(--border)', borderRadius: '2px' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔥</div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>Nothing here yet. Drop the first transmission.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)' }}>
                  {transmissions.filter(t => tab === 'all' || !t.isLive).map(tx => (
                    <TxCard key={tx.id} tx={tx} selected={selected?.id === tx.id} onSelect={setSelected} onToggleLive={user?.id === tx.creator.id ? () => toggleLive(tx) : undefined} />
                  ))}
                </div>
              )}
            </div>

            {/* Signals in Forge */}
            <div style={{ marginTop: '2rem', borderTop: '0.5px solid var(--border)', paddingTop: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <SignalComposer worldId="forge" onPosted={s => setSignals(prev => [s, ...prev])} />
              </div>
              {signals.map((s: any) => (
                <div key={s.id} style={{ padding: '0.85rem 0', borderBottom: '0.5px solid var(--border)', display: 'flex', gap: '0.75rem' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--surface)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>{s.author?.avatarEmoji}</div>
                  <div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--aether)' }}>@{s.author?.username} </span>
                    {s.mood && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)', padding: '0.1rem 0.4rem', border: '0.5px solid var(--border)', borderRadius: '99px', marginRight: '0.4rem' }}>{s.mood}</span>}
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.4, marginTop: '0.15rem' }}>{s.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: selected detail + tipping */}
          <div className="forge-right forge-pad" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {selected ? (
              <>
                <div style={{ border: `0.5px solid ${selected.isLive ? '#BA7517' : 'var(--border)'}44`, borderRadius: '2px', padding: '1.25rem', background: selected.isLive ? 'rgba(186,117,23,0.06)' : 'var(--deep)' }}>
                  {selected.isLive && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: '#BA7517', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#BA7517', animation: 'pulse-soft 1.5s infinite' }} /> Live · {selected.type}
                    </div>
                  )}
                  {!selected.isLive && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>{selected.type}</div>}
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem,3vw,1.6rem)', fontWeight: 400, color: 'var(--text)', marginBottom: '0.25rem' }}>{selected.title}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>by @{selected.creator?.username}</div>
                  {selected.description && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '0.75rem' }}>{selected.description}</p>}
                  {/* Media player */}
                  {selected.mediaUrl && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <MediaPlayer url={selected.mediaUrl} type={selected.type} title={selected.title} />
                    </div>
                  )}

                  {/* Live indicator bar (only if live and no media URL) */}
                  {selected.isLive && !selected.mediaUrl && (
                    <div style={{ height: 2, background: 'var(--border)', borderRadius: 1, marginBottom: '1rem', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '60%', background: '#BA7517', borderRadius: 1, opacity: 0.7, animation: 'pulse-soft 2s ease-in-out infinite' }} />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)' }}>{selected.viewers} viewers</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#BA7517' }}>{selected._count?.tips || 0} tips</span>
                    {user?.id === selected.creator?.id && (
                      <button onClick={() => toggleLive(selected)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.3rem 0.8rem', background: selected.isLive ? 'rgba(216,90,48,0.15)' : 'rgba(29,158,117,0.15)', border: `0.5px solid ${selected.isLive ? '#D85A30' : '#1D9E75'}66`, color: selected.isLive ? '#D85A30' : '#1D9E75', borderRadius: '2px', cursor: 'none' }}>{selected.isLive ? 'End live' : 'Go live'}</button>
                    )}
                  </div>
                </div>

                {/* Tip with context */}
                {user && user.id !== selected.creator?.id && (
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Tip with context</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {TIP_CONTEXTS.map(t => {
                        const count = tipSummary.find((s: any) => s.context === t.id)?._count?.context || 0
                        return (
                          <button key={t.id} onClick={() => sendTip(t.id)} style={{ padding: '0.75rem', border: `0.5px solid ${tipSent === t.id ? '#BA7517' : 'var(--border)'}`, background: tipSent === t.id ? 'rgba(186,117,23,0.1)' : 'var(--deep)', borderRadius: '2px', cursor: 'none', textAlign: 'left', transition: 'all 0.2s' }}
                            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#BA751766'; el.style.background = 'rgba(186,117,23,0.06)' }}
                            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = tipSent === t.id ? '#BA7517' : 'var(--border)'; el.style.background = tipSent === t.id ? 'rgba(186,117,23,0.1)' : 'var(--deep)' }}
                          >
                            <div style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{t.emoji}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.57rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{t.label}</div>
                            {count > 0 && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>{count} sent</div>}
                          </button>
                        )
                      })}
                    </div>
                    {tipSent && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#BA7517', textAlign: 'center', padding: '0.5rem', animation: 'fadeIn 0.3s ease' }}>✦ Tip sent with meaning</div>}
                  </div>
                )}
                {/* Live chat / comments */}
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
                    Comments {txComments.length > 0 && `(${txComments.length})`}
                  </div>
                  {user && (
                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
                      <input value={txComment} onChange={e => setTxComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && postTxComment()} placeholder="React to this transmission..." style={{ flex: 1, background: 'transparent', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.5rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text)' }} />
                      <button onClick={postTxComment} disabled={postingTxComment || !txComment.trim()} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', padding: '0.5rem 0.85rem', background: 'rgba(186,117,23,0.15)', border: '0.5px solid rgba(186,117,23,0.3)', color: '#BA7517', borderRadius: '2px', cursor: 'none', flexShrink: 0 }}>Post</button>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: 240, overflowY: 'auto' }}>
                    {txComments.length === 0 ? (
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)' }}>No comments yet.</p>
                    ) : txComments.map((cm: any) => (
                      <div key={cm.id} style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 0', borderBottom: '0.5px solid var(--border)' }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', flexShrink: 0 }}>{cm.author?.avatarEmoji}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--aether)', marginRight: '0.4rem' }}>@{cm.author?.username}</span>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{cm.content.replace(`[tx:${selected?.id}] `, '')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', textAlign: 'center' }}>Select a transmission to view details and tip.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function TxCard({ tx, selected, onSelect, onToggleLive }: { tx: any; selected: boolean; onSelect: (tx: any) => void; onToggleLive?: () => void }) {
  return (
    <div onClick={() => onSelect(tx)} style={{ padding: '1.5rem', background: selected ? 'var(--mid)' : 'var(--void)', cursor: 'none', transition: 'background 0.2s', borderBottom: selected ? `2px solid #BA7517` : '2px solid transparent', position: 'relative' }}
      onMouseEnter={e => { if (!selected)(e.currentTarget as HTMLElement).style.background = 'var(--deep)' }}
      onMouseLeave={e => { if (!selected)(e.currentTarget as HTMLElement).style.background = 'var(--void)' }}
    >
      {tx.isLive && <span style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', width: 7, height: 7, borderRadius: '50%', background: '#D85A30', boxShadow: '0 0 6px #D85A30', animation: 'pulse-soft 1.5s infinite' }} />}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: '#BA7517', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{tx.type}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(0.95rem,2vw,1.15rem)', color: 'var(--text)', marginBottom: '0.2rem', lineHeight: 1.3 }}>{tx.title}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>@{tx.creator?.username}</div>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)' }}>{tx.viewers} viewers</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: '#BA7517' }}>{tx._count?.tips || 0} tips</span>
      </div>
      {onToggleLive && (
        <button onClick={e => { e.stopPropagation(); onToggleLive() }} style={{ marginTop: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.25rem 0.7rem', background: tx.isLive ? 'rgba(216,90,48,0.15)' : 'rgba(29,158,117,0.15)', border: `0.5px solid ${tx.isLive ? '#D85A3066' : '#1D9E7566'}`, color: tx.isLive ? '#D85A30' : '#1D9E75', borderRadius: '2px', cursor: 'none' }}>{tx.isLive ? 'End' : 'Go live'}</button>
      )}
    </div>
  )
}
