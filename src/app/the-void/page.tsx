'use client'
import { useState, useEffect, useCallback } from 'react'
import SectionLabel from '@/components/ui/SectionLabel'
import { useAuth } from '@/context/AuthContext'

const DIFFICULTY_COLORS: Record<string, string> = {
  easy:   '#1D9E75',
  medium: '#BA7517',
  hard:   '#D85A30',
  expert: '#7F77DD',
}

export default function TheVoidPage() {
  const { user } = useAuth()
  const [mysteries, setMysteries]     = useState<any[]>([])
  const [selected, setSelected]       = useState<any>(null)
  const [loading, setLoading]         = useState(true)
  const [answer, setAnswer]           = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [result, setResult]           = useState<null|'correct'|'wrong'>(null)
  const [joining, setJoining]         = useState(false)
  const [clueIndex, setClueIndex]     = useState(0)
  const [tab, setTab]                 = useState<'mysteries'|'create'>('mysteries')
  const [wrongCount, setWrongCount]   = useState(0)

  // Create form
  const [form, setForm] = useState({
    title: '', description: '', answer: '', difficulty: 'medium',
    clue1: '', clue2: '', clue3: '', clue4: '',
  })
  const [creating, setCreating] = useState(false)
  const [createMsg, setCreateMsg] = useState('')

  const load = useCallback(async () => {
    const res = await fetch('/api/mysteries')
    const data = await res.json()
    const ms = data.mysteries || []
    setMysteries(ms)
    setLoading(false)
    // Re-select updated mystery to refresh explorer state
    if (selected) {
      const updated = ms.find((m: any) => m.id === selected.id)
      if (updated) setSelected(updated)
    }
  }, [selected])

  useEffect(() => { load() }, [])  // eslint-disable-line

  const selectMystery = (m: any) => {
    setSelected(m)
    setResult(null)
    setAnswer('')
    setClueIndex(0)
    setWrongCount(0)
  }

  // User is already exploring if explorers array (filtered to their ID) has length > 0
  const isExploring = selected?.explorers?.length > 0

  const join = async () => {
    if (!selected || !user) return
    setJoining(true)
    const res = await fetch('/api/mysteries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'join', mysteryId: selected.id }),
    })
    const data = await res.json()
    // If already exploring (400), just reload — they can answer
    if (res.ok || data.error === 'Already exploring') {
      await load()
    }
    setJoining(false)
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
    if (data.correct) {
      setResult('correct')
      setAnswer('')
      load()
    } else {
      setResult('wrong')
      setWrongCount(w => w + 1)
      // Auto-reveal next clue after 2 wrong attempts
      if (wrongCount >= 1 && clueIndex < (selected.clues?.length || 1) - 1) {
        setClueIndex(i => i + 1)
      }
    }
    setSubmitting(false)
  }

  const createMystery = async () => {
    const clues = [form.clue1, form.clue2, form.clue3, form.clue4].filter(c => c.trim())
    if (!form.title || !form.description || !form.answer || clues.length < 2) {
      setCreateMsg('Fill in title, description, answer, and at least 2 clues.')
      return
    }
    setCreating(true)
    const res = await fetch('/api/mysteries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        title: form.title, description: form.description,
        answer: form.answer.toLowerCase().trim(),
        clues, difficulty: form.difficulty,
      }),
    })
    const data = await res.json()
    if (!res.ok) { setCreateMsg(data.error || 'Failed'); setCreating(false); return }
    setCreateMsg('Mystery created! It\'s now live in The Void.')
    setForm({ title:'', description:'', answer:'', difficulty:'medium', clue1:'', clue2:'', clue3:'', clue4:'' })
    setCreating(false)
    setTab('mysteries')
    load()
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

  const STATUS_COLOR: Record<string, string> = {
    active: '#1D9E75', solved: '#a89bff', expired: '#444441'
  }

  const active  = mysteries.filter(m => m.status === 'active')
  const solved  = mysteries.filter(m => m.status === 'solved')
  const expired = mysteries.filter(m => m.status === 'expired')

  return (
    <>
      <style>{`
        .void-layout { display: grid; grid-template-columns: 280px 1fr; min-height: calc(100vh - 200px); }
        .void-list   { border-right: 0.5px solid var(--border); overflow-y: auto; }
        .void-detail { padding: 2rem; overflow-y: auto; }
        @media (max-width: 768px) {
          .void-layout { grid-template-columns: 1fr !important; }
          .void-list   { border-right: none !important; border-bottom: 0.5px solid var(--border); max-height: 260px; }
          .void-detail { padding: 1.25rem !important; }
        }
      `}</style>

      <div style={{ paddingTop: '7rem' }}>
        {/* Header */}
        <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <SectionLabel>World III</SectionLabel>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,6vw,4rem)', fontWeight: 300, lineHeight: 0.95 }}>🌑 The Void</h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              {active.length} active · {solved.length} solved · {mysteries.length} total
            </p>
          </div>
          {user && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setTab('mysteries')} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 1.1rem', background: tab === 'mysteries' ? 'rgba(127,119,221,0.12)' : 'transparent', border: `0.5px solid ${tab === 'mysteries' ? '#7F77DD' : 'var(--border)'}`, color: tab === 'mysteries' ? '#7F77DD' : 'var(--text-dim)', borderRadius: '2px', cursor: 'none' }}>🌑 Mysteries</button>
              <button onClick={() => setTab('create')} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 1.1rem', background: tab === 'create' ? 'rgba(127,119,221,0.12)' : 'transparent', border: `0.5px solid ${tab === 'create' ? '#7F77DD' : 'var(--border)'}`, color: tab === 'create' ? '#7F77DD' : 'var(--text-dim)', borderRadius: '2px', cursor: 'none' }}>+ Create mystery</button>
            </div>
          )}
        </div>

        {/* Create tab */}
        {tab === 'create' && user && (
          <div style={{ padding: '2rem', maxWidth: 680, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 300, marginBottom: '0.5rem' }}>Create a mystery</h2>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '2rem' }}>
              Write a mystery for the galaxy to solve. The first solver earns a monument. You earn +10 Legacy rep when your mystery is solved.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>Title</label>
                <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="The name of your mystery" style={{ width: '100%', background: 'transparent', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.75rem 1rem', fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text)' }} />
              </div>

              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="What is this mystery about? Set the scene. Give context without giving the answer." rows={3} style={{ width: '100%', background: 'transparent', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text)', resize: 'vertical', lineHeight: 1.7 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>Answer (case-insensitive)</label>
                  <input value={form.answer} onChange={e => setForm(f => ({...f, answer: e.target.value}))} placeholder="The exact answer solvers must submit" style={{ width: '100%', background: 'transparent', border: '0.5px solid rgba(127,119,221,0.4)', borderRadius: '2px', outline: 'none', padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#7F77DD' }} />
                </div>
                <div>
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>Difficulty</label>
                  <select value={form.difficulty} onChange={e => setForm(f => ({...f, difficulty: e.target.value}))} style={{ width: '100%', background: 'var(--deep)', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text)', cursor: 'none' }}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>Clues (revealed one at a time — easiest last)</label>
                {[1,2,3,4].map(n => (
                  <input key={n} value={(form as any)[`clue${n}`]} onChange={e => setForm(f => ({...f, [`clue${n}`]: e.target.value}))} placeholder={`Clue ${n}${n <= 2 ? ' (required)' : ' (optional)'}`} style={{ width: '100%', background: 'transparent', border: '0.5px solid var(--border)', borderRadius: '2px', outline: 'none', padding: '0.6rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text)', marginBottom: '0.5rem' }} />
                ))}
              </div>

              {createMsg && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: createMsg.includes('live') ? '#1D9E75' : '#D85A30' }}>{createMsg}</p>}

              <button onClick={createMystery} disabled={creating} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.8rem 2rem', background: '#7F77DD', color: 'white', border: 'none', borderRadius: '2px', cursor: 'none', width: 'fit-content' }}>
                {creating ? 'Creating...' : 'Launch mystery →'}
              </button>
            </div>
          </div>
        )}

        {/* Mysteries tab */}
        {tab === 'mysteries' && (
          <div className="void-layout">
            {/* Left: mystery list */}
            <div className="void-list">
              {loading ? (
                <div style={{ padding: '2rem', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)', textAlign: 'center' }}>The Void stirs...</div>
              ) : (
                <>
                  {/* Active */}
                  {active.length > 0 && (
                    <div style={{ padding: '0.6rem 1rem 0.2rem', fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1D9E75' }}>Active</div>
                  )}
                  {active.map(m => <MysteryListItem key={m.id} m={m} selected={selected} onSelect={selectMystery} statusColor={STATUS_COLOR} timeLeft={timeLeft} />)}

                  {/* Solved */}
                  {solved.length > 0 && (
                    <div style={{ padding: '0.8rem 1rem 0.2rem', fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#a89bff' }}>Solved</div>
                  )}
                  {solved.map(m => <MysteryListItem key={m.id} m={m} selected={selected} onSelect={selectMystery} statusColor={STATUS_COLOR} timeLeft={timeLeft} />)}
                </>
              )}
            </div>

            {/* Right: mystery detail */}
            <div className="void-detail">
              {!selected ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: '1rem' }}>
                  <div style={{ fontSize: '4rem', animation: 'drift 6s ease-in-out infinite' }}>🌑</div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text-muted)', fontWeight: 300 }}>Enter The Void.</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)' }}>Select a mystery to begin.</p>
                  {user && <button onClick={() => setTab('create')} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 1.25rem', background: 'rgba(127,119,221,0.1)', border: '0.5px solid rgba(127,119,221,0.3)', color: '#7F77DD', borderRadius: '2px', cursor: 'none', marginTop: '0.5rem' }}>Or create a mystery →</button>}
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR[selected.status], boxShadow: selected.status === 'active' ? `0 0 8px ${STATUS_COLOR[selected.status]}` : 'none' }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: STATUS_COLOR[selected.status] }}>{selected.status}</span>
                      {selected.difficulty && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: DIFFICULTY_COLORS[selected.difficulty] || '#7F77DD', border: `0.5px solid ${DIFFICULTY_COLORS[selected.difficulty] || '#7F77DD'}44`, padding: '0.1rem 0.5rem', borderRadius: '99px' }}>{selected.difficulty}</span>
                      )}
                      {selected.status === 'active' && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: '#7F77DD', marginLeft: 'auto' }}>{timeLeft(selected.expiresAt)}</span>}
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,4vw,2.5rem)', fontWeight: 300, lineHeight: 1.1, marginBottom: '0.75rem' }}>{selected.title}</h2>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.9 }}>{selected.description}</p>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: '2rem', padding: '1rem', border: '0.5px solid var(--border)', borderRadius: '2px', background: 'var(--deep)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    {[
                      { label: 'Explorers', val: selected._count?.explorers || 0, color: '#7F77DD' },
                      { label: 'Attempts',  val: selected._count?.attempts  || 0, color: 'var(--text-muted)' },
                      { label: 'Clues',     val: `${clueIndex + 1}/${selected.clues?.length || 1}`, color: 'var(--aether)' },
                    ].map(s => (
                      <div key={s.label}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 300, color: s.color, lineHeight: 1 }}>{s.val}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Clues — always show, reveal progressively */}
                  {selected.status === 'active' && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Clues revealed so far</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {selected.clues?.slice(0, clueIndex + 1).map((clue: string, i: number) => (
                          <div key={i} style={{ padding: '0.85rem 1.1rem', border: `0.5px solid ${i === clueIndex ? '#7F77DD44' : 'var(--border)'}`, borderRadius: '2px', background: i === clueIndex ? 'rgba(127,119,221,0.06)' : 'transparent', display: 'flex', gap: '0.75rem' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: '#7F77DD', flexShrink: 0, opacity: 0.8 }}>#{i + 1}</span>
                            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)', lineHeight: 1.5 }}>{clue}</p>
                          </div>
                        ))}
                      </div>
                      {clueIndex < (selected.clues?.length || 1) - 1 && (
                        <button onClick={() => setClueIndex(i => i + 1)} style={{ marginTop: '0.6rem', fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.4rem 1rem', background: 'rgba(127,119,221,0.08)', border: '0.5px solid rgba(127,119,221,0.25)', color: '#7F77DD', borderRadius: '2px', cursor: 'none' }}>Reveal next clue →</button>
                      )}
                    </div>
                  )}

                  {/* Action area */}
                  {selected.status === 'active' && user && (
                    <div style={{ border: '0.5px solid var(--border-bright)', borderRadius: '2px', padding: '1.25rem', background: 'var(--deep)' }}>
                      {!isExploring ? (
                        <div>
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1rem' }}>
                            Enter The Void to start. You'll gain <span style={{ color: '#1D9E75' }}>+1 Discovery rep</span> just for joining.
                          </p>
                          <button onClick={join} disabled={joining} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.75rem 2rem', background: 'rgba(127,119,221,0.15)', border: '0.5px solid rgba(127,119,221,0.4)', color: '#7F77DD', borderRadius: '2px', cursor: 'none' }}>{joining ? 'Entering...' : 'Enter The Void →'}</button>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.6rem' }}>
                            Your answer
                            {wrongCount > 0 && <span style={{ color: '#D85A30', marginLeft: '0.75rem' }}>({wrongCount} wrong attempt{wrongCount !== 1 ? 's' : ''})</span>}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                            <input value={answer} onChange={e => { setAnswer(e.target.value); setResult(null) }} onKeyDown={e => e.key === 'Enter' && attempt()} placeholder="What is the answer?"
                              style={{ flex: 1, minWidth: 180, background: 'transparent', border: `0.5px solid ${result === 'wrong' ? '#D85A30' : result === 'correct' ? '#1D9E75' : 'var(--border-bright)'}`, borderRadius: '2px', outline: 'none', padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text)', transition: 'border-color 0.2s' }} />
                            <button onClick={attempt} disabled={submitting || !answer.trim()} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.75rem 1.5rem', background: answer.trim() ? '#7F77DD' : 'rgba(127,119,221,0.2)', color: answer.trim() ? 'white' : '#7F77DD', border: 'none', borderRadius: '2px', cursor: 'none', whiteSpace: 'nowrap' }}>{submitting ? '...' : 'Submit →'}</button>
                          </div>
                          {result === 'wrong' && (
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#D85A30' }}>
                              ✗ Not right.
                              {wrongCount >= 2 && clueIndex < (selected.clues?.length || 1) - 1
                                ? ' A new clue has been revealed above.'
                                : ' Study the clues more carefully.'}
                            </div>
                          )}
                          {result === 'correct' && (
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#1D9E75' }}>
                              ✓ You solved it. <span style={{ color: 'var(--aether)' }}>+25 Discovery · +10 Wisdom · +5 Legacy</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Solved state */}
                  {selected.status === 'solved' && (
                    <div style={{ padding: '1.5rem', border: '0.5px solid rgba(168,155,255,0.3)', borderRadius: '2px', background: 'rgba(168,155,255,0.05)', textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🏛️</div>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--aether)', marginBottom: '0.25rem' }}>Solved.</p>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)' }}>A monument has been placed in The Archive.</p>
                    </div>
                  )}

                  {/* Not logged in */}
                  {selected.status === 'active' && !user && (
                    <div style={{ padding: '1.25rem', border: '0.5px solid var(--border)', borderRadius: '2px', textAlign: 'center' }}>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Sign in to explore this mystery and submit answers.</p>
                      <a href="/signin" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--void)', background: 'var(--aether)', padding: '0.6rem 1.25rem', borderRadius: '2px', display: 'inline-block' }}>Sign in →</a>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function MysteryListItem({ m, selected, onSelect, statusColor, timeLeft }: any) {
  return (
    <div onClick={() => onSelect(m)} style={{ padding: '1rem 1.25rem', borderBottom: '0.5px solid var(--border)', cursor: 'none', background: selected?.id === m.id ? 'var(--deep)' : 'transparent', borderLeft: `2px solid ${selected?.id === m.id ? '#7F77DD' : 'transparent'}`, transition: 'all 0.15s' }}
      onMouseEnter={e => { if (selected?.id !== m.id)(e.currentTarget as HTMLElement).style.background = 'var(--mid)' }}
      onMouseLeave={e => { if (selected?.id !== m.id)(e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem' }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor[m.status], flexShrink: 0, boxShadow: m.status === 'active' ? `0 0 5px ${statusColor[m.status]}` : 'none' }} />
        {m.difficulty && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.48rem', color: DIFFICULTY_COLORS[m.difficulty] || '#7F77DD', border: `0.5px solid ${DIFFICULTY_COLORS[m.difficulty] || '#7F77DD'}33`, padding: '0.05rem 0.35rem', borderRadius: '99px' }}>{m.difficulty}</span>}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.3, marginBottom: '0.3rem' }}>{m.title}</div>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--text-dim)' }}>{m._count?.explorers || 0} exploring</span>
        {m.status === 'active' && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: '#7F77DD' }}>{timeLeft(m.expiresAt)}</span>}
        {m._count?.attempts > 0 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--text-dim)' }}>{m._count.attempts} attempts</span>}
      </div>
    </div>
  )
}
