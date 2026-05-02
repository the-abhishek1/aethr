'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const params = useSearchParams()
  const { refresh } = useAuth()
  const from = params.get('from') || '/dashboard'

  const handleSubmit = async () => {
    if (!email || !password) { setError('Both fields required'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/signin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      await refresh()
      router.push(from)
    } catch { setError('Something went wrong.') }
    finally { setLoading(false) }
  }

  return (
    <>
      <style>{`.auth-input{width:100%;background:transparent;border:0.5px solid var(--border-bright);border-radius:2px;outline:none;padding:0.85rem 1rem;font-family:var(--font-mono);font-size:0.75rem;color:var(--text);letter-spacing:0.04em;transition:border-color 0.2s}.auth-input:focus{border-color:var(--aether)}.auth-input::placeholder{color:var(--text-dim)}`}</style>
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem 1.25rem' }}>
        <div style={{ width:'100%', maxWidth:420, animation:'fadeUp 0.6s ease', position:'relative', zIndex:1 }}>
          <div style={{ position:'fixed', top:'40%', left:'50%', transform:'translate(-50%,-50%)', width:400, height:400, borderRadius:'50%', background:'radial-gradient(ellipse, rgba(90,70,200,0.1) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />
          <Link href="/" style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--text)', textDecoration:'none', display:'block', marginBottom:'3rem', textAlign:'center' }}><span style={{color:'var(--aether)'}}>Æ</span>thr</Link>
          <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', letterSpacing:'0.25em', textTransform:'uppercase', color:'var(--aether)', marginBottom:'1rem', textAlign:'center' }}>Return to the galaxy</p>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,6vw,3rem)', fontWeight:300, lineHeight:1.1, textAlign:'center', marginBottom:'2.5rem' }}>Enter<br /><em style={{color:'var(--aether)'}}>the Æther.</em></h1>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', marginBottom:'1.5rem' }}>
            <input className="auth-input" type="email" placeholder="your@signal.here" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()} />
            <input className="auth-input" type="password" placeholder="Your passphrase" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()} />
          </div>
          {error && <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'#D85A30', marginBottom:'1rem', padding:'0.6rem 1rem', border:'0.5px solid #D85A3044', borderRadius:'2px' }}>{error}</div>}
          <button onClick={handleSubmit} disabled={loading} style={{ width:'100%', fontFamily:'var(--font-mono)', fontSize:'0.72rem', letterSpacing:'0.15em', textTransform:'uppercase', padding:'0.95rem', background:loading?'var(--aether-dim)':'var(--aether)', color:loading?'var(--aether)':'var(--void)', border:loading?'0.5px solid var(--aether)':'none', borderRadius:'2px', cursor:'none', transition:'all 0.2s' }}>{loading?'Entering...':'Enter Aethr →'}</button>
          <div style={{ textAlign:'center', marginTop:'1.5rem' }}>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'var(--text-dim)' }}>New to Aethr? </span>
            <Link href="/signup" style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'var(--aether)', textDecoration:'none' }}>Leave your signal →</Link>
          </div>
        </div>
      </div>
    </>
  )
}
