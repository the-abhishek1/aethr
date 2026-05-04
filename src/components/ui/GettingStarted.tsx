'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

interface Task {
  id: string
  label: string
  desc: string
  href: string
  cta: string
  done: boolean
}

export default function GettingStarted() {
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    // Check if user dismissed
    const key = `aethr_gs_dismissed_${user.id}`
    if (localStorage.getItem(key)) { setDismissed(true); setLoading(false); return }

    // Check what the user has done
    Promise.all([
      fetch('/api/profile').then(r => r.json()),
    ]).then(([profData]) => {
      const u = profData.user
      const hasSignal    = (u?._count?.signals   || 0) > 0
      const hasBio       = !!u?.bio
      const hasFaction   = (u?.factionMembers?.length || 0) > 0
      const hasDiscovery = (u?._count?.discoveries || 0) > 0

      setTasks([
        { id: 'signal',    label: 'Drop your first signal',    desc: 'Share something in The Commons', href: '/commons',   cta: 'Go to Commons →',   done: hasSignal },
        { id: 'bio',       label: 'Write your bio',            desc: 'Tell the galaxy who you are',   href: '/profile',   cta: 'Edit profile →',    done: hasBio },
        { id: 'faction',   label: 'Join a faction',            desc: 'Find your community',           href: '/factions',  cta: 'Browse factions →', done: hasFaction },
        { id: 'discovery', label: 'Make a discovery',          desc: 'Drop knowledge in The Deep',    href: '/the-deep',  cta: 'Go to The Deep →',  done: hasDiscovery },
      ])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user])

  const dismiss = () => {
    if (user) localStorage.setItem(`aethr_gs_dismissed_${user.id}`, '1')
    setDismissed(true)
  }

  if (!user || dismissed || loading) return null

  const doneCount = tasks.filter(t => t.done).length
  const allDone = doneCount === tasks.length

  if (allDone) return null

  const progress = (doneCount / tasks.length) * 100

  return (
    <div style={{ border: '0.5px solid rgba(168,155,255,0.25)', borderRadius: '4px', padding: '1.25rem', background: 'rgba(168,155,255,0.04)', marginBottom: '2rem', position: 'relative', animation: 'fadeUp 0.5s ease' }}>
      {/* Dismiss */}
      <button onClick={dismiss} style={{ position: 'absolute', top: '1rem', right: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'none' }}>× dismiss</button>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text)', marginBottom: '0.25rem' }}>
          Get started in Aethr
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)' }}>
          {doneCount} of {tasks.length} complete
        </div>
        <div style={{ height: 2, background: 'var(--border)', borderRadius: 1, marginTop: '0.6rem' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--aether)', borderRadius: 1, transition: 'width 0.5s ease' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.5rem' }}>
        {tasks.map(t => (
          <div key={t.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem', border: `0.5px solid ${t.done ? 'rgba(29,158,117,0.3)' : 'var(--border)'}`, borderRadius: '2px', background: t.done ? 'rgba(29,158,117,0.05)' : 'transparent' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${t.done ? '#1D9E75' : 'var(--border-bright)'}`, background: t.done ? '#1D9E75' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, transition: 'all 0.3s' }}>
              {t.done && <span style={{ color: 'white', fontSize: '0.6rem', fontWeight: 700 }}>✓</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: t.done ? 'var(--text-muted)' : 'var(--text)', textDecoration: t.done ? 'line-through' : 'none', marginBottom: '0.15rem' }}>{t.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-dim)', marginBottom: t.done ? 0 : '0.4rem' }}>{t.desc}</div>
              {!t.done && (
                <Link href={t.href} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.08em', color: 'var(--aether)', textDecoration: 'none' }}>{t.cta}</Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
