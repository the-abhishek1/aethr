'use client'
import { useState, useEffect, useCallback } from 'react'
import SectionLabel from '@/components/ui/SectionLabel'
import { useAuth } from '@/context/AuthContext'

const REP_DIMS = [
  { key: 'wisdom',     color: '#a89bff', icon: '🧠' },
  { key: 'creativity', color: '#d4b896', icon: '🎨' },
  { key: 'discovery',  color: '#1D9E75', icon: '🔭' },
  { key: 'trust',      color: '#378ADD', icon: '🤝' },
  { key: 'debate',     color: '#D85A30', icon: '⚔️' },
  { key: 'legacy',     color: '#888780', icon: '📜' },
]

export default function MarketPage() {
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'leaderboard' | 'trade' | 'activity'>('leaderboard')
  const [form, setForm] = useState({ toUsername: '', dimension: 'wisdom', amount: 1, reason: '' })
  const [trading, setTrading] = useState(false)
  const [tradeMsg, setTradeMsg] = useState('')
  const [tradeError, setTradeError] = useState('')

  const load = useCallback(async () => {
    const res = await fetch('/api/market')
    const data = await res.json()
    setData(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const trade = async () => {
    if (!form.toUsername || !form.reason) return
    setTrading(true); setTradeMsg(''); setTradeError('')

    // Find user by username
    const search = await fetch(`/api/search?q=${encodeURIComponent(form.toUsername)}&type=users`)
    const sData = await search.json()
    const target = sData.results?.users?.[0]

    if (!target || target.username.toLowerCase() !== form.toUsername.toLowerCase()) {
      setTradeError('User not found'); setTrading(false); return
    }

    const res = await fetch('/api/market', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toUserId: target.id, ...form }),
    })
    const result = await res.json()

    if (!res.ok) { setTradeError(result.error); setTrading(false); return }

    setTradeMsg(`✦ Traded ${form.amount} ${form.dimension} rep to @${form.toUsername}`)
    setForm(f => ({ ...f, toUsername: '', reason: '' }))
    load()
    setTrading(false)
  }

  return (
    <>
      <style>{`
        .market-pad { padding: 7rem 2rem 4rem; }
        @media (max-width: 640px) { .market-pad { padding: 6rem 1.25rem 3rem !important; } }
      `}</style>

      <div className="market-pad">
        <SectionLabel>World III</SectionLabel>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem,6vw,5rem)', fontWeight: 300, lineHeight: 0.95, marginBottom: '0.75rem' }}>💱 The Market</h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: 480, marginBottom: '3rem' }}>
          Reputation as currency. Trade rep dimensions with others. Your trust score has real value here.
        </p>

        {/* My rep bar */}
        {data?.myRep && (
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', padding: '1.25rem', background: 'var(--deep)', marginBottom: '2.5rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1rem' }}>Your reputation balance</div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {REP_DIMS.map(d => (
                <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.85rem', border: `0.5px solid ${d.color}44`, borderRadius: '2px', background: `${d.color}0a` }}>
                  <span style={{ fontSize: '0.85rem' }}>{d.icon}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: d.color }}>{data.myRep[d.key] || 0}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>{d.key}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem' }}>
          {(['leaderboard', 'trade', 'activity'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'capitalize', padding: '0.5rem 1.25rem', borderRadius: '2px', cursor: 'none', background: tab === t ? 'rgba(99,153,34,0.12)' : 'transparent', border: `0.5px solid ${tab === t ? '#639922' : 'var(--border)'}`, color: tab === t ? '#639922' : 'var(--text-dim)', transition: 'all 0.15s' }}>{t}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', textAlign: 'center', padding: '4rem' }}>Reading the market...</div>
        ) : (
          <>
            {/* Leaderboard */}
            {tab === 'leaderboard' && (
              <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr repeat(6, 60px) 70px', gap: '0.5rem', padding: '0.75rem 1.25rem', borderBottom: '0.5px solid var(--border)', background: 'var(--deep)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>#</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Traveller</div>
                  {REP_DIMS.map(d => (
                    <div key={d.key} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: d.color, textAlign: 'center' }}>{d.icon}</div>
                  ))}
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--aether)', textAlign: 'right', textTransform: 'uppercase' }}>Total</div>
                </div>

                {data?.leaderboard?.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>No reputation recorded yet.</div>
                ) : data?.leaderboard?.map((r: any, i: number) => {
                  const total = REP_DIMS.reduce((sum, d) => sum + (r[d.key] || 0), 0)
                  return (
                    <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr repeat(6, 60px) 70px', gap: '0.5rem', padding: '0.9rem 1.25rem', borderBottom: '0.5px solid var(--border)', background: i % 2 === 0 ? 'var(--void)' : 'transparent', alignItems: 'center', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--deep)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? 'var(--void)' : 'transparent'}
                    >
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: i < 3 ? '1.1rem' : '0.95rem', color: i === 0 ? 'var(--gold)' : i === 1 ? 'var(--text-muted)' : 'var(--text-dim)' }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--surface)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>{r.user?.avatarEmoji}</div>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)' }}>@{r.user?.username}</span>
                      </div>
                      {REP_DIMS.map(d => (
                        <div key={d.key} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: r[d.key] > 0 ? d.color : 'var(--text-dim)', textAlign: 'center' }}>{r[d.key] || 0}</div>
                      ))}
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--aether)', textAlign: 'right' }}>{total}</div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Trade */}
            {tab === 'trade' && user && (
              <div style={{ maxWidth: 520 }}>
                <div style={{ border: '0.5px solid var(--border-bright)', borderRadius: '2px', padding: '1.5rem', background: 'var(--deep)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1.5rem' }}>Trade reputation</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>To (username)</label>
                      <input value={form.toUsername} onChange={e => setForm(f => ({ ...f, toUsername: e.target.value }))} placeholder="@username" style={{ width: '100%', background: 'transparent', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.7rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text)' }} />
                    </div>

                    <div>
                      <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>Dimension</label>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {REP_DIMS.map(d => (
                          <button key={d.key} onClick={() => setForm(f => ({ ...f, dimension: d.key }))} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', padding: '0.35rem 0.85rem', borderRadius: '2px', border: `0.5px solid ${form.dimension === d.key ? d.color : 'var(--border)'}`, background: form.dimension === d.key ? `${d.color}18` : 'transparent', color: form.dimension === d.key ? d.color : 'var(--text-dim)', cursor: 'none', transition: 'all 0.15s' }}>
                            {d.icon} {d.key}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>Amount (1–10)</label>
                      <input type="number" min={1} max={10} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: parseInt(e.target.value) || 1 }))} style={{ width: '100%', background: 'transparent', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.7rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text)' }} />
                    </div>

                    <div>
                      <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>Reason</label>
                      <input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Why are you trading this rep?" style={{ width: '100%', background: 'transparent', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.7rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text)' }} />
                    </div>

                    {tradeError && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#D85A30' }}>{tradeError}</p>}
                    {tradeMsg && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#1D9E75' }}>{tradeMsg}</p>}

                    <button onClick={trade} disabled={trading || !form.toUsername || !form.reason} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.8rem', background: form.toUsername && form.reason ? '#639922' : 'rgba(99,153,34,0.2)', color: form.toUsername && form.reason ? 'white' : '#639922', border: 'none', borderRadius: '2px', cursor: 'none', transition: 'all 0.15s' }}>
                      {trading ? 'Trading...' : `Trade ${form.amount} ${form.dimension} →`}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Activity */}
            {tab === 'activity' && (
              <div>
                {data?.trades?.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', border: '0.5px solid var(--border)', borderRadius: '2px' }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>No trades yet. Be the first to trade rep.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)' }}>
                    {data.trades.map((t: any) => {
                      const dim = REP_DIMS.find(d => d.key === t.dimension)
                      return (
                        <div key={t.id} style={{ padding: '1rem 1.25rem', background: 'var(--void)', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', transition: 'background 0.15s' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--deep)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--void)'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '0.9rem' }}>{t.fromUser?.avatarEmoji}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>@{t.fromUser?.username}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: dim?.color }}>+{t.amount} {t.dimension} {dim?.icon}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)' }}>→</span>
                            <span style={{ fontSize: '0.9rem' }}>{t.toUser?.avatarEmoji}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--aether)' }}>@{t.toUser?.username}</span>
                          </div>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--text-muted)', flex: 1 }}>"{t.reason}"</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)' }}>{new Date(t.createdAt).toLocaleDateString()}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
