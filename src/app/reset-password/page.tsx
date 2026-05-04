'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

function ResetPasswordForm() {
  const params   = useSearchParams()
  const router   = useRouter()
  const { refresh } = useAuth()
  const token    = params.get('token')

  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState(false)
  const [validating, setValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)

  useEffect(() => {
    if (!token) { setValidating(false); return }
    // Light validation — just check it exists (server validates on submit)
    setTokenValid(true)
    setValidating(false)
  }, [token])

  const submit = async () => {
    if (!password) { setError('Enter a new password'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true); setError('')

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    const data = await res.json()

    if (!res.ok) { setError(data.error || 'Reset failed'); setLoading(false); return }

    setSuccess(true)
    await refresh()
    setTimeout(() => router.push('/dashboard'), 1500)
  }

  if (validating) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text-dim)' }}>Validating link...</div>
  )

  return (
    <>
      <style>{`.auth-input{width:100%;background:transparent;border:0.5px solid var(--border-bright);border-radius:2px;outline:none;padding:0.85rem 1rem;font-family:var(--font-mono);font-size:0.75rem;color:var(--text);letter-spacing:0.04em;transition:border-color 0.2s}.auth-input:focus{border-color:var(--aether)}.auth-input::placeholder{color:var(--text-dim)}`}</style>
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem 1.25rem' }}>
        <div style={{ width:'100%', maxWidth:420, animation:'fadeUp 0.6s ease', position:'relative', zIndex:1 }}>
          <div style={{ position:'fixed', top:'40%', left:'50%', transform:'translate(-50%,-50%)', width:400, height:400, borderRadius:'50%', background:'radial-gradient(ellipse, rgba(90,70,200,0.1) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />

          <Link href="/" style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--text)', textDecoration:'none', display:'block', marginBottom:'3rem', textAlign:'center' }}>
            <span style={{ color:'var(--aether)' }}>Æ</span>thr
          </Link>

          {!token || !tokenValid ? (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🌑</div>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.75rem', fontWeight:300, color:'var(--text)', marginBottom:'0.75rem' }}>Invalid link.</h2>
              <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text-muted)', lineHeight:1.8, marginBottom:'2rem' }}>This reset link is missing or malformed. Request a new one.</p>
              <Link href="/forgot-password" style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', letterSpacing:'0.1em', textTransform:'uppercase', textDecoration:'none', color:'var(--aether)', border:'0.5px solid rgba(168,155,255,0.3)', padding:'0.6rem 1.25rem', borderRadius:'2px' }}>Request new link →</Link>
            </div>
          ) : success ? (
            <div style={{ textAlign:'center', animation:'fadeUp 0.5s ease' }}>
              <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>✓</div>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.75rem', fontWeight:300, color:'#1D9E75', marginBottom:'0.75rem' }}>Password reset.</h2>
              <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text-muted)', lineHeight:1.8 }}>Signing you in...</p>
            </div>
          ) : (
            <>
              <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', letterSpacing:'0.25em', textTransform:'uppercase', color:'var(--aether)', marginBottom:'1rem', textAlign:'center' }}>New passphrase</p>
              <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,6vw,3rem)', fontWeight:300, lineHeight:1.1, textAlign:'center', marginBottom:'2.5rem' }}>Set your<br /><em style={{ color:'var(--gold)' }}>new password.</em></h1>

              <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', marginBottom:'1.5rem' }}>
                <input className="auth-input" type="password" placeholder="New password (8+ characters)" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==='Enter' && submit()} />
                <input className="auth-input" type="password" placeholder="Confirm new password" value={confirm} onChange={e => setConfirm(e.target.value)} onKeyDown={e => e.key==='Enter' && submit()} />
              </div>

              {/* Strength indicator */}
              {password.length > 0 && (
                <div style={{ marginBottom:'1rem' }}>
                  <div style={{ display:'flex', gap:'0.3rem', marginBottom:'0.3rem' }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex:1, height:3, borderRadius:2, background: password.length >= i * 3 ? (i <= 2 ? '#BA7517' : '#1D9E75') : 'var(--border)', transition:'background 0.3s' }} />
                    ))}
                  </div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.56rem', color:'var(--text-dim)' }}>
                    {password.length < 8 ? 'Too short' : password.length < 12 ? 'Moderate' : 'Strong'}
                  </div>
                </div>
              )}

              {error && <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'#D85A30', marginBottom:'1rem', padding:'0.6rem 1rem', border:'0.5px solid #D85A3044', borderRadius:'2px' }}>{error}</div>}

              <button onClick={submit} disabled={loading || !password || !confirm} style={{ width:'100%', fontFamily:'var(--font-mono)', fontSize:'0.72rem', letterSpacing:'0.15em', textTransform:'uppercase', padding:'0.95rem', background:password&&confirm?'var(--aether)':'var(--aether-dim)', color:password&&confirm?'var(--void)':'var(--aether)', border:!password||!confirm?'0.5px solid var(--aether)':'none', borderRadius:'2px', cursor:'none', transition:'all 0.2s' }}>
                {loading ? 'Resetting...' : 'Reset password →'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default function ResetPasswordPage() {
  return <Suspense fallback={null}><ResetPasswordForm /></Suspense>
}
