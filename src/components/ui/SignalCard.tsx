'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { subscribeToReactions } from '@/lib/realtime'
import Link from 'next/link'

const REACTIONS = ['🌀','🔥','🔭','⚔️','💙']
const MOOD_COLORS: Record<string, string> = {
  curious:'#378ADD', creating:'#BA7517', reflecting:'#a89bff',
  energized:'#1D9E75', challenged:'#D85A30', wandering:'#d4b896',
}

function buildReactionMap(rawReactions: any[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const r of rawReactions || []) {
    map[r.emoji] = (map[r.emoji] || 0) + 1
  }
  return map
}

export default function SignalCard({ signal, showReplies = true }: { signal: any; showReplies?: boolean }) {
  const { user } = useAuth()

  // Reactions state — seed from server data
  const [reactionMap, setReactionMap]   = useState<Record<string, number>>(() => buildReactionMap(signal.reactions))
  const [myReactions, setMyReactions]   = useState<Set<string>>(() => {
    const mine = new Set<string>()
    for (const r of signal.reactions || []) { if (r.userId === user?.id) mine.add(r.emoji) }
    return mine
  })
  const [toggling, setToggling]         = useState<string | null>(null)

  // Replies state
  const [expanded, setExpanded]         = useState(false)
  const [replies, setReplies]           = useState<any[]>([])
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [replying, setReplying]         = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [posting, setPosting]           = useState(false)
  const replyCount = signal._count?.replies || 0

  // Subscribe to live reaction changes for this signal
  useEffect(() => {
    const unsub = subscribeToReactions(signal.id, (reaction, action) => {
      const emoji = reaction.emoji
      setReactionMap(prev => {
        const next = { ...prev }
        if (action === 'added')   next[emoji] = (next[emoji] || 0) + 1
        if (action === 'removed') next[emoji] = Math.max(0, (next[emoji] || 1) - 1)
        if (next[emoji] === 0) delete next[emoji]
        return next
      })
    })
    return unsub
  }, [signal.id])

  const toggleReaction = async (emoji: string) => {
    if (!user || toggling) return
    setToggling(emoji)

    // Optimistic update
    const had = myReactions.has(emoji)
    setMyReactions(prev => { const s = new Set(prev); had ? s.delete(emoji) : s.add(emoji); return s })
    setReactionMap(prev => {
      const next = { ...prev }
      if (had) { next[emoji] = Math.max(0, (next[emoji] || 1) - 1); if (!next[emoji]) delete next[emoji] }
      else next[emoji] = (next[emoji] || 0) + 1
      return next
    })

    try {
      await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signalId: signal.id, emoji }),
      })
    } catch {
      // Rollback on failure
      setMyReactions(prev => { const s = new Set(prev); had ? s.add(emoji) : s.delete(emoji); return s })
      setReactionMap(prev => {
        const next = { ...prev }
        if (had) next[emoji] = (next[emoji] || 0) + 1
        else { next[emoji] = Math.max(0, (next[emoji] || 1) - 1); if (!next[emoji]) delete next[emoji] }
        return next
      })
    }
    setToggling(null)
  }

  const loadReplies = useCallback(async () => {
    if (expanded) { setExpanded(false); return }
    setLoadingReplies(true)
    const res  = await fetch(`/api/signals/${signal.id}`)
    const data = await res.json()
    setReplies(data.replies || [])
    setExpanded(true)
    setLoadingReplies(false)
  }, [expanded, signal.id])

  const postReply = async () => {
    if (!replyContent.trim()) return
    setPosting(true)
    const res  = await fetch(`/api/signals/${signal.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: replyContent }),
    })
    const data = await res.json()
    if (data.reply) {
      setReplies(prev => [...prev, data.reply])
      setReplyContent(''); setReplying(false); setExpanded(true)
    }
    setPosting(false)
  }

  const moodColor = signal.mood ? (MOOD_COLORS[signal.mood] || 'var(--text-dim)') : null
  const isVideo   = signal.mediaUrl && (signal.mediaUrl.includes('.mp4') || signal.mediaUrl.includes('.webm'))

  return (
    <div style={{ padding: '1rem 0', borderBottom: '0.5px solid var(--border)' }}>
      {/* Author row */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <Link href={`/profile/${signal.author?.username}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--surface)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', transition: 'border-color 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--aether)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
          >{signal.author?.avatarEmoji}</div>
        </Link>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Meta */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
            <Link href={`/profile/${signal.author?.username}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--aether)', textDecoration: 'none' }}>
              @{signal.author?.username}
            </Link>
            {signal.mood && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: moodColor || 'var(--text-dim)', padding: '0.1rem 0.45rem', border: `0.5px solid ${moodColor || 'var(--border)'}44`, borderRadius: '99px' }}>{signal.mood}</span>
            )}
            <Link href={`/signals/${signal.id}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--text-dim)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--aether)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)'}
            >
              {new Date(signal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Link>
          </div>

          {/* Content */}
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: signal.mediaUrl ? '0.75rem' : 0 }}>{signal.content}</p>

          {/* Media */}
          {signal.mediaUrl && (
            <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
              {isVideo ? (
                <video src={signal.mediaUrl} controls style={{ width: '100%', maxHeight: 320, borderRadius: '2px', border: '0.5px solid var(--border)', display: 'block' }} />
              ) : (
                <img src={signal.mediaUrl} alt="" style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: '2px', border: '0.5px solid var(--border)', display: 'block', cursor: 'zoom-in' }}
                  onClick={() => window.open(signal.mediaUrl, '_blank')} />
              )}
            </div>
          )}

          {/* Reactions + actions */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.6rem', flexWrap: 'wrap' }}>
            {/* Emoji buttons */}
            {REACTIONS.map(emoji => {
              const count   = reactionMap[emoji] || 0
              const active  = myReactions.has(emoji)
              const loading = toggling === emoji
              return (
                <button key={emoji} onClick={() => toggleReaction(emoji)} disabled={!user || loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.22rem 0.55rem', borderRadius: '99px', border: `0.5px solid ${active ? 'var(--aether)' : 'var(--border)'}`, background: active ? 'var(--aether-dim)' : 'transparent', cursor: user ? 'none' : 'default', transition: 'all 0.15s', opacity: loading ? 0.5 : 1 }}
                  onMouseEnter={e => { if (user)(e.currentTarget as HTMLElement).style.borderColor = 'var(--border-bright)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = active ? 'var(--aether)' : 'var(--border)' }}
                >
                  <span style={{ fontSize: '0.8rem', lineHeight: 1 }}>{emoji}</span>
                  {count > 0 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: active ? 'var(--aether)' : 'var(--text-dim)' }}>{count}</span>}
                </button>
              )
            })}

            {/* Reply toggle */}
            {showReplies && (
              <>
                <div style={{ width: '0.5px', height: 14, background: 'var(--border)', flexShrink: 0 }} />
                <button onClick={loadReplies} disabled={loadingReplies} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: replyCount > 0 ? 'var(--aether)' : 'var(--text-dim)', background: 'none', border: 'none', cursor: 'none', transition: 'color 0.15s', padding: 0 }}>
                  {loadingReplies ? '...' : `↩ ${replyCount > 0 ? replyCount : ''} ${replyCount === 1 ? 'reply' : 'replies'}`}
                </button>
                {user && (
                  <button onClick={() => setReplying(r => !r)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: replying ? 'var(--aether)' : 'var(--text-dim)', background: 'none', border: 'none', cursor: 'none', transition: 'color 0.15s', padding: 0 }}>
                    {replying ? '× cancel' : '+ reply'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reply composer */}
      {replying && user && (
        <div style={{ marginLeft: '2.5rem', marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', animation: 'fadeUp 0.2s ease' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--surface)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0, marginTop: 2 }}>{user.avatarEmoji}</div>
          <div style={{ flex: 1 }}>
            <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} placeholder={`Reply to @${signal.author?.username}...`} rows={2}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); postReply() } }}
              style={{ width: '100%', background: 'var(--deep)', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.5rem 0.75rem', fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)', resize: 'none', lineHeight: 1.5 }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.35rem' }}>
              <button onClick={postReply} disabled={posting || !replyContent.trim()} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.4rem 1rem', background: replyContent.trim() ? 'var(--aether)' : 'var(--aether-dim)', color: replyContent.trim() ? 'var(--void)' : 'var(--aether)', border: 'none', borderRadius: '2px', cursor: 'none' }}>
                {posting ? '...' : 'Reply →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replies thread */}
      {expanded && replies.length > 0 && (
        <div style={{ marginLeft: '2.5rem', marginTop: '0.5rem', borderLeft: '0.5px solid var(--border)', paddingLeft: '1rem' }}>
          {replies.map(r => (
            <div key={r.id} style={{ padding: '0.65rem 0', borderBottom: '0.5px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                <Link href={`/profile/${r.author?.username}`} style={{ textDecoration: 'none', fontSize: '0.8rem' }}>{r.author?.avatarEmoji}</Link>
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
