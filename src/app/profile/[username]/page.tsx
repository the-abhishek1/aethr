'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import SectionLabel from '@/components/ui/SectionLabel'
import SignalCard from '@/components/ui/SignalCard'
import { ProfileSkeleton, SignalSkeleton } from '@/components/ui/Skeleton'
import Link from 'next/link'

const REP_COLORS: Record<string, string> = {
  wisdom: '#a89bff', creativity: '#d4b896', discovery: '#1D9E75',
  trust: '#378ADD', debate: '#D85A30', legacy: '#888780',
}

export default function PublicProfilePage() {
  const params   = useParams()
  const username = params.username as string
  const { user: me, loading: authLoading } = useAuth()
  const router = useRouter()

  const [profile, setProfile]         = useState<any>(null)
  const [signals, setSignals]         = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [notFound, setNotFound]       = useState(false)
  const [messaging, setMessaging]     = useState(false)
  const [followData, setFollowData]   = useState<any>(null)
  const [following, setFollowing]     = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  // Track whether we've already redirected to avoid loops
  const redirected = useRef(false)

  const loadProfile = useCallback(async () => {
    const res = await fetch(
      `/api/profile?username=${encodeURIComponent(username)}`,
      { method: 'PUT' }
    )
    if (!res.ok) { setNotFound(true); setLoading(false); return }
    const data = await res.json()
    return data.user
  }, [username])

  // Step 1 — load the profile (auth-independent)
  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    setProfile(null)
    redirected.current = false

    loadProfile().then(found => {
      if (!found) return
      setProfile(found)
      // Load follow data + signals
      Promise.all([
        fetch(`/api/follow?userId=${found.id}`)
          .then(r => r.json())
          .then(d => { setFollowData(d); setFollowing(d.isFollowing) })
          .catch(() => {}),
        fetch(`/api/signals?authorId=${found.id}&limit=20`)
          .then(r => r.json())
          .then(d => setSignals(d.signals || []))
          .catch(() => {}),
      ]).finally(() => setLoading(false))
    })
  }, [loadProfile])

  // Step 2 — once BOTH auth and profile are loaded, check if it's ourselves
  useEffect(() => {
    if (authLoading)         return  // wait for auth
    if (!profile)            return  // wait for profile
    if (redirected.current)  return  // already redirected
    if (!me)                 return  // logged out — show public profile

    if (me.id === profile.id) {
      redirected.current = true
      router.replace('/profile')
    }
  }, [authLoading, me, profile, router])

  const toggleFollow = async () => {
    if (!me) { router.push('/signin'); return }
    setFollowLoading(true)
    const res = await fetch('/api/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: profile.id }),
    })
    const data = await res.json()
    setFollowing(data.following)
    setFollowData((prev: any) => prev ? {
      ...prev,
      followerCount: data.following ? prev.followerCount + 1 : Math.max(0, prev.followerCount - 1),
      isFollowing: data.following,
    } : null)
    setFollowLoading(false)
  }

  const startMessage = () => {
    if (!me) { router.push('/signin'); return }
    setMessaging(true)
    router.push(`/messages?username=${profile.username}`)
  }

  if (loading) return (
    <div style={{ padding: '7rem 2rem 4rem', maxWidth: 760, margin: '0 auto' }}>
      <ProfileSkeleton />
      <div style={{ marginTop: '2rem' }}>
        {[1,2,3].map(i => <SignalSkeleton key={i} />)}
      </div>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <div style={{ fontSize: '3rem' }}>🌑</div>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'var(--text-muted)' }}>@{username} not found.</p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>This traveller doesn't exist in the galaxy.</p>
      <Link href="/search" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--aether)', border: '0.5px solid rgba(168,155,255,0.3)', padding: '0.6rem 1.25rem', borderRadius: '2px' }}>Search travellers →</Link>
    </div>
  )

  if (!profile) return null

  const rep      = profile?.reputation
  const totalRep = rep ? Object.entries(REP_COLORS).reduce((s, [k]) => s + (rep[k] || 0), 0) : 0

  return (
    <>
      <style>{`
        .pub-profile-pad  { padding: 7rem 2rem 4rem; max-width: 800px; margin: 0 auto; }
        .pub-profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 2rem; }
        @media (max-width: 768px) {
          .pub-profile-pad  { padding: 6rem 1.25rem 3rem !important; }
          .pub-profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="pub-profile-pad">
        {/* Header */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--surface)', border: '0.5px solid var(--border-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', flexShrink: 0 }}>
            {profile.avatarEmoji}
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <SectionLabel>Traveller</SectionLabel>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 300, lineHeight: 1, marginBottom: '0.4rem' }}>@{profile.username}</h1>
            {profile.bio && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '0.75rem' }}>{profile.bio}</p>}

            {followData && (
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>{followData.followerCount}</span> followers
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>{followData.followingCount}</span> following
                </span>
              </div>
            )}

            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>
              Joined {new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>

            {/* Actions — only shown when we know it's not our own profile */}
            {me && me.id !== profile.id && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={startMessage} disabled={messaging} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 1.25rem', background: 'var(--aether-dim)', border: '0.5px solid rgba(168,155,255,0.4)', color: 'var(--aether)', borderRadius: '2px', cursor: 'none' }}>
                  {messaging ? '...' : '✉ Message'}
                </button>
                <button onClick={toggleFollow} disabled={followLoading} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 1.25rem', background: following ? 'rgba(168,155,255,0.1)' : 'transparent', border: `0.5px solid ${following ? 'var(--aether)' : 'var(--border)'}`, color: following ? 'var(--aether)' : 'var(--text-dim)', borderRadius: '2px', cursor: 'none' }}>
                  {followLoading ? '...' : following ? '✓ Following' : '+ Follow'}
                </button>
                <Link href="/market" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 1.25rem', background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--text-dim)', borderRadius: '2px', textDecoration: 'none' }}>
                  💱 Trade rep
                </Link>
              </div>
            )}
          </div>

          {/* Rep badge */}
          <div style={{ border: '0.5px solid var(--border-bright)', borderRadius: '2px', padding: '1.1rem', background: 'var(--deep)', flexShrink: 0, minWidth: 140 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Reputation</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 300, color: 'var(--aether)', lineHeight: 1, marginBottom: '0.5rem' }}>{totalRep}</div>
            {rep && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {Object.entries(REP_COLORS).map(([key, color]) => (rep[key] || 0) > 0 && (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>{key}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color }}>{rep[key]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Signals */}
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1rem' }}>
            Signals from @{profile.username}
          </div>
          {signals.length === 0 ? (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', padding: '1.5rem 0' }}>No signals yet.</p>
          ) : signals.map(s => <SignalCard key={s.id} signal={s} />)}
        </div>
      </div>
    </>
  )
}
