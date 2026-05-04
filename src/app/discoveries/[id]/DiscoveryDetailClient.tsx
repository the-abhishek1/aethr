'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const REP_TAGS: Record<string, string> = {
  philosophy: '#a89bff', science: '#378ADD', technology: '#1D9E75',
  art: '#d4b896', culture: '#D85A30', existence: '#7F77DD',
  society: '#639922', nature: '#1D9E75',
}

export default function DiscoveryDetailClient({ discovery }: { discovery: any }) {
  const router = useRouter()
  const { user } = useAuth()
  const [rippled, setRippled] = useState(false)
  const [rippleCount, setRippleCount] = useState(discovery?.ripples || 0)
  const [rippling, setRippling] = useState(false)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<any[]>([])
  const [posting, setPosting] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!discovery) return
    // Load discussion signals for this discovery
    fetch(`/api/signals?worldId=the-deep&limit=50`)
      .then(r => r.json())
      .then(d => {
        setComments((d.signals || []).filter((s: any) =>
          s.content?.includes(`[discovery:${discovery.id}]`)
        ))
      })
  }, [discovery?.id])

  if (!discovery) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <div style={{ fontSize: '3rem' }}>🔭</div>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'var(--text-muted)' }}>Discovery not found.</p>
      <Link href="/the-deep" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--aether)', textDecoration: 'none', border: '0.5px solid rgba(168,155,255,0.3)', padding: '0.6rem 1.25rem', borderRadius: '2px' }}>← The Deep</Link>
    </div>
  )

  const ripple = async () => {
    if (!user) { router.push('/signin'); return }
    if (rippled || user.id === discovery.author?.id) return
    setRippling(true)
    await fetch(`/api/discoveries/${discovery.id}`, { method: 'POST' })
    setRippleCount((n: number) => n + 1)
    setRippled(true)
    setRippling(false)
  }

  const postComment = async () => {
    if (!comment.trim() || !user) return
    setPosting(true)
    const res = await fetch('/api/signals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: `[discovery:${discovery.id}] ${comment}`, worldId: 'the-deep', mood: 'curious' }),
    })
    const data = await res.json()
    if (data.signal) {
      setComments(prev => [data.signal, ...prev])
      setComment('')
    }
    setPosting(false)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <style>{`
        .disc-pad { padding: 7rem 2rem 4rem; max-width: 760px; margin: 0 auto; }
        @media (max-width: 640px) { .disc-pad { padding: 6rem 1.25rem 3rem !important; } }
      `}</style>

      <div className="disc-pad">
        {/* Back */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => router.back()} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'none', padding: 0 }}>← Back</button>
          <Link href="/the-deep" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#378ADD', textDecoration: 'none' }}>The Deep →</Link>
        </div>

        {/* Main card */}
        <div style={{ border: '0.5px solid var(--border-bright)', borderRadius: '2px', padding: '2rem', background: 'var(--deep)', marginBottom: '1.5rem' }}>
          {/* Author row */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem' }}>
            <Link href={`/profile/${discovery.author?.username}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>{discovery.author?.avatarEmoji}</div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--aether)' }}>@{discovery.author?.username}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)' }}>{new Date(discovery.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </Link>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#378ADD', fontWeight: 300 }}>{rippleCount}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)' }}>ripples</span>
            </div>
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,4vw,2.5rem)', fontWeight: 400, color: 'var(--text)', lineHeight: 1.2, marginBottom: '1.25rem' }}>{discovery.title}</h1>

          {/* Image */}
          {discovery.mediaUrl?.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) && (
            <div style={{ marginBottom: '1.25rem', borderRadius: '4px', overflow: 'hidden', border: '0.5px solid var(--border)' }}>
              <img src={discovery.mediaUrl} alt={discovery.title} style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          {/* Content */}
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 2, marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
            {discovery.content}
          </div>

          {/* Tags */}
          {discovery.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {discovery.tags.map((t: string) => (
                <Link key={t} href={`/the-deep`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', padding: '0.2rem 0.65rem', borderRadius: '99px', border: `0.5px solid ${REP_TAGS[t] || '#378ADD'}44`, color: REP_TAGS[t] || '#378ADD', textDecoration: 'none', textTransform: 'capitalize', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${REP_TAGS[t] || '#378ADD'}11`}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >{t}</Link>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {user && user.id !== discovery.author?.id && (
              <button onClick={ripple} disabled={rippling || rippled} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.55rem 1.25rem', background: rippled ? 'rgba(55,138,221,0.2)' : 'rgba(55,138,221,0.1)', border: `0.5px solid ${rippled ? '#378ADD' : 'rgba(55,138,221,0.3)'}`, color: '#378ADD', borderRadius: '2px', cursor: 'none', transition: 'all 0.2s' }}>
                〜 {rippled ? 'Rippled' : rippling ? '...' : 'Ripple this'}
              </button>
            )}
            <button onClick={copyLink} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.55rem 1.1rem', background: 'transparent', border: '0.5px solid var(--border)', color: copied ? '#1D9E75' : 'var(--text-dim)', borderRadius: '2px', cursor: 'none', transition: 'all 0.2s' }}>
              {copied ? '✓ Copied' : '📋 Copy link'}
            </button>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${discovery.title}" — @${discovery.author?.username} on Aethr`)}&url=${typeof window !== 'undefined' ? window.location.href : ''}`} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.55rem 1.1rem', background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--text-dim)', borderRadius: '2px', textDecoration: 'none' }}>
              Share on X →
            </a>
          </div>
        </div>

        {/* Author card */}
        <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', padding: '1.25rem', background: 'var(--deep)', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--surface)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{discovery.author?.avatarEmoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text)', marginBottom: '0.2rem' }}>@{discovery.author?.username}</div>
            {discovery.author?.bio && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)', lineHeight: 1.7 }}>{discovery.author.bio.slice(0, 100)}</div>}
          </div>
          <Link href={`/profile/${discovery.author?.username}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--aether)', border: '0.5px solid rgba(168,155,255,0.3)', padding: '0.5rem 1rem', borderRadius: '2px', whiteSpace: 'nowrap' }}>View profile →</Link>
        </div>

        {/* Discussion */}
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1rem' }}>
            Discussion ({comments.length})
          </div>

          {user && (
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>{user.avatarEmoji}</div>
              <div style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
                <input value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && postComment()} placeholder="What does this make you think..." style={{ flex: 1, background: 'transparent', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.6rem 0.9rem', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text)', transition: 'border-color 0.2s' }}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#378ADD'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--border-bright)'}
                />
                <button onClick={postComment} disabled={posting || !comment.trim()} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.6rem 1.1rem', background: comment.trim() ? 'rgba(55,138,221,0.15)' : 'transparent', border: '0.5px solid rgba(55,138,221,0.3)', color: '#378ADD', borderRadius: '2px', cursor: 'none', flexShrink: 0 }}>
                  {posting ? '...' : 'Post'}
                </button>
              </div>
            </div>
          )}

          {!user && (
            <div style={{ padding: '1rem', border: '0.5px solid var(--border)', borderRadius: '2px', background: 'var(--deep)', marginBottom: '1rem', textAlign: 'center' }}>
              <Link href="/signin" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--aether)', textDecoration: 'none' }}>Sign in to join the discussion →</Link>
            </div>
          )}

          {comments.length === 0 ? (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)', padding: '1rem 0' }}>No discussion yet. Start one.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {comments.map((c: any) => (
                <div key={c.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', border: '0.5px solid var(--border)', borderRadius: '2px', background: 'var(--deep)' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>{c.author?.avatarEmoji}</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--aether)', marginRight: '0.5rem' }}>@{c.author?.username}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{c.content.replace(`[discovery:${discovery.id}] `, '')}</span>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
