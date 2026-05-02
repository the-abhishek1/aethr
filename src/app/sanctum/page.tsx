'use client'
import { useState, useEffect, useCallback } from 'react'
import SectionLabel from '@/components/ui/SectionLabel'
import { useAuth } from '@/context/AuthContext'

const MOODS = ['reflective','grateful','restless','curious','melancholy','energized','lost','found','creating','exploring']

export default function SanctumPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<any[]>([])
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('')
  const [posting, setPosting] = useState(false)
  const [question, setQuestion] = useState('')
  const [insight, setInsight] = useState('')
  const [asking, setAsking] = useState(false)
  const [oracleOpen, setOracleOpen] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/sanctum')
    const data = await res.json()
    setEntries(data.entries || [])
  }, [])

  useEffect(() => { load() }, [load])

  const post = async () => {
    if (!content.trim()) return
    setPosting(true)
    const res = await fetch('/api/sanctum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, mood }),
    })
    const data = await res.json()
    if (data.entry) {
      setEntries(prev => [data.entry, ...prev])
      setContent(''); setMood('')
    }
    setPosting(false)
  }

  const deleteEntry = async (id: string) => {
    setDeleting(id)
    await fetch('/api/sanctum', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setEntries(prev => prev.filter(e => e.id !== id))
    setDeleting(null)
  }

  const askOracle = async () => {
    setAsking(true); setInsight('')
    const res = await fetch('/api/oracle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    })
    const data = await res.json()
    setInsight(data.insight || '')
    setAsking(false)
  }

  // Group entries by date
  const grouped: Record<string, any[]> = {}
  entries.forEach(e => {
    const date = new Date(e.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(e)
  })

  return (
    <>
      <style>{`
        .sanctum-layout { display: grid; grid-template-columns: 1fr 340px; gap: 0; min-height: calc(100vh - 180px); }
        .sanctum-right { border-left: 0.5px solid var(--border); padding: 2rem 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
        @media (max-width: 900px) {
          .sanctum-layout { grid-template-columns: 1fr !important; }
          .sanctum-right { border-left: none !important; border-top: 0.5px solid var(--border); }
        }
        @media (max-width: 640px) { .sanctum-pad { padding: 6rem 1.25rem 3rem !important; } }
        .entry-card:hover .entry-delete { opacity: 1 !important; }
      `}</style>

      <div style={{ paddingTop: '7rem' }}>
        {/* Header */}
        <div style={{ padding: '0 1.5rem 2rem', borderBottom: '0.5px solid var(--border)' }}>
          <SectionLabel>World IV</SectionLabel>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,6vw,4rem)', fontWeight: 300, lineHeight: 0.95 }}>🪞 The Sanctum</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>Your inner world. Private. Yours alone.</p>
        </div>

        <div className="sanctum-layout">
          {/* Left: journal */}
          <div className="sanctum-pad" style={{ padding: '2rem' }}>

            {/* Compose */}
            <div style={{ border: '0.5px solid var(--border-bright)', borderRadius: '2px', padding: '1.25rem', background: 'var(--deep)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0, marginTop: 4 }}>{user?.avatarEmoji}</div>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="What's on your mind? This is yours alone..."
                  rows={4}
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)', resize: 'none', lineHeight: 1.7 }}
                />
              </div>

              {/* Mood */}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {MOODS.map(m => (
                  <button key={m} onClick={() => setMood(mood === m ? '' : m)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', padding: '0.22rem 0.65rem', borderRadius: '99px', border: `0.5px solid ${mood === m ? 'var(--aether)' : 'var(--border)'}`, background: mood === m ? 'var(--aether-dim)' : 'transparent', color: mood === m ? 'var(--aether)' : 'var(--text-dim)', cursor: 'none', transition: 'all 0.15s' }}>{m}</button>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)', alignSelf: 'center' }}>Private · Only you can see this</span>
                <button onClick={post} disabled={posting || !content.trim()} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 1.25rem', background: content.trim() ? 'var(--aether)' : 'var(--aether-dim)', color: content.trim() ? 'var(--void)' : 'var(--aether)', border: 'none', borderRadius: '2px', cursor: 'none' }}>
                  {posting ? 'Saving...' : 'Save →'}
                </button>
              </div>
            </div>

            {/* Entries */}
            {entries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', border: '0.5px solid var(--border)', borderRadius: '2px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🪞</div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>The Sanctum is empty.</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>Write your first entry above. No one will ever see it.</p>
              </div>
            ) : Object.entries(grouped).map(([date, dayEntries]) => (
              <div key={date} style={{ marginBottom: '2.5rem' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--aether)', marginBottom: '1rem', opacity: 0.7 }}>{date}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)' }}>
                  {dayEntries.map((e: any) => (
                    <div key={e.id} className="entry-card" style={{ padding: '1.25rem', background: 'var(--void)', position: 'relative', transition: 'background 0.2s' }}
                      onMouseEnter={el => (el.currentTarget as HTMLElement).style.background = 'var(--deep)'}
                      onMouseLeave={el => (el.currentTarget as HTMLElement).style.background = 'var(--void)'}
                    >
                      {e.mood && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--aether)', padding: '0.15rem 0.5rem', border: '0.5px solid var(--aether)33', borderRadius: '99px', marginBottom: '0.5rem', display: 'inline-block' }}>{e.mood}</span>
                      )}
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{e.content}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--text-dim)' }}>
                          {new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button
                          className="entry-delete"
                          onClick={() => deleteEntry(e.id)}
                          disabled={deleting === e.id}
                          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: '#D85A30', background: 'transparent', border: 'none', cursor: 'none', opacity: 0, transition: 'opacity 0.2s' }}
                        >{deleting === e.id ? '...' : 'delete'}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right: Oracle */}
          <div className="sanctum-right">
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--aether)', marginBottom: '0.5rem' }}>The Oracle</div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>Not a chatbot. A mirror. It shows you patterns in your own journey.</p>
            </div>

            <div style={{ border: '0.5px solid rgba(168,155,255,0.2)', borderRadius: '2px', padding: '1.25rem', background: 'rgba(168,155,255,0.04)' }}>
              <button onClick={() => setOracleOpen(o => !o)} style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.6rem', background: oracleOpen ? 'var(--aether-dim)' : 'transparent', border: `0.5px solid ${oracleOpen ? 'var(--aether)' : 'rgba(168,155,255,0.3)'}`, color: 'var(--aether)', borderRadius: '2px', cursor: 'none', marginBottom: oracleOpen ? '1rem' : 0 }}>
                {oracleOpen ? '× Close oracle' : 'Ask the oracle'}
              </button>

              {oracleOpen && (
                <>
                  <textarea
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    placeholder="What patterns do you see? What am I missing? What have I been avoiding?"
                    rows={3}
                    style={{ width: '100%', background: 'transparent', border: '0.5px solid rgba(168,155,255,0.2)', borderRadius: '2px', outline: 'none', padding: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text)', resize: 'none', lineHeight: 1.7, marginBottom: '0.75rem' }}
                  />
                  <button onClick={askOracle} disabled={asking} style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.65rem', background: 'rgba(168,155,255,0.15)', border: '0.5px solid rgba(168,155,255,0.4)', color: 'var(--aether)', borderRadius: '2px', cursor: 'none' }}>
                    {asking ? 'The oracle is reading...' : 'Consult the oracle →'}
                  </button>
                </>
              )}
            </div>

            {/* Oracle response */}
            {insight && (
              <div style={{ border: '0.5px solid rgba(168,155,255,0.25)', borderRadius: '2px', padding: '1.5rem', background: 'rgba(168,155,255,0.04)', animation: 'fadeUp 0.5s ease' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--aether)', marginBottom: '0.75rem', opacity: 0.7 }}>The oracle speaks</div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--text)', lineHeight: 1.8, fontStyle: 'italic' }}>{insight}</p>
              </div>
            )}

            {/* Stats */}
            <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', padding: '1.25rem', background: 'var(--deep)', marginTop: 'auto' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Your sanctum</div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--aether)', lineHeight: 1 }}>{entries.length}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)' }}>entries</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--aether)', lineHeight: 1 }}>
                    {[...new Set(entries.map(e => e.mood).filter(Boolean))].length}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)' }}>moods</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
