'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import SectionLabel from '@/components/ui/SectionLabel'
import Link from 'next/link'

const REP_COLORS: Record<string, string> = {
  wisdom: '#a89bff', creativity: '#d4b896', discovery: '#1D9E75',
  trust: '#378ADD', debate: '#D85A30', legacy: '#888780',
}

const AVATARS = ['⚗️','🌀','🔭','⚔️','🌿','🔥','🌑','🪞','🏛️','🌊','🦉','🧬']

export default function ProfilePage() {
  const { user, refresh } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState('')
  const [avatarEmoji, setAvatarEmoji] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(d => {
        setData(d)
        setBio(d.user?.bio || '')
        setAvatarEmoji(d.user?.avatarEmoji || '⚗️')
        setLoading(false)
      })
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio, avatarEmoji }),
    })
    await refresh()
    setEditing(false)
    setSaving(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Loading your identity...</div>
    </div>
  )

  const u = data?.user
  const rep = u?.reputation
  const rooms = u?.roomMembers || []
  const factions = u?.factionMembers || []
  const signals = data?.signals || []

  return (
    <>
      <style>{`
        .profile-header { display: flex; gap: 2rem; align-items: flex-start; margin-bottom: 2.5rem; flex-wrap: wrap; }
        .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .rep-badge { min-width: 180px; }
        @media (max-width: 768px) {
          .profile-header { gap: 1.25rem; }
          .profile-grid { grid-template-columns: 1fr !important; }
          .rep-badge { width: 100%; min-width: unset; }
          .profile-pad { padding: 6rem 1.25rem 3rem !important; }
        }
      `}</style>

      <div className="profile-pad" style={{ padding: '7rem 2rem 4rem' }}>
        <div className="profile-header">

          {/* Avatar */}
          <div style={{ flexShrink: 0, textAlign: 'center' }}>
            {editing ? (
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxWidth: 160, marginBottom: '0.5rem' }}>
                  {AVATARS.map(a => (
                    <button key={a} onClick={() => setAvatarEmoji(a)} style={{ width: 36, height: 36, borderRadius: '50%', border: `1.5px solid ${avatarEmoji === a ? 'var(--aether)' : 'var(--border)'}`, background: avatarEmoji === a ? 'var(--aether-dim)' : 'var(--deep)', fontSize: '1.1rem', cursor: 'none' }}>{a}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ width: 100, height: 100, borderRadius: '50%', border: '0.5px solid var(--border-bright)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', marginBottom: '0.6rem', position: 'relative' }}>
                {u?.avatarEmoji}
                <div style={{ position: 'absolute', bottom: 4, right: 4, width: 14, height: 14, borderRadius: '50%', background: 'var(--aether)', border: '2px solid var(--void)', boxShadow: '0 0 8px var(--aether)' }} />
              </div>
            )}
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--aether)' }}>
              {u?.presence?.state || 'open'}
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <SectionLabel>Your identity</SectionLabel>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,6vw,3.5rem)', fontWeight: 300, lineHeight: 1, marginBottom: '0.4rem' }}>
              {u?.username}
            </h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {u?.email} · Joined {new Date(u?.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>

            {editing ? (
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Your bio — what brings you to the galaxy?" rows={3} style={{ width: '100%', background: 'var(--deep)', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text)', resize: 'vertical', marginBottom: '1rem' }} />
            ) : (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1rem' }}>
                {u?.bio || <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>No bio yet — add one to tell the galaxy who you are</span>}
              </p>
            )}

            {/* Personas */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {u?.personas?.map((p: any) => (
                <span key={p.id} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', padding: '0.3rem 0.8rem', borderRadius: '2px', border: `0.5px solid ${p.isActive ? 'var(--aether)' : 'var(--border)'}`, color: p.isActive ? 'var(--aether)' : 'var(--text-dim)' }}>{p.name}</span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {editing ? (
                <>
                  <button onClick={saveProfile} disabled={saving} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 1.25rem', background: 'var(--aether)', color: 'var(--void)', border: 'none', borderRadius: '2px', cursor: 'none' }}>{saving ? 'Saving...' : 'Save'}</button>
                  <button onClick={() => setEditing(false)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 1.25rem', background: 'transparent', color: 'var(--text-dim)', border: '0.5px solid var(--border)', borderRadius: '2px', cursor: 'none' }}>Cancel</button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 1.25rem', background: 'transparent', color: 'var(--text-muted)', border: '0.5px solid var(--border)', borderRadius: '2px', cursor: 'none' }}>Edit profile</button>
              )}
            </div>
          </div>

          {/* Portable rep badge */}
          <div className="rep-badge" style={{ border: '0.5px solid var(--border-bright)', borderRadius: '2px', padding: '1.25rem', background: 'var(--deep)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.6rem' }}>Portable reputation</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 300, color: 'var(--aether)', lineHeight: 1, marginBottom: '0.25rem' }}>
              {rep ? Object.values(rep).filter(v => typeof v === 'number').reduce((a: number, b: any) => a + b, 0) : 0}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Total rep score</div>
            <div style={{ padding: '0.4rem 0.7rem', border: '0.5px solid var(--border)', borderRadius: '2px', fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)' }}>Exportable to any protocol</div>
          </div>
        </div>

        <div className="profile-grid">

          {/* Reputation */}
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', padding: '1.5rem', background: 'var(--deep)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>Reputation</div>
            {rep ? Object.entries(REP_COLORS).map(([key, color]) => (
              <div key={key} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{key}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color, fontWeight: 500 }}>{(rep as any)[key] || 0}</span>
                </div>
                <div style={{ height: 2, background: 'var(--border)', borderRadius: 1 }}>
                  <div style={{ height: '100%', width: `${Math.min((rep as any)[key] || 0, 100)}%`, background: color, borderRadius: 1, opacity: 0.8 }} />
                </div>
              </div>
            )) : (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>Start participating to build your reputation.</p>
            )}
          </div>

          {/* Timeline from real signals */}
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', padding: '1.5rem', background: 'var(--deep)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>Your signals</div>
            {signals.length === 0 ? (
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>No signals yet. Drop your first one in a world.</p>
                <Link href="/commons" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--aether)', border: '0.5px solid var(--aether)33', padding: '0.5rem 1rem', borderRadius: '2px' }}>Go to The Commons →</Link>
              </div>
            ) : signals.map((s: any) => (
              <div key={s.id} style={{ padding: '0.75rem 0', borderBottom: '0.5px solid var(--border)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.25rem', lineHeight: 1.4 }}>{s.content}</div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--aether)', opacity: 0.7 }}>{s.worldId}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-dim)' }}>{new Date(s.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Memory rooms */}
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', padding: '1.5rem', background: 'var(--deep)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Memory rooms</div>
              <Link href="/commons" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--aether)', textDecoration: 'none' }}>+ Create</Link>
            </div>
            {rooms.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>You haven't joined any memory rooms yet.</p>
            ) : rooms.map((rm: any) => (
              <div key={rm.id} style={{ padding: '0.8rem 0', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', border: `0.5px solid ${rm.room.color}55`, background: `${rm.room.color}11`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>🏛️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)' }}>{rm.room.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)' }}>{rm.room._count.members} members</div>
                </div>
              </div>
            ))}
          </div>

          {/* Factions */}
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', padding: '1.5rem', background: 'var(--deep)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Factions</div>
              <Link href="/factions" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--aether)', textDecoration: 'none' }}>Browse</Link>
            </div>
            {factions.length === 0 ? (
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>You haven't joined a faction yet.</p>
                <Link href="/factions" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: '#D85A30', border: '0.5px solid #D85A3033', padding: '0.5rem 1rem', borderRadius: '2px' }}>Browse factions →</Link>
              </div>
            ) : factions.map((fm: any) => (
              <div key={fm.id} style={{ padding: '0.8rem 0', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: fm.faction.color, flexShrink: 0, boxShadow: `0 0 6px ${fm.faction.color}` }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)' }}>{fm.faction.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>{fm.role}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}
