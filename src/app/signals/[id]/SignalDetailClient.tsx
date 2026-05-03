'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import SignalCard from '@/components/ui/SignalCard'

export default function SignalDetailClient({ signal }: { signal: any }) {
  const router = useRouter()

  if (!signal) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '3rem' }}>🌑</div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'var(--text-muted)' }}>Signal not found.</p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>It may have been removed or never existed.</p>
        <Link href="/commons" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--aether)', border: '0.5px solid rgba(168,155,255,0.3)', padding: '0.6rem 1.25rem', borderRadius: '2px' }}>Back to Commons →</Link>
      </div>
    )
  }

  const worldHref = `/${signal.worldId === 'commons' ? 'commons' : signal.worldId === 'forge' ? 'forge' : signal.worldId}`

  return (
    <>
      <style>{`
        .signal-detail-pad { padding: 7rem 2rem 4rem; max-width: 680px; margin: 0 auto; }
        @media (max-width: 640px) { .signal-detail-pad { padding: 6rem 1.25rem 3rem !important; } }
      `}</style>

      <div className="signal-detail-pad">
        {/* Back nav */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => router.back()} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'none', padding: 0 }}>← Back</button>
          <Link href={worldHref} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--aether)', textDecoration: 'none', textTransform: 'capitalize' }}>
            {signal.worldId} →
          </Link>
        </div>

        {/* Main signal */}
        <div style={{ border: '0.5px solid var(--border-bright)', borderRadius: '2px', padding: '1.5rem', background: 'var(--deep)', marginBottom: '1.5rem' }}>
          <SignalCard signal={signal} showReplies={false} />
        </div>

        {/* Share bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => { navigator.clipboard.writeText(window.location.href) }}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 1rem', background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--text-dim)', borderRadius: '2px', cursor: 'none' }}
          >
            📋 Copy link
          </button>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${signal.content.slice(0, 100)}" — @${signal.author?.username} on Aethr`)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 1rem', background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--text-dim)', borderRadius: '2px', textDecoration: 'none' }}
          >
            Share on X →
          </a>
        </div>

        {/* Replies */}
        {signal.replies?.length > 0 && (
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1rem' }}>
              {signal.replies.length} {signal.replies.length === 1 ? 'Reply' : 'Replies'}
            </div>
            <div style={{ borderLeft: '0.5px solid var(--border)', paddingLeft: '1.25rem' }}>
              {signal.replies.map((r: any) => (
                <SignalCard key={r.id} signal={r} showReplies={false} />
              ))}
            </div>
          </div>
        )}

        {/* Author card */}
        <div style={{ marginTop: '2rem', border: '0.5px solid var(--border)', borderRadius: '2px', padding: '1.25rem', background: 'var(--deep)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--surface)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{signal.author?.avatarEmoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text)', marginBottom: '0.2rem' }}>@{signal.author?.username}</div>
            {signal.author?.bio && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)', lineHeight: 1.7 }}>{signal.author.bio.slice(0, 100)}</div>}
          </div>
          <Link href={`/profile/${signal.author?.username}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--aether)', border: '0.5px solid rgba(168,155,255,0.3)', padding: '0.5rem 1rem', borderRadius: '2px', whiteSpace: 'nowrap' }}>
            View profile →
          </Link>
        </div>
      </div>
    </>
  )
}
