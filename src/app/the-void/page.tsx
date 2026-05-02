'use client'
import { useState, useEffect, useCallback } from 'react'
import SectionLabel from '@/components/ui/SectionLabel'
import { useAuth } from '@/context/AuthContext'

export default function TheVoidPage() {
  const { user } = useAuth()
  const [mysteries, setMysteries] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<null | 'correct' | 'wrong'>(null)
  const [joining, setJoining] = useState(false)
  const [clueIndex, setClueIndex] = useState(0)

  const load = useCallback(async () => {
    const res = await fetch('/api/mysteries')
    const data = await res.json()
    setMysteries(data.mysteries || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const join = async () => {
    if (!selected || !user) return
    setJoining(true)
    await fetch('/api/mysteries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'join', mysteryId: selected.id }),
    })
    setJoining(false)
    load()
  }

  const attempt = async () => {
    if (!answer.trim() || !selected) return
    setSubmitting(true); setResult(null)
    const res = await fetch('/api/mysteries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'attempt', mysteryId: selected.id, answer }),
    })
    const data = await res.json()
    setResult(data.correct ? 'correct' : 'wrong')
    if (data.correct) { setAnswer(''); load() }
    setSubmitting(false)
  }

  const timeLeft = (expiresAt: string) => {
    const ms = new Date(expiresAt).getTime() - Date.now()
    if (ms <= 0) return 'Expired'
    const d = Math.floor(ms / 86400000)
    const h = Math.floor((ms % 86400000) / 3600000)
    if (d > 0) return `${d}d ${h}h left`
    const m = Math.floor((ms % 3600000) / 60000)
    return `${h}h ${m}m left`
  }

  const STATUS_COLOR: Record<string, string> = { active: '#1D9E75', solved: '#a89bff', expired: '#444441' }

  return (
    <>
      <style>{`
        .void-layout { display: grid; grid-template-columns: 280px 1fr; min-height: calc(100vh - 200px); }
        .void-list { border-right: 0.5px solid var(--border); overflow-y: auto; }
        .void-detail { padding: 2rem; overflow-y: auto; }
        @media (max-width: 768px) {
          .void-layout { grid-template-columns: 1fr !important; }
          .void-list { border-right: none !important; border-bottom: 0.5px solid var(--border); max-height: 280px; }
          .void-detail { padding: 1.25rem !important; }
        }
      `}</style>

      <div style={{ paddingTop: '7rem' }}>
        <div style={{ padding: '0 1.5rem 2rem', borderBottom: '0.5px solid var(--border)' }}>
          <SectionLabel>World III</SectionLabel>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,6vw,4rem)', fontWeight: 300, lineHeight: 0.95 }}>🌑 The Void</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>Procedural mysteries. The first to solve earns a permanent monument.</p>
        </div>

        <div className="void-layout">
          {/* Mystery list */}
          <div className="void-list">
            {loading ? (
              <div style={{ padding: '2rem', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)', textAlign: 'center' }}>The Void stirs...</div>
            ) : mysteries.map(m => (
              <div key={m.id} onClick={() => { setSelected(m); setResult(null); setAnswer(''); setClueIndex(0) }} style={{ padding: '1.1rem 1.25rem', borderBottom: '0.5px solid var(--border)', cursor: 'none', background: selected?.id === m.id ? 'var(--deep)' : 'transparent', borderLeft: `2px solid ${selected?.id === m.id ? '#7F77DD' : 'transparent'}`, transition: 'all 0.15s' }}
                onMouseEnter={e => { if (selected?.id !== m.id)(e.currentTarget as HTMLElement).style.background = 'var(--mid)' }}
                onMouseLeave={e => { if (selected?.id !== m.id)(e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_COLOR[m.status], flexShrink: 0, boxShadow: m.status === 'active' ? `0 0 5px ${STATUS_COLOR[m.status]}` : 'none' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: STATUS_COLOR[m.status] }}>{m.status}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.35rem', lineHeight: 1.3 }}>{m.title}</div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)' }}>{m._count?.explorers || 0} exploring</span>
                  {m.status === 'active' && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: '#7F77DD' }}>{timeLeft(m.expiresAt)}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Mystery detail */}
          <div className="void-detail">
            {!selected ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: '1rem' }}>
                <div style={{ fontSize: '4rem', animation: 'drift 6s ease-in-out infinite' }}>🌑</div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text-muted)', fontWeight: 300 }}>Enter The Void.</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)' }}>Select a mystery to begin exploring.</p>
              </div>
            ) : (
              <>
                {/* Mystery header */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR[selected.status], boxShadow: selected.status === 'active' ? `0 0 8px ${STATUS_COLOR[selected.status]}` : 'none' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: STATUS_COLOR[selected.status] }}>{selected.status}</span>
                    {selected.status === 'active' && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: '#7F77DD', marginLeft: 'auto' }}>{timeLeft(selected.expiresAt)}</span>}
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,4vw,2.5rem)', fontWeight: 300, lineHeight: 1.1, marginBottom: '1rem' }}>{selected.title}</h2>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.9 }}>{selected.description}</p>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '2rem', padding: '1rem 0', borderTop: '0.5px solid var(--border)', borderBottom: '0.5px solid var(--border)', marginBottom: '2rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>Explorers</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#7F77DD' }}>{selected._count?.explorers || 0}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>Attempts</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text-muted)' }}>{selected._count?.attempts || 0}</div>
                  </div>
                  {selected.status === 'solved' && (
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>Solved</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#a89bff' }}>✓</div>
                    </div>
                  )}
                </div>

                {/* Clues */}
                {selected.status === 'active' && (
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1rem' }}>Clues ({clueIndex + 1}/{selected.clues?.length})</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {selected.clues?.slice(0, clueIndex + 1).map((clue: string, i: number) => (
                        <div key={i} style={{ padding: '1rem 1.25rem', border: `0.5px solid ${i === clueIndex ? '#7F77DD44' : 'var(--border)'}`, borderRadius: '2px', background: i === clueIndex ? 'rgba(127,119,221,0.06)' : 'transparent', display: 'flex', gap: '0.75rem' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#7F77DD', flexShrink: 0 }}>#{i + 1}</span>
                          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)', lineHeight: 1.5 }}>{clue}</p>
                        </div>
                      ))}
                    </div>
                    {clueIndex < (selected.clues?.length - 1) && (
                      <button onClick={() => setClueIndex(i => i + 1)} style={{ marginTop: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 1.25rem', background: 'rgba(127,119,221,0.1)', border: '0.5px solid rgba(127,119,221,0.3)', color: '#7F77DD', borderRadius: '2px', cursor: 'none' }}>Reveal next clue →</button>
                    )}
                  </div>
                )}

                {/* Join + Attempt */}
                {selected.status === 'active' && user && (
                  <div style={{ border: '0.5px solid var(--border-bright)', borderRadius: '2px', padding: '1.25rem', background: 'var(--deep)' }}>
                    {!selected.explorers?.length ? (
                      <div>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1rem' }}>Enter The Void to start exploring this mystery. You'll gain +1 Discovery rep just for joining.</p>
                        <button onClick={join} disabled={joining} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.75rem 2rem', background: 'rgba(127,119,221,0.15)', border: '0.5px solid rgba(127,119,221,0.4)', color: '#7F77DD', borderRadius: '2px', cursor: 'none' }}>{joining ? 'Entering...' : 'Enter The Void →'}</button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Your answer</div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <input value={answer} onChange={e => { setAnswer(e.target.value); setResult(null) }} onKeyDown={e => e.key === 'Enter' && attempt()} placeholder="What is the answer?" style={{ flex: 1, minWidth: 200, background: 'transparent', border: `0.5px solid ${result === 'wrong' ? '#D85A30' : result === 'correct' ? '#1D9E75' : 'var(--border-bright)'}`, borderRadius: '2px', outline: 'none', padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text)', transition: 'border-color 0.2s' }} />
                          <button onClick={attempt} disabled={submitting || !answer.trim()} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.75rem 1.5rem', background: answer.trim() ? '#7F77DD' : 'rgba(127,119,221,0.2)', color: answer.trim() ? 'white' : '#7F77DD', border: 'none', borderRadius: '2px', cursor: 'none', whiteSpace: 'nowrap' }}>{submitting ? '...' : 'Submit →'}</button>
                        </div>
                        {result === 'wrong' && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#D85A30', marginTop: '0.6rem' }}>✗ Not quite. Study the clues more carefully.</p>}
                        {result === 'correct' && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#1D9E75', marginTop: '0.6rem' }}>✓ You solved it. The Void acknowledges you. +25 Discovery, +10 Wisdom, +5 Legacy.</p>}
                      </div>
                    )}
                  </div>
                )}

                {selected.status === 'solved' && (
                  <div style={{ padding: '1.5rem', border: '0.5px solid rgba(168,155,255,0.3)', borderRadius: '2px', background: 'rgba(168,155,255,0.05)', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🏛️</div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--aether)', marginBottom: '0.5rem' }}>This mystery has been solved.</p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)' }}>A monument has been placed in The Archive.</p>
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
