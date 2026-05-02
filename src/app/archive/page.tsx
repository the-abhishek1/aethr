'use client'
import { useState, useEffect } from 'react'
import SectionLabel from '@/components/ui/SectionLabel'
import Link from 'next/link'

const MONUMENT_ICONS: Record<string, string> = {
  mystery_solved: '🌑',
  first_discovery: '🔭',
  faction_war: '⚔️',
  debate_winner: '🏆',
  milestone: '🏛️',
}

const REP_COLORS: Record<string, string> = {
  wisdom: '#a89bff', creativity: '#d4b896', discovery: '#1D9E75',
  trust: '#378ADD', debate: '#D85A30', legacy: '#888780',
}

export default function ArchivePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'lore' | 'monuments' | 'legends'>('lore')

  useEffect(() => {
    fetch('/api/archive')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [])

  return (
    <>
      <style>{`
        .archive-pad { padding: 7rem 2rem 4rem; }
        .legends-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        @media (max-width: 768px) {
          .archive-pad { padding: 6rem 1.25rem 3rem !important; }
          .legends-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="archive-pad">
        <SectionLabel>World IV</SectionLabel>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem,6vw,5rem)', fontWeight: 300, lineHeight: 0.95, marginBottom: '1.5rem' }}>
          📜 The Archive
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: 480, marginBottom: '3rem' }}>
          The galaxy's living memory. Every major event, creation, and discovery woven into lore.
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '3rem', borderBottom: '0.5px solid var(--border)', paddingBottom: '1rem' }}>
          {(['lore', 'monuments', 'legends'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'capitalize', padding: '0.5rem 1.25rem', borderRadius: '2px', cursor: 'none', background: tab === t ? 'rgba(212,184,150,0.12)' : 'transparent', border: `0.5px solid ${tab === t ? 'var(--gold)' : 'var(--border)'}`, color: tab === t ? 'var(--gold)' : 'var(--text-dim)', transition: 'all 0.15s' }}>{t}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', textAlign: 'center', padding: '4rem' }}>Reading the Archive...</div>
        ) : (
          <>
            {/* Galaxy Lore */}
            {tab === 'lore' && data?.lore && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,3vw,2.5rem)', fontWeight: 300, marginBottom: '2rem', color: 'var(--gold)' }}>
                  <em>The Galaxy's Story</em>
                </h2>

                {/* Big stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)', marginBottom: '3rem' }}>
                  {[
                    { label: 'Travellers', val: data.lore.userCount, color: 'var(--aether)', icon: '⚗️' },
                    { label: 'Signals sent', val: data.lore.signalCount, color: '#1D9E75', icon: '📡' },
                    { label: 'Debates opened', val: data.lore.debateCount, color: '#D85A30', icon: '⚔️' },
                    { label: 'Discoveries', val: data.lore.discoveryCount, color: '#378ADD', icon: '🔭' },
                    { label: 'Mysteries solved', val: data.lore.mysteriesSolved, color: '#7F77DD', icon: '🌑' },
                    { label: 'Factions', val: data.lore.factionCount, color: '#a89bff', icon: '🏴' },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'var(--void)', padding: '2rem 1.5rem', textAlign: 'center', transition: 'background 0.2s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--deep)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--void)'}
                    >
                      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300, color: s.color, lineHeight: 1 }}>{s.val}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.5rem' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Lore text */}
                <div style={{ maxWidth: 680, border: '0.5px solid var(--border)', borderRadius: '2px', padding: '2rem', background: 'var(--deep)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.25rem', opacity: 0.8 }}>The Chronicle</div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text)', lineHeight: 2, fontStyle: 'italic' }}>
                    In the beginning, there was the Æther — the substance of the heavens.
                    {data.lore.userCount > 0 && ` ${data.lore.userCount} traveller${data.lore.userCount !== 1 ? 's have' : ' has'} entered the galaxy.`}
                    {data.lore.signalCount > 0 && ` ${data.lore.signalCount} signal${data.lore.signalCount !== 1 ? 's have' : ' has'} echoed across the worlds.`}
                    {data.lore.discoveryCount > 0 && ` ${data.lore.discoveryCount} discover${data.lore.discoveryCount !== 1 ? 'ies have' : 'y has'} rippled through The Deep.`}
                    {data.lore.mysteriesSolved > 0 && ` ${data.lore.mysteriesSolved} myster${data.lore.mysteriesSolved !== 1 ? 'ies have' : 'y has'} been solved in The Void.`}
                    {data.lore.factionCount > 0 && ` ${data.lore.factionCount} faction${data.lore.factionCount !== 1 ? 's have' : ' has'} been forged.`}
                    {' '}The story is still being written.
                  </p>
                </div>
              </div>
            )}

            {/* Monuments */}
            {tab === 'monuments' && (
              <div>
                {data?.monuments?.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem', border: '0.5px solid var(--border)', borderRadius: '2px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏛️</div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No monuments yet.</p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>Solve a mystery. Win a debate. Make history.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)' }}>
                    {data.monuments.map((m: any) => (
                      <div key={m.id} style={{ padding: '1.5rem 2rem', background: 'var(--void)', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', transition: 'background 0.2s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--deep)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--void)'}
                      >
                        <div style={{ fontSize: '2rem', flexShrink: 0 }}>{MONUMENT_ICONS[m.type] || '🏛️'}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--gold)', marginBottom: '0.35rem' }}>{m.title}</div>
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '0.5rem' }}>{m.description}</p>
                          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {m.actorName && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--aether)' }}>@{m.actorName}</span>}
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)' }}>{new Date(m.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Legends */}
            {tab === 'legends' && (
              <div className="legends-grid">
                {/* Top travellers */}
                <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', padding: '1.5rem', background: 'var(--deep)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>Legendary travellers</div>
                  {data?.topByRep?.map((r: any, i: number) => {
                    const total = Object.entries(REP_COLORS).reduce((sum, [key]) => sum + (r[key] || 0), 0)
                    return (
                      <div key={r.id} style={{ padding: '0.85rem 0', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: i === 0 ? 'var(--gold)' : 'var(--text-dim)', minWidth: 24 }}>{i + 1}</span>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>{r.user?.avatarEmoji}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)' }}>@{r.user?.username}</div>
                          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                            {Object.entries(REP_COLORS).map(([key, color]) => r[key] > 0 && (
                              <span key={key} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color }}>{r[key]} {key.slice(0, 3)}</span>
                            ))}
                          </div>
                        </div>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--aether)' }}>{total}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Top discoveries */}
                <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', padding: '1.5rem', background: 'var(--deep)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>Most rippled discoveries</div>
                  {data?.topDiscoveries?.length === 0 ? (
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>No discoveries yet. Be the first.</p>
                  ) : data?.topDiscoveries?.map((d: any) => (
                    <div key={d.id} style={{ padding: '0.85rem 0', borderBottom: '0.5px solid var(--border)' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.2rem' }}>{d.title}</div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--aether)' }}>@{d.author?.username}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: '#378ADD' }}>{d.ripples} ripples</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Top factions */}
                <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', padding: '1.5rem', background: 'var(--deep)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>Dominant factions</div>
                  {data?.topFactions?.length === 0 ? (
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>No factions yet.</p>
                  ) : data?.topFactions?.map((f: any) => (
                    <div key={f.id} style={{ padding: '0.85rem 0', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: f.color, boxShadow: `0 0 6px ${f.color}`, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)' }}>{f.name}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-dim)' }}>{f._count.members} members</div>
                      </div>
                      <Link href="/factions" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: f.color, textDecoration: 'none' }}>Join →</Link>
                    </div>
                  ))}
                </div>

                {/* Quick actions */}
                <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', padding: '1.5rem', background: 'var(--deep)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>Make history</div>
                  {[
                    { label: 'Solve a mystery', href: '/the-void', color: '#7F77DD', desc: 'First solver earns a monument' },
                    { label: 'Make a discovery', href: '/the-deep', color: '#378ADD', desc: 'Ripples earn legacy points' },
                    { label: 'Win a debate', href: '/arena', color: '#D85A30', desc: 'High-voted arguments are immortalized' },
                  ].map(a => (
                    <Link key={a.label} href={a.href} style={{ display: 'block', padding: '0.85rem 0', borderBottom: '0.5px solid var(--border)', textDecoration: 'none' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: a.color, marginBottom: '0.15rem' }}>{a.label} →</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)' }}>{a.desc}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
