'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

function SearchContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [q, setQ] = useState(params.get('q') || '')
  const [type, setType] = useState('all')
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  const search = useCallback(async (query: string, t: string) => {
    if (query.length < 2) { setResults({}); setTotal(0); return }
    setLoading(true)
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${t}`)
    const data = await res.json()
    setResults(data.results || {})
    setTotal(data.total || 0)
    setLoading(false)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => search(q, type), 300)
    return () => clearTimeout(t)
  }, [q, type, search])

  const TYPES = ['all', 'users', 'signals', 'debates', 'factions', 'discoveries']

  return (
    <>
      <style>{`
        .search-pad { padding: 7rem 2rem 4rem; max-width: 760px; margin: 0 auto; }
        @media (max-width: 640px) { .search-pad { padding: 6rem 1.25rem 3rem !important; } }
      `}</style>

      <div className="search-pad">
        {/* Search input */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <input
              value={q}
              onChange={e => { setQ(e.target.value); router.replace(`/search?q=${encodeURIComponent(e.target.value)}`, { scroll: false }) }}
              placeholder="Search the galaxy..."
              autoFocus
              style={{ width: '100%', background: 'transparent', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '1rem 1.25rem 1rem 3rem', fontFamily: 'var(--font-display)', fontSize: 'clamp(1rem,2.5vw,1.3rem)', color: 'var(--text)', letterSpacing: '0.01em', transition: 'border-color 0.2s' }}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--aether)'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--border-bright)'}
            />
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>⌕</span>
          </div>

          {/* Type filter pills */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {TYPES.map(t => (
              <button key={t} onClick={() => setType(t)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'capitalize', padding: '0.3rem 0.85rem', borderRadius: '99px', border: `0.5px solid ${type === t ? 'var(--aether)' : 'var(--border)'}`, background: type === t ? 'var(--aether-dim)' : 'transparent', color: type === t ? 'var(--aether)' : 'var(--text-dim)', cursor: 'none', transition: 'all 0.15s' }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)', textAlign: 'center', padding: '2rem' }}>Searching the galaxy...</div>
        )}

        {/* No results */}
        {!loading && q.length >= 2 && total === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌑</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--text-muted)' }}>Nothing found for "{q}"</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>Try different words or explore a world.</p>
          </div>
        )}

        {/* Results */}
        {!loading && total > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Users */}
            {results.users?.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Travellers</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)' }}>
                  {results.users.map((u: any) => (
                    <Link key={u.id} href={`/profile/${u.username}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1.1rem', background: 'var(--void)', textDecoration: 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--deep)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--void)'}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{u.avatarEmoji}</div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)' }}>@{u.username}</div>
                        {u.bio && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)' }}>{u.bio.slice(0, 80)}</div>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Signals */}
            {results.signals?.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Signals</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)' }}>
                  {results.signals.map((s: any) => (
                    <div key={s.id} style={{ padding: '0.9rem 1.1rem', background: 'var(--void)', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--deep)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--void)'}
                    >
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.85rem' }}>{s.author?.avatarEmoji}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--aether)' }}>@{s.author?.username}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-dim)' }}>{s.worldId}</span>
                      </div>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.4 }}>{s.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Debates */}
            {results.debates?.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Debates</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)' }}>
                  {results.debates.map((d: any) => (
                    <Link key={d.id} href="/arena" style={{ display: 'block', padding: '0.9rem 1.1rem', background: 'var(--void)', textDecoration: 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--deep)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--void)'}
                    >
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)', marginBottom: '0.25rem' }}>{d.title}</div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-dim)' }}>@{d.creator?.username}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-dim)' }}>{d._count?.arguments} args</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Factions */}
            {results.factions?.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Factions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)' }}>
                  {results.factions.map((f: any) => (
                    <Link key={f.id} href="/factions" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1.1rem', background: 'var(--void)', textDecoration: 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--deep)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--void)'}
                    >
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: f.color, boxShadow: `0 0 6px ${f.color}`, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)' }}>{f.name}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-dim)' }}>{f._count?.members} members</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Discoveries */}
            {results.discoveries?.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Discoveries</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)' }}>
                  {results.discoveries.map((d: any) => (
                    <Link key={d.id} href="/the-deep" style={{ display: 'block', padding: '0.9rem 1.1rem', background: 'var(--void)', textDecoration: 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--deep)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--void)'}
                    >
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)', marginBottom: '0.25rem' }}>{d.title}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '0.3rem' }}>{d.content.slice(0, 120)}...</div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: '#378ADD' }}>🔭 @{d.author?.username}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-dim)' }}>{d.ripples} ripples</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!loading && q.length < 2 && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,4vw,2.5rem)', fontWeight: 300, color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Search the <em style={{ color: 'var(--aether)' }}>galaxy.</em>
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>Find travellers, signals, debates, factions, and discoveries.</p>
          </div>
        )}
      </div>
    </>
  )
}

export default function SearchPage() {
  return <Suspense fallback={null}><SearchContent /></Suspense>
}
