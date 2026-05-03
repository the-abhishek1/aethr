'use client'
import { useState, useEffect, useCallback } from 'react'
import SectionLabel from '@/components/ui/SectionLabel'
import { useAuth } from '@/context/AuthContext'

const TAGS = ['philosophy', 'science', 'technology', 'art', 'culture', 'existence', 'society', 'nature']

export default function TheDeepPage() {
  const { user } = useAuth()
  const [discoveries, setDiscoveries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTag, setActiveTag] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', tags: [] as string[], mediaUrl: '' })
  const [posting, setPosting] = useState(false)
  const [rippling, setRippling] = useState<string | null>(null)

  const load = useCallback(async () => {
    const url = `/api/discoveries${activeTag ? `?tag=${activeTag}` : ''}`
    const res = await fetch(url)
    const data = await res.json()
    setDiscoveries(data.discoveries || [])
    setLoading(false)
  }, [activeTag])

  useEffect(() => { load() }, [load])

  const create = async () => {
    if (!form.title.trim() || !form.content.trim()) return
    setPosting(true)
    const res = await fetch('/api/discoveries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, mediaUrl: form.mediaUrl || undefined }),
    })
    const data = await res.json()
    if (data.discovery) {
      setDiscoveries(prev => [data.discovery, ...prev])
      setForm({ title: '', content: '', tags: [], mediaUrl: '' })
      setShowForm(false)
    }
    setPosting(false)
  }

  const ripple = async (id: string) => {
    setRippling(id)
    const res = await fetch(`/api/discoveries/${id}`, { method: 'POST' })
    const data = await res.json()
    if (data.discovery) {
      setDiscoveries(prev => prev.map(d => d.id === id ? { ...d, ripples: data.discovery.ripples } : d))
    }
    setRippling(null)
  }

  const toggleTag = (tag: string) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag]
    }))
  }

  return (
    <>
      <style>{`
        .deep-layout { display: grid; grid-template-columns: 220px 1fr; min-height: calc(100vh - 200px); }
        .deep-sidebar { border-right: 0.5px solid var(--border); padding: 1.5rem; }
        .deep-main { padding: 1.5rem 2rem; }
        @media (max-width: 768px) {
          .deep-layout { grid-template-columns: 1fr !important; }
          .deep-sidebar { border-right: none !important; border-bottom: 0.5px solid var(--border); padding: 1rem 1.25rem !important; }
          .deep-main { padding: 1.25rem !important; }
          .deep-header { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>

      <div style={{ paddingTop: '7rem' }}>
        {/* Header */}
        <div className="deep-header" style={{ padding: '0 1.5rem 2rem', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem' }}>
          <div>
            <SectionLabel>World II</SectionLabel>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,6vw,4rem)', fontWeight: 300, lineHeight: 0.95 }}>🔭 The Deep</h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>Discoveries that ripple across the galaxy.</p>
          </div>
          {user && (
            <button onClick={() => setShowForm(!showForm)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.6rem 1.5rem', background: showForm ? 'rgba(55,138,221,0.12)' : 'transparent', border: `0.5px solid ${showForm ? '#378ADD' : 'var(--border)'}`, color: showForm ? '#378ADD' : 'var(--text-muted)', borderRadius: '2px', cursor: 'none' }}>{showForm ? '× Cancel' : '+ Drop a discovery'}</button>
          )}
        </div>

        {/* Create form */}
        {showForm && (
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '0.5px solid var(--border)', background: 'var(--deep)', animation: 'fadeUp 0.25s ease' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="What did you discover?" style={{ background: 'transparent', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.75rem 1rem', fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text)' }} />
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Explain your discovery. What did you find? Why does it matter? What does it connect to?" rows={4} style={{ background: 'transparent', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text)', resize: 'vertical', lineHeight: 1.7 }} />
              <input value={form.mediaUrl} onChange={e => setForm(f => ({ ...f, mediaUrl: e.target.value }))} placeholder="Image URL (optional) — visualize your discovery" style={{ background: 'transparent', border: '0.5px solid var(--border)', borderRadius: '2px', outline: 'none', padding: '0.65rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text)' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {TAGS.map(t => (
                <button key={t} onClick={() => toggleTag(t)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', padding: '0.25rem 0.75rem', borderRadius: '99px', border: `0.5px solid ${form.tags.includes(t) ? '#378ADD' : 'var(--border)'}`, background: form.tags.includes(t) ? 'rgba(55,138,221,0.15)' : 'transparent', color: form.tags.includes(t) ? '#378ADD' : 'var(--text-dim)', cursor: 'none', transition: 'all 0.15s' }}>{t}</button>
              ))}
            </div>
            <button onClick={create} disabled={posting || !form.title.trim() || !form.content.trim()} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.65rem 1.75rem', background: form.title.trim() && form.content.trim() ? '#378ADD' : 'rgba(55,138,221,0.2)', color: form.title.trim() ? 'white' : '#378ADD', border: 'none', borderRadius: '2px', cursor: 'none' }}>{posting ? 'Sending ripple...' : 'Drop discovery →'}</button>
          </div>
        )}

        <div className="deep-layout">
          {/* Left sidebar - tag filter */}
          <div className="deep-sidebar">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1rem' }}>Filter by tag</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <button onClick={() => setActiveTag('')} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', padding: '0.45rem 0.75rem', borderRadius: '2px', border: `0.5px solid ${activeTag === '' ? '#378ADD' : 'var(--border)'}`, background: activeTag === '' ? 'rgba(55,138,221,0.12)' : 'transparent', color: activeTag === '' ? '#378ADD' : 'var(--text-dim)', cursor: 'none', textAlign: 'left', transition: 'all 0.15s' }}>All discoveries</button>
              {TAGS.map(t => (
                <button key={t} onClick={() => setActiveTag(activeTag === t ? '' : t)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', padding: '0.45rem 0.75rem', borderRadius: '2px', border: `0.5px solid ${activeTag === t ? '#378ADD' : 'var(--border)'}`, background: activeTag === t ? 'rgba(55,138,221,0.12)' : 'transparent', color: activeTag === t ? '#378ADD' : 'var(--text-dim)', cursor: 'none', textAlign: 'left', textTransform: 'capitalize', transition: 'all 0.15s' }}>{t}</button>
              ))}
            </div>

            {/* Top discoverers */}
            <div style={{ marginTop: '2rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Most rippled</div>
              {discoveries.slice(0, 3).map(d => (
                <div key={d.id} style={{ padding: '0.5rem 0', borderBottom: '0.5px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.1rem', lineHeight: 1.3 }}>{d.title.slice(0, 40)}{d.title.length > 40 ? '...' : ''}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: '#378ADD' }}>{d.ripples} ripples</div>
                </div>
              ))}
            </div>
          </div>

          {/* Main: discoveries feed */}
          <div className="deep-main">
            {loading ? (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)', textAlign: 'center', padding: '3rem' }}>Diving into The Deep...</div>
            ) : discoveries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', border: '0.5px solid var(--border)', borderRadius: '2px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔭</div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>The Deep is quiet.</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>Drop the first discovery.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)' }}>
                {discoveries.map((d, i) => (
                  <div key={d.id} style={{ padding: '1.75rem', background: 'var(--void)', transition: 'background 0.2s', position: 'relative' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--deep)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--void)'}
                  >
                    {/* First discovery badge */}
                    {i === 0 && discoveries.length === 1 && (
                      <div style={{ position: 'absolute', top: '1rem', right: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#378ADD', border: '0.5px solid #378ADD44', padding: '0.2rem 0.6rem', borderRadius: '2px' }}>First discovery</div>
                    )}

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{d.author?.avatarEmoji}</div>
                      <div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--aether)' }}>@{d.author?.username}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)', marginLeft: '0.75rem' }}>{new Date(d.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.1rem,2.5vw,1.4rem)', fontWeight: 400, color: 'var(--text)', marginBottom: '0.75rem', lineHeight: 1.3 }}>{d.title}</h3>
                    {d.mediaUrl && d.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) && (
                      <div style={{ marginBottom: '1rem', borderRadius: '4px', overflow: 'hidden', border: '0.5px solid var(--border)' }}>
                        <img src={d.mediaUrl} alt={d.title} style={{ width: '100%', maxHeight: 320, objectFit: 'cover', display: 'block' }} loading="lazy" />
                      </div>
                    )}
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.9, marginBottom: '1rem' }}>{d.content}</p>

                    {/* Tags */}
                    {d.tags?.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        {d.tags.map((t: string) => (
                          <span key={t} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', padding: '0.2rem 0.6rem', borderRadius: '99px', border: '0.5px solid rgba(55,138,221,0.3)', color: '#378ADD', textTransform: 'capitalize' }}>{t}</span>
                        ))}
                      </div>
                    )}

                    {/* Ripple button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {user && user.id !== d.authorId && (
                        <button onClick={() => ripple(d.id)} disabled={rippling === d.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.4rem 1rem', background: 'rgba(55,138,221,0.1)', border: '0.5px solid rgba(55,138,221,0.3)', color: '#378ADD', borderRadius: '2px', cursor: 'none', transition: 'all 0.2s' }}
                          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(55,138,221,0.2)' }}
                          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(55,138,221,0.1)' }}
                        >
                          {rippling === d.id ? '~' : '〜'} {rippling === d.id ? 'Rippling...' : 'Ripple'}
                        </button>
                      )}
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#378ADD' }}>{d.ripples} ripples</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
