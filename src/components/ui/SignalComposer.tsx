'use client'
import { useState, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'

const MOODS = ['😂 funny','🔥 hot take','🌀 curious','💡 idea','😤 rant','❤️ wholesome','🤯 mindblown','😴 tired']
const MOOD_IDS = ['funny','hot-take','curious','idea','rant','wholesome','mindblown','tired']

interface Props { worldId: string; onPosted?: (signal: any) => void }

export default function SignalComposer({ worldId, onPosted }: Props) {
  const { user } = useAuth()
  const [content, setContent]   = useState('')
  const [mood, setMood]         = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [showUrl, setShowUrl]   = useState(false)
  const [open, setOpen]         = useState(false)
  const [posting, setPosting]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError]       = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

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
      setContent(''); setMood(''); setMediaUrl(''); setUrlInput(''); setShowUrl(false); setOpen(false)
      onPosted?.(data.signal)
    } catch { setError('Failed to post') }
    finally { setPosting(false) }
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // For now, create a local object URL for preview (real upload would go to Supabase storage)
    // If Supabase storage is configured, replace this with an actual upload
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        setMediaUrl(data.url)
      } else {
        // Fallback: use object URL
        setMediaUrl(URL.createObjectURL(file))
      }
    } catch {
      setMediaUrl(URL.createObjectURL(file))
    }
    setUploading(false)
  }

  const attachUrl = () => {
    if (urlInput.trim()) { setMediaUrl(urlInput.trim()); setShowUrl(false); setUrlInput('') }
  }

  const isImage = (url: string) => url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) || url.includes('supabase')
  const isVideo = (url: string) => url.match(/\.(mp4|webm)(\?|$)/i)
  const isYouTube = (url: string) => url.includes('youtube.com') || url.includes('youtu.be')
  const isSoundCloud = (url: string) => url.includes('soundcloud.com')
  const isSpotify = (url: string) => url.includes('spotify.com')

  const getYTId = (url: string) => {
    const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return m?.[1]
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1.1rem', background: 'var(--deep)', border: '0.5px solid var(--border)', borderRadius: '2px', cursor: 'none', textAlign: 'left', transition: 'border-color 0.2s' }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-bright)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
    >
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>{user.avatarEmoji}</div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>Drop a signal... image, video, thought, hot take...</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--aether)', marginLeft: 'auto', opacity: 0.7 }}>📡</span>
    </button>
  )

  return (
    <div style={{ border: '0.5px solid var(--border-bright)', borderRadius: '2px', padding: '1.1rem', background: 'var(--deep)', animation: 'fadeUp 0.2s ease' }}>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0, marginTop: 3 }}>{user.avatarEmoji}</div>
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="What's your signal? Funny, deep, hot take, image, video — anything goes." rows={3} autoFocus maxLength={500}
          onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) post() }}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)', resize: 'none', lineHeight: 1.6 }} />
      </div>

      {/* Media preview */}
      {mediaUrl && (
        <div style={{ marginBottom: '0.75rem', position: 'relative', borderRadius: '4px', overflow: 'hidden', border: '0.5px solid var(--border)' }}>
          {isImage(mediaUrl) && <img src={mediaUrl} alt="preview" style={{ width: '100%', maxHeight: 300, objectFit: 'cover', display: 'block' }} />}
          {isVideo(mediaUrl) && <video src={mediaUrl} controls style={{ width: '100%', maxHeight: 300, display: 'block' }} />}
          {isYouTube(mediaUrl) && getYTId(mediaUrl) && (
            <img src={`https://img.youtube.com/vi/${getYTId(mediaUrl)}/hqdefault.jpg`} alt="YouTube" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }} />
          )}
          {(isSoundCloud(mediaUrl) || isSpotify(mediaUrl)) && (
            <div style={{ padding: '0.75rem 1rem', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>{isSpotify(mediaUrl) ? '🎵' : '🎧'}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>{mediaUrl.slice(0, 60)}...</span>
            </div>
          )}
          {!isImage(mediaUrl) && !isVideo(mediaUrl) && !isYouTube(mediaUrl) && !isSoundCloud(mediaUrl) && !isSpotify(mediaUrl) && (
            <div style={{ padding: '0.6rem 0.9rem', background: 'var(--surface)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>🔗 {mediaUrl.slice(0, 60)}</div>
          )}
          <button onClick={() => setMediaUrl('')} style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', color: 'white', fontSize: '0.75rem', cursor: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
      )}

      {/* URL embed input */}
      {showUrl && !mediaUrl && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <input value={urlInput} onChange={e => setUrlInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && attachUrl()} placeholder="YouTube, SoundCloud, Spotify, image URL, or any link..." autoFocus
            style={{ flex: 1, background: 'transparent', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.5rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text)' }} />
          <button onClick={attachUrl} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', padding: '0.5rem 0.9rem', background: 'var(--aether)', color: 'var(--void)', border: 'none', borderRadius: '2px', cursor: 'none' }}>Attach</button>
          <button onClick={() => { setShowUrl(false); setUrlInput('') }} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', padding: '0.5rem 0.75rem', background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--text-dim)', borderRadius: '2px', cursor: 'none' }}>×</button>
        </div>
      )}

      {/* Mood pills */}
      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {MOODS.map((m, i) => (
          <button key={m} onClick={() => setMood(mood === MOOD_IDS[i] ? '' : MOOD_IDS[i])} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', padding: '0.2rem 0.6rem', borderRadius: '99px', border: `0.5px solid ${mood === MOOD_IDS[i] ? 'var(--aether)' : 'var(--border)'}`, background: mood === MOOD_IDS[i] ? 'var(--aether-dim)' : 'transparent', color: mood === MOOD_IDS[i] ? 'var(--aether)' : 'var(--text-dim)', cursor: 'none', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>{m}</button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        {/* Media buttons */}
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFile} style={{ display: 'none' }} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} title="Upload image or video" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', padding: '0.3rem 0.65rem', background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--text-dim)', borderRadius: '2px', cursor: 'none' }}>{uploading ? '⏳' : '📷'}</button>
          <button onClick={() => setShowUrl(s => !s)} title="Embed link" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', padding: '0.3rem 0.65rem', background: showUrl ? 'var(--aether-dim)' : 'transparent', border: `0.5px solid ${showUrl ? 'var(--aether)' : 'var(--border)'}`, color: showUrl ? 'var(--aether)' : 'var(--text-dim)', borderRadius: '2px', cursor: 'none' }}>🔗</button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: content.length > 450 ? '#D85A30' : 'var(--text-dim)' }}>{content.length}/500</span>
          {error && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: '#D85A30' }}>{error}</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button onClick={() => { setOpen(false); setContent(''); setMood(''); setMediaUrl('') }} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.5rem 0.9rem', background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--text-dim)', borderRadius: '2px', cursor: 'none' }}>Cancel</button>
          <button onClick={post} disabled={posting || !content.trim()} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.5rem 1.1rem', background: content.trim() ? 'var(--aether)' : 'var(--aether-dim)', color: content.trim() ? 'var(--void)' : 'var(--aether)', border: 'none', borderRadius: '2px', cursor: 'none' }}>{posting ? 'Sending...' : 'Send →'}</button>
        </div>
      </div>
    </div>
  )
}
