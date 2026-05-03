'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import SectionLabel from '@/components/ui/SectionLabel'

const AVATARS = ['⚗️','🌀','🔭','⚔️','🌿','🔥','🌑','🪞','🏛️','🌊','🦉','🧬','🌙','⚡','🎭','🧿','🔮','🌌']

export default function SettingsPage() {
  const { user, refresh, signOut } = useAuth()
  const router = useRouter()
  const [tab, setTab]                       = useState<'profile'|'security'|'danger'>('profile')

  // Profile
  const [username, setUsername]             = useState('')
  const [bio, setBio]                       = useState('')
  const [avatarEmoji, setAvatarEmoji]       = useState('')
  const [savingProfile, setSavingProfile]   = useState(false)
  const [profileMsg, setProfileMsg]         = useState('')

  // Password
  const [currentPw, setCurrentPw]           = useState('')
  const [newPw, setNewPw]                   = useState('')
  const [confirmPw, setConfirmPw]           = useState('')
  const [savingPw, setSavingPw]             = useState(false)
  const [pwMsg, setPwMsg]                   = useState('')
  const [pwError, setPwError]               = useState('')

  // Delete
  const [deleteConfirm, setDeleteConfirm]   = useState('')
  const [deletePw, setDeletePw]             = useState('')
  const [deleting, setDeleting]             = useState(false)
  const [deleteError, setDeleteError]       = useState('')

  // Stats
  const [stats, setStats]                   = useState<any>(null)

  useEffect(() => {
    if (!user) return
    setUsername(user.username || '')
    setAvatarEmoji(user.avatarEmoji || '⚗️')
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.user) { setBio(d.user.bio || ''); setStats(d.user._count) }
    })
  }, [user])

  const saveProfile = async () => {
    setSavingProfile(true); setProfileMsg('')
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_profile', username, bio, avatarEmoji }),
    })
    const data = await res.json()
    if (!res.ok) { setProfileMsg(data.error); setSavingProfile(false); return }
    // Also update profile API so session reflects new data immediately
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, bio, avatarEmoji }),
    })
    await refresh()
    setProfileMsg('Saved ✓')
    setSavingProfile(false)
    setTimeout(() => setProfileMsg(''), 3000)
  }

  const changePassword = async () => {
    setPwError(''); setPwMsg('')
    if (newPw !== confirmPw) { setPwError('New passwords do not match'); return }
    if (newPw.length < 8)    { setPwError('Password must be at least 8 characters'); return }
    setSavingPw(true)
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'change_password', currentPassword: currentPw, newPassword: newPw }),
    })
    const data = await res.json()
    if (!res.ok) { setPwError(data.error); setSavingPw(false); return }
    setPwMsg('Password changed ✓')
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
    setSavingPw(false)
    setTimeout(() => setPwMsg(''), 3000)
  }

  const deleteAccount = async () => {
    if (deleteConfirm !== 'DELETE MY ACCOUNT') { setDeleteError('Type DELETE MY ACCOUNT exactly'); return }
    setDeleting(true); setDeleteError('')
    const res = await fetch('/api/settings', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmation: deleteConfirm, password: deletePw }),
    })
    const data = await res.json()
    if (!res.ok) { setDeleteError(data.error); setDeleting(false); return }
    await signOut()
    router.push('/')
  }

  const INPUT = { background: 'transparent', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text)', width: '100%' } as React.CSSProperties

  return (
    <>
      <style>{`
        .settings-pad { padding: 7rem 2rem 4rem; max-width: 640px; margin: 0 auto; }
        @media (max-width: 640px) { .settings-pad { padding: 6rem 1.25rem 3rem !important; } }
      `}</style>

      <div className="settings-pad">
        <SectionLabel>Account</SectionLabel>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 300, marginBottom: '0.5rem' }}>Settings</h1>

        {/* Stats bar */}
        {stats && (
          <div style={{ display: 'flex', gap: '1.5rem', padding: '1rem', border: '0.5px solid var(--border)', borderRadius: '2px', background: 'var(--deep)', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Signals',     val: stats.signals },
              { label: 'Discoveries', val: stats.discoveries },
              { label: 'Followers',   val: stats.followers },
              { label: 'Following',   val: stats.following },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 300, color: 'var(--aether)', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          {(['profile', 'security', 'danger'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'capitalize', padding: '0.5rem 1.25rem', borderRadius: '2px', cursor: 'none', background: tab === t ? (t === 'danger' ? 'rgba(216,90,48,0.12)' : 'var(--aether-dim)') : 'transparent', border: `0.5px solid ${tab === t ? (t === 'danger' ? '#D85A30' : 'var(--aether)') : 'var(--border)'}`, color: tab === t ? (t === 'danger' ? '#D85A30' : 'var(--aether)') : 'var(--text-dim)', transition: 'all 0.15s' }}>{t}</button>
          ))}
        </div>

        {/* Profile tab */}
        {tab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Avatar picker */}
            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Avatar</label>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {AVATARS.map(a => (
                  <button key={a} onClick={() => setAvatarEmoji(a)} style={{ width: 40, height: 40, borderRadius: '50%', border: `1.5px solid ${avatarEmoji === a ? 'var(--aether)' : 'var(--border)'}`, background: avatarEmoji === a ? 'var(--aether-dim)' : 'var(--deep)', fontSize: '1.2rem', cursor: 'none', transition: 'all 0.15s', boxShadow: avatarEmoji === a ? '0 0 8px rgba(168,155,255,0.4)' : 'none' }}>{a}</button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)} style={INPUT} />
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell the galaxy who you are..." style={{ ...INPUT, resize: 'vertical', lineHeight: 1.7 }} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button onClick={saveProfile} disabled={savingProfile} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.75rem 2rem', background: 'var(--aether)', color: 'var(--void)', border: 'none', borderRadius: '2px', cursor: 'none' }}>
                {savingProfile ? 'Saving...' : 'Save profile →'}
              </button>
              {profileMsg && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: profileMsg.includes('✓') ? '#1D9E75' : '#D85A30' }}>{profileMsg}</span>}
            </div>
          </div>
        )}

        {/* Security tab */}
        {tab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', padding: '1.5rem', background: 'var(--deep)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>Change password</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>Current password</label>
                  <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} style={INPUT} />
                </div>
                <div>
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>New password</label>
                  <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} style={INPUT} />
                </div>
                <div>
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>Confirm new password</label>
                  <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} style={INPUT} />
                </div>
                {pwError && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#D85A30' }}>{pwError}</p>}
                {pwMsg   && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#1D9E75' }}>{pwMsg}</p>}
                <button onClick={changePassword} disabled={savingPw || !currentPw || !newPw || !confirmPw} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.75rem 1.75rem', background: currentPw && newPw ? 'var(--aether)' : 'var(--aether-dim)', color: currentPw && newPw ? 'var(--void)' : 'var(--aether)', border: 'none', borderRadius: '2px', cursor: 'none', width: 'fit-content' }}>
                  {savingPw ? 'Changing...' : 'Change password →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Danger tab */}
        {tab === 'danger' && (
          <div style={{ border: '0.5px solid rgba(216,90,48,0.3)', borderRadius: '2px', padding: '1.5rem', background: 'rgba(216,90,48,0.04)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#D85A30', marginBottom: '1rem' }}>Delete account</div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.9, marginBottom: '1.25rem' }}>
              This permanently deletes your account, all signals, discoveries, messages, and reputation. There is no undo.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>Type DELETE MY ACCOUNT</label>
                <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} style={{ ...INPUT, borderColor: 'rgba(216,90,48,0.3)' }} />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>Your password</label>
                <input type="password" value={deletePw} onChange={e => setDeletePw(e.target.value)} style={{ ...INPUT, borderColor: 'rgba(216,90,48,0.3)' }} />
              </div>
              {deleteError && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#D85A30' }}>{deleteError}</p>}
              <button onClick={deleteAccount} disabled={deleting || deleteConfirm !== 'DELETE MY ACCOUNT' || !deletePw} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.75rem 1.75rem', background: deleteConfirm === 'DELETE MY ACCOUNT' && deletePw ? '#D85A30' : 'rgba(216,90,48,0.2)', color: 'white', border: 'none', borderRadius: '2px', cursor: 'none', width: 'fit-content' }}>
                {deleting ? 'Deleting...' : 'Delete account permanently'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
