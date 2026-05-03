'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import MediaUpload from './MediaUpload'

const MOODS = ['curious','creating','reflecting','energized','challenged','wandering']

interface Props {
  worldId: string
  onPosted?: (signal: any) => void
}

export default function SignalComposer({ worldId, onPosted }: Props) {
  const { user } = useAuth()
  const [content, setContent]     = useState('')
  const [mood, setMood]           = useState('')
  const [mediaUrl, setMediaUrl]   = useState('')
  const [mediaType, setMediaType] = useState('')
  const [open, setOpen]           = useState(false)
  const [posting, setPosting]     = useState(false)
  const [error, setError]         = useState('')

  if (!user) return null

  const post = async () => {
    if (!content.trim()) { setError('Write something first'); return }
    setPosting(true); setError('')
    try {
      const res = await fetch('/api/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, worldId, mood, mediaUrl: mediaUrl || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setContent(''); setMood(''); setMediaUrl(''); setMediaType(''); setOpen(false)
      onPosted?.(data.signal)
    } catch { setError('Failed to send signal') }
    finally { setPosting(false) }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1.1rem', background: 'var(--deep)', border: '0.5px solid var(--border)', borderRadius: '2px', cursor: 'none', textAlign: 'left', transition: 'border-color 0.2s' }}
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
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0, marginTop: 3 }}>{user.avatarEmoji}</div>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="What's your signal?"
          rows={3}
          autoFocus
          maxLength={500}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)', resize: 'none', lineHeight: 1.6 }}
        />
      </div>

      {/* Media preview / upload */}
      <div style={{ marginBottom: '0.75rem' }}>
        <MediaUpload
          preview={mediaUrl}
          onUpload={(url, type) => { setMediaUrl(url); setMediaType(type) }}
          onClear={() => { setMediaUrl(''); setMediaType('') }}
        />
      </div>

      {/* Mood pills */}
      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {MOODS.map(m => (
          <button key={m} onClick={() => setMood(mood === m ? '' : m)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', padding: '0.22rem 0.65rem', borderRadius: '99px', border: `0.5px solid ${mood === m ? 'var(--aether)' : 'var(--border)'}`, background: mood === m ? 'var(--aether-dim)' : 'transparent', color: mood === m ? 'var(--aether)' : 'var(--text-dim)', cursor: 'none', transition: 'all 0.15s' }}>{m}</button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: content.length > 450 ? '#D85A30' : 'var(--text-dim)' }}>{content.length}/500</span>
          {error && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: '#D85A30' }}>{error}</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => { setOpen(false); setContent(''); setMood(''); setMediaUrl('') }} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 1rem', background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--text-dim)', borderRadius: '2px', cursor: 'none' }}>Cancel</button>
          <button onClick={post} disabled={posting || !content.trim() || content.length > 500} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 1.25rem', background: content.trim() ? 'var(--aether)' : 'var(--aether-dim)', color: content.trim() ? 'var(--void)' : 'var(--aether)', border: 'none', borderRadius: '2px', cursor: 'none', transition: 'all 0.15s' }}>{posting ? 'Sending...' : 'Send signal →'}</button>
        </div>
      </div>
    </div>
  )
}
