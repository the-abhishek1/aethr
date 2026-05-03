'use client'

interface Props {
  url: string
  type: string
  title: string
}

function getEmbedInfo(url: string, type: string): { embedUrl: string | null; kind: string } {
  if (!url) return { embedUrl: null, kind: 'none' }

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return { embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`, kind: 'youtube' }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return { embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`, kind: 'vimeo' }

  // SoundCloud
  if (url.includes('soundcloud.com')) {
    return { embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23BA7517&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`, kind: 'soundcloud' }
  }

  // Spotify (track, album, playlist, episode)
  const spotifyMatch = url.match(/spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/)
  if (spotifyMatch) return { embedUrl: `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}?utm_source=generator&theme=0`, kind: 'spotify' }

  // Direct video file
  if (url.match(/\.(mp4|webm|ogg)(\?|$)/i)) return { embedUrl: url, kind: 'video' }

  // Direct audio file
  if (url.match(/\.(mp3|wav|flac|aac|ogg)(\?|$)/i)) return { embedUrl: url, kind: 'audio' }

  // Supabase storage (from upload)
  if (url.includes('supabase.co/storage')) {
    const isVideo = url.match(/\.(mp4|webm)/i)
    return { embedUrl: url, kind: isVideo ? 'video' : 'audio' }
  }

  return { embedUrl: null, kind: 'link' }
}

export default function MediaPlayer({ url, type, title }: Props) {
  const { embedUrl, kind } = getEmbedInfo(url, type)

  if (!url) return null

  // YouTube / Vimeo
  if (kind === 'youtube' || kind === 'vimeo') {
    return (
      <div style={{ width: '100%', borderRadius: '4px', overflow: 'hidden', border: '0.5px solid var(--border)', marginBottom: '1rem', background: '#000', aspectRatio: '16/9' }}>
        <iframe
          src={embedUrl!}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        />
      </div>
    )
  }

  // SoundCloud
  if (kind === 'soundcloud') {
    return (
      <div style={{ width: '100%', borderRadius: '4px', overflow: 'hidden', border: '0.5px solid var(--border)', marginBottom: '1rem' }}>
        <iframe
          src={embedUrl!}
          title={title}
          allow="autoplay"
          style={{ width: '100%', height: '166px', border: 'none', display: 'block' }}
        />
      </div>
    )
  }

  // Spotify
  if (kind === 'spotify') {
    return (
      <div style={{ width: '100%', borderRadius: '4px', overflow: 'hidden', border: '0.5px solid var(--border)', marginBottom: '1rem' }}>
        <iframe
          src={embedUrl!}
          title={title}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          style={{ width: '100%', height: '152px', border: 'none', display: 'block' }}
        />
      </div>
    )
  }

  // Direct video
  if (kind === 'video') {
    return (
      <div style={{ width: '100%', borderRadius: '4px', overflow: 'hidden', border: '0.5px solid var(--border)', marginBottom: '1rem', background: '#000' }}>
        <video
          src={embedUrl!}
          controls
          style={{ width: '100%', maxHeight: '360px', display: 'block' }}
        />
      </div>
    )
  }

  // Direct audio
  if (kind === 'audio') {
    return (
      <div style={{ width: '100%', padding: '1rem', borderRadius: '4px', border: '0.5px solid var(--border)', marginBottom: '1rem', background: 'var(--deep)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: '#BA7517', marginBottom: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          🎵 {type || 'Audio'}
        </div>
        <audio controls style={{ width: '100%' }} src={embedUrl!} />
      </div>
    )
  }

  // External link fallback
  if (kind === 'link') {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', border: '0.5px solid var(--border)', borderRadius: '4px', textDecoration: 'none', marginBottom: '1rem', background: 'var(--deep)', transition: 'border-color 0.2s' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#BA7517'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
      >
        <span style={{ fontSize: '1.25rem' }}>🔗</span>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--text)' }}>{title}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: '#BA7517', marginTop: '0.15rem' }}>{url.slice(0, 60)}{url.length > 60 ? '...' : ''}</div>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>Open →</span>
      </a>
    )
  }

  return null
}
