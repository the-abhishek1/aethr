'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

const MOODS = [
  { id: 'curious', label: 'Curious', color: '#378ADD' },
  { id: 'creating', label: 'Creating', color: '#BA7517' },
  { id: 'reflecting', label: 'Reflecting', color: '#a89bff' },
  { id: 'energized', label: 'Energized', color: '#1D9E75' },
  { id: 'challenged', label: 'Challenged', color: '#D85A30' },
  { id: 'wandering', label: 'Wandering', color: '#d4b896' },
]

interface Props {
  worldId: string
  onPosted?: (signal: any) => void
}

export default function SignalComposer({ worldId, onPosted }: Props) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('')
  const [open, setOpen] = useState(false)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')

  if (!user) return null

  const post = async () => {
    if (!content.trim()) { setError('Write something first'); return }
    setPosting(true); setError('')
    try {
      const res = await fetch('/api/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, worldId, mood }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setContent(''); setMood(''); setOpen(false)
      onPosted?.(data.signal)
    } catch { setError('Failed to send signal') }
    finally { setPosting(false) }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1.1rem', background: 'var(--deep)', border: '0.5px solid var(--border)', borderRadius: '2px', cursor: 'none', transition: 'border-color 0.2s', textAlign: 'left' }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-bright)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
    >
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>{user.avatarEmoji}</div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>Drop a signal into the galaxy...</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--aether)', marginLeft: 'auto', opacity: 0.7 }}>📡</span>
    </button>
  )

  return (
    <div style={{ border: '0.5px solid var(--border-bright)', borderRadius: '2px', padding: '1.1rem', background: 'var(--deep)', animation: 'fadeUp 0.2s ease' }}>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0, marginTop: 3 }}>{user.avatarEmoji}</div>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="What's your signal?"
          rows={3}
          autoFocus
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)', resize: 'none', lineHeight: 1.6 }}
        />
      </div>

      {/* Mood selector */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {MOODS.map(m => (
          <button key={m.id} onClick={() => setMood(mood === m.id ? '' : m.id)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', padding: '0.25rem 0.7rem', borderRadius: '99px', border: `0.5px solid ${mood === m.id ? m.color : 'var(--border)'}`, background: mood === m.id ? `${m.color}18` : 'transparent', color: mood === m.id ? m.color : 'var(--text-dim)', cursor: 'none', transition: 'all 0.15s' }}>{m.label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)' }}>
            {content.length}/500
          </span>
          {error && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: '#D85A30' }}>{error}</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => { setOpen(false); setContent(''); setMood('') }} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 1rem', background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--text-dim)', borderRadius: '2px', cursor: 'none' }}>Cancel</button>
          <button onClick={post} disabled={posting || !content.trim() || content.length > 500} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 1.25rem', background: content.trim() ? 'var(--aether)' : 'var(--aether-dim)', color: content.trim() ? 'var(--void)' : 'var(--aether)', border: 'none', borderRadius: '2px', cursor: 'none', transition: 'all 0.15s' }}>{posting ? 'Sending...' : 'Send signal →'}</button>
        </div>
      </div>
    </div>
  )
}
