'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

const MOOD_COLORS: Record<string, string> = {
  curious: '#378ADD', creating: '#BA7517', reflecting: '#a89bff',
  energized: '#1D9E75', challenged: '#D85A30', wandering: '#d4b896',
}

interface Props {
  signal: any
  showReplies?: boolean
}

export default function SignalCard({ signal, showReplies = true }: Props) {
  const { user } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [replies, setReplies] = useState<any[]>([])
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [replying, setReplying] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [posting, setPosting] = useState(false)
  const replyCount = signal._count?.replies || 0

  const loadReplies = async () => {
    if (expanded) { setExpanded(false); return }
    setLoadingReplies(true)
    const res = await fetch(`/api/signals/${signal.id}`)
    const data = await res.json()
    setReplies(data.replies || [])
    setExpanded(true)
    setLoadingReplies(false)
  }

  const postReply = async () => {
    if (!replyContent.trim()) return
    setPosting(true)
    const res = await fetch(`/api/signals/${signal.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: replyContent }),
    })
    const data = await res.json()
    if (data.reply) {
      setReplies(prev => [...prev, data.reply])
      setReplyContent('')
      setReplying(false)
      setExpanded(true)
    }
    setPosting(false)
  }

  const moodColor = signal.mood ? (MOOD_COLORS[signal.mood] || 'var(--text-dim)') : null

  return (
    <div style={{ padding: '1rem 0', borderBottom: '0.5px solid var(--border)' }}>
      {/* Main signal */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <Link href={`/profile/${signal.author?.username}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--surface)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', transition: 'border-color 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--aether)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
          >{signal.author?.avatarEmoji}</div>
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
            <Link href={`/profile/${signal.author?.username}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--aether)', textDecoration: 'none' }}>
              @{signal.author?.username}
            </Link>
            {signal.mood && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: moodColor || 'var(--text-dim)', padding: '0.1rem 0.45rem', border: `0.5px solid ${moodColor || 'var(--border)'}44`, borderRadius: '99px' }}>{signal.mood}</span>
            )}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--text-dim)' }}>
              {new Date(signal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)', lineHeight: 1.6 }}>{signal.content}</p>

          {/* Actions */}
          {showReplies && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
              <button onClick={loadReplies} disabled={loadingReplies} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: replyCount > 0 ? 'var(--aether)' : 'var(--text-dim)', background: 'none', border: 'none', cursor: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'color 0.15s' }}>
                {loadingReplies ? '...' : `↩ ${replyCount > 0 ? replyCount : ''} ${replyCount === 1 ? 'reply' : replyCount > 1 ? 'replies' : 'reply'}`}
              </button>
              {user && (
                <button onClick={() => setReplying(r => !r)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: replying ? 'var(--aether)' : 'var(--text-dim)', background: 'none', border: 'none', cursor: 'none', transition: 'color 0.15s' }}>
                  {replying ? '× cancel' : '+ reply'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reply composer */}
      {replying && user && (
        <div style={{ marginLeft: '2.5rem', marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', animation: 'fadeUp 0.2s ease' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--surface)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0, marginTop: 2 }}>{user.avatarEmoji}</div>
          <div style={{ flex: 1 }}>
            <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} placeholder={`Reply to @${signal.author?.username}...`} rows={2} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); postReply() } }} style={{ width: '100%', background: 'var(--deep)', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.5rem 0.75rem', fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)', resize: 'none', lineHeight: 1.5 }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
              <button onClick={postReply} disabled={posting || !replyContent.trim()} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.4rem 1rem', background: replyContent.trim() ? 'var(--aether)' : 'var(--aether-dim)', color: replyContent.trim() ? 'var(--void)' : 'var(--aether)', border: 'none', borderRadius: '2px', cursor: 'none' }}>{posting ? '...' : 'Reply →'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Replies */}
      {expanded && replies.length > 0 && (
        <div style={{ marginLeft: '2.5rem', marginTop: '0.5rem', borderLeft: '0.5px solid var(--border)', paddingLeft: '1rem' }}>
          {replies.map(r => (
            <div key={r.id} style={{ padding: '0.65rem 0', borderBottom: '0.5px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                <Link href={`/profile/${r.author?.username}`} style={{ textDecoration: 'none' }}>
                  <span style={{ fontSize: '0.8rem' }}>{r.author?.avatarEmoji}</span>
                </Link>
                <Link href={`/profile/${r.author?.username}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--aether)', textDecoration: 'none' }}>@{r.author?.username}</Link>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--text-dim)' }}>{new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.5 }}>{r.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
