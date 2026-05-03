'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { WORLDS } from '@/lib/constants'

const FEATURES = [
  { glyph: '📡', title: 'Signals', sub: 'Not posts', desc: 'Share thoughts with mood and world context. Replies thread naturally.' },
  { glyph: '🎬', title: 'Transmissions', sub: 'Not videos', desc: 'Perform live in The Forge. Audiences tip with context — not just money.' },
  { glyph: '⚔️', title: 'Factions', sub: 'Not groups', desc: 'Communities with identity, territory, and reputation. Compete for the galaxy.' },
  { glyph: '🏛️', title: 'Memory Rooms', sub: 'Not chats', desc: 'Spaces where your group\'s history lives permanently. Every milestone preserved.' },
  { glyph: '🔭', title: 'Discoveries', sub: 'Not articles', desc: 'Drop knowledge in The Deep. Watch it ripple across the galaxy.' },
  { glyph: '🌑', title: 'Mysteries', sub: 'Not puzzles', desc: 'Weekly mysteries in The Void. First to solve earns a permanent monument.' },
]

const STEPS = [
  { num: '01', title: 'Create your identity', desc: 'Pick a username and avatar. Choose your first persona — Creator, Explorer, Connector, or Challenger.' },
  { num: '02', title: 'Enter a world', desc: 'Start in The Commons (social) or The Forge (creation). Each world has its own vibe and purpose.' },
  { num: '03', title: 'Drop a signal', desc: 'Your first post. Tag it with a mood. Others can reply, tip, or ripple it across the galaxy.' },
  { num: '04', title: 'Build your reputation', desc: 'Every action earns rep across 6 dimensions — Wisdom, Creativity, Discovery, Trust, Debate, Legacy.' },
]

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const repRef = useRef<HTMLDivElement>(null)
  const [liveStats, setLiveStats] = useState({ users: 0, signals: 0, discoveries: 0 })

  useEffect(() => {
    // Redirect logged-in users to dashboard
    if (!loading && user) { router.replace('/dashboard'); return }
  }, [user, loading, router])

  useEffect(() => {
    // Load live galaxy stats
    fetch('/api/archive').then(r => r.json()).then(d => {
      if (d.lore) setLiveStats({ users: d.lore.userCount, signals: d.lore.signalCount, discoveries: d.lore.discoveryCount })
    }).catch(() => {})

    // Scroll reveal — only animate if JS is running (content always visible without JS)
    const revealEls = document.querySelectorAll('.reveal')
    revealEls.forEach(el => el.classList.add('animate'))
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) } })
    }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' })
    revealEls.forEach(el => obs.observe(el))

    // Rep bars
    const repObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.rep-fill').forEach((b: Element) => {
            const bar = b as HTMLElement; bar.style.width = (bar.dataset.target || '0') + '%'
          }); repObs.unobserve(e.target)
        }
      })
    }, { threshold: 0.3 })
    if (repRef.current) repObs.observe(repRef.current)
    return () => { obs.disconnect(); repObs.disconnect() }
  }, [])

  // Don't blank the page while loading — just redirect when ready
  if (user) return null

  return (
    <>
      <style>{`
        .reveal { opacity: 1; transform: none; }
        .reveal.animate { opacity: 0; transform: translateY(20px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal.animate.visible { opacity: 1; transform: translateY(0); }
        .rep-fill { transition: width 1.5s cubic-bezier(0.16,1,0.3,1); }
        .feature-card:hover { background: var(--deep) !important; }
        .world-card-home:hover { background: var(--deep) !important; border-color: var(--border-bright) !important; }
        .step-card:hover { background: var(--deep) !important; }
        @media (max-width: 1024px) { .identity-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 768px) {
          .hero-actions { flex-direction: column !important; }
          .features-grid { grid-template-columns: 1fr 1fr !important; }
          .steps-grid { grid-template-columns: 1fr 1fr !important; }
          .section-pad { padding: 5rem 1.25rem !important; }
          .cta-grid { grid-template-columns: 1fr !important; }
          .worlds-home-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 480px) {
          .features-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .worlds-home-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '8rem 1.5rem 4rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-58%)', width: 'min(640px,90vw)', height: 'min(640px,90vw)', borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(90,70,200,0.11) 0%, rgba(50,30,140,0.05) 45%, transparent 70%)' }} />

        {/* Live stat pill */}
        {liveStats.users > 0 && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '0.5px solid var(--border-bright)', borderRadius: '99px', padding: '0.35rem 1rem', marginBottom: '2rem', animation: 'fadeUp 0.8s 0.2s both' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D9E75', boxShadow: '0 0 6px #1D9E75', animation: 'pulse-soft 2s infinite' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
              {liveStats.users} traveller{liveStats.users !== 1 ? 's' : ''} · {liveStats.signals} signals · {liveStats.discoveries} discoveries
            </span>
          </div>
        )}

        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.55rem,1.5vw,0.65rem)', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--aether)', marginBottom: '2rem', animation: 'fadeUp 1s 0.3s both' }}>The fifth element, inhabited</p>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(4rem,14vw,11rem)', fontWeight: 300, lineHeight: 0.9, letterSpacing: '-0.02em', marginBottom: '1.5rem', animation: 'fadeUp 1.2s 0.5s both' }}>
          <span style={{ fontStyle: 'italic', color: 'var(--aether)' }}>Æ</span><span>thr</span>
        </h1>

        <p style={{ fontSize: 'clamp(1rem,2.5vw,1.4rem)', fontWeight: 300, fontStyle: 'italic', color: 'var(--gold-dim)', letterSpacing: '0.05em', marginBottom: '1rem', animation: 'fadeUp 1s 0.8s both' }}>Not a platform. A living universe.</p>

        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.65rem,1.5vw,0.75rem)', lineHeight: 1.9, color: 'var(--text-muted)', maxWidth: 440, margin: '0 auto 3rem', animation: 'fadeUp 1s 1s both' }}>
          Eight worlds. Infinite selves. A galaxy where your reputation,<br />creativity, and ideas exist — and have real consequence.
        </p>

        <div className="hero-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', animation: 'fadeUp 1s 1.2s both', width: '100%', maxWidth: 420 }}>
          <Link href="/signup" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--void)', background: 'var(--aether)', padding: '0.9rem 2rem', borderRadius: '2px', flex: 1, textAlign: 'center' }}>Join free →</Link>
          <Link href="/worlds" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--text-muted)', padding: '0.9rem 2rem', borderRadius: '2px', border: '0.5px solid var(--border-bright)', flex: 1, textAlign: 'center' }}>Explore</Link>
        </div>

        <div style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', animation: 'fadeIn 1s 2.2s both' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Scroll to explore</span>
          <div style={{ width: '0.5px', height: 40, background: 'linear-gradient(to bottom, var(--border-bright), transparent)', animation: 'scrollLine 2.5s ease-in-out infinite' }} />
        </div>
      </section>

      {/* ── WORLDS ── */}
      <section className="section-pad" style={{ padding: '7rem 3rem', borderTop: '0.5px solid var(--border)' }}>
        <div className="reveal" style={{ marginBottom: '3rem' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--aether)', marginBottom: '1rem' }}>— The galaxy map</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,4rem)', fontWeight: 300, lineHeight: 1.05, maxWidth: 600 }}>
            Eight worlds.<br /><em style={{ color: 'var(--gold)' }}>You don't scroll. You travel.</em>
          </h2>
        </div>
        <div className="reveal worlds-home-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)', marginBottom: '2rem' }}>
          {WORLDS.map(w => (
            <Link key={w.id} href={w.status === 'live' ? w.href : '/worlds'} style={{ display: 'block', textDecoration: 'none', background: 'var(--void)', padding: '1.5rem 1.25rem', transition: 'background 0.2s, border-color 0.2s', borderBottom: `2px solid transparent`, opacity: w.status === 'live' ? 1 : 0.55 }}
              className="world-card-home"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderBottomColor = w.color }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent' }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{w.glyph}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(0.9rem,1.8vw,1.1rem)', color: 'var(--text)', marginBottom: '0.25rem' }}>{w.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: w.status === 'live' ? w.color : 'var(--text-dim)', marginBottom: '0.5rem' }}>{w.status === 'live' ? '● Live' : w.phase}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', lineHeight: 1.7, color: 'var(--text-muted)' }}>{w.desc}</div>
            </Link>
          ))}
        </div>
        <div className="reveal" style={{ textAlign: 'center' }}>
          <Link href="/worlds" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--aether)', border: '0.5px solid rgba(168,155,255,0.3)', padding: '0.75rem 2rem', borderRadius: '2px', display: 'inline-block' }}>Explore all worlds →</Link>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section-pad" style={{ padding: '7rem 3rem', borderTop: '0.5px solid var(--border)' }}>
        <div className="reveal" style={{ marginBottom: '3rem' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--aether)', marginBottom: '1rem' }}>— What lives here</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,4rem)', fontWeight: 300, lineHeight: 1.05 }}>
            Everything you know.<br /><em style={{ color: 'var(--aether)' }}>Reimagined from scratch.</em>
          </h2>
        </div>
        <div className="reveal features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)' }}>
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card" style={{ background: 'var(--void)', padding: '2rem 1.75rem', transition: 'background 0.2s', cursor: 'default' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>{f.glyph}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text)', marginBottom: '0.15rem' }}>{f.title}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.12em', color: 'var(--aether)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>{f.sub}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', lineHeight: 1.9, color: 'var(--text-muted)' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section-pad" style={{ padding: '7rem 3rem', borderTop: '0.5px solid var(--border)' }}>
        <div className="reveal" style={{ marginBottom: '3rem' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--aether)', marginBottom: '1rem' }}>— Getting started</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,4rem)', fontWeight: 300, lineHeight: 1.05 }}>
            In the galaxy<br /><em style={{ color: 'var(--gold)' }}>in 4 steps.</em>
          </h2>
        </div>
        <div className="reveal steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)' }}>
          {STEPS.map(s => (
            <div key={s.num} className="step-card" style={{ background: 'var(--void)', padding: '2rem 1.5rem', transition: 'background 0.2s' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', color: 'var(--aether)', marginBottom: '1rem', opacity: 0.7 }}>{s.num}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1rem,2vw,1.2rem)', color: 'var(--text)', marginBottom: '0.75rem', lineHeight: 1.3 }}>{s.title}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', lineHeight: 1.9, color: 'var(--text-muted)' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── REPUTATION ── */}
      <section className="section-pad identity-grid" style={{ padding: '7rem 3rem', borderTop: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
        <div className="reveal">
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--aether)', marginBottom: '1rem' }}>— Your reputation</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3.5rem)', fontWeight: 300, lineHeight: 1.15, marginBottom: '1.5rem' }}>
            Not followers.<br /><em style={{ color: 'var(--aether)' }}>Actual dimensions</em><br />of who you are.
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.65rem,1.5vw,0.72rem)', lineHeight: 2, color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Six rep scores, earned through real actions. Wisdom from great insights. Creativity from Forge performances. Trust from how others rate you. All portable — they belong to you, not to Aethr.
          </p>
          <Link href="/signup" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--void)', background: 'var(--aether)', padding: '0.8rem 2rem', borderRadius: '2px', display: 'inline-block' }}>Start building your rep →</Link>
        </div>
        <div className="reveal" ref={repRef} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { label: 'Wisdom', value: 72, color: '#a89bff', desc: 'Great insights & discoveries' },
            { label: 'Creativity', value: 88, color: '#d4b896', desc: 'Forge performances & tips' },
            { label: 'Discovery', value: 45, color: '#1D9E75', desc: 'Rippled discoveries & mysteries' },
            { label: 'Trust', value: 93, color: '#378ADD', desc: 'How others rate you' },
            { label: 'Debate', value: 61, color: '#D85A30', desc: 'Arena arguments & votes' },
            { label: 'Legacy', value: 29, color: '#888780', desc: 'Monuments & long-term impact' },
          ].map(r => (
            <div key={r.label} style={{ background: 'var(--deep)', border: '0.5px solid var(--border)', borderRadius: '2px', padding: '0.85rem 1.1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)' }}>{r.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-dim)', marginLeft: '0.75rem' }}>{r.desc}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: r.color, fontWeight: 500 }}>{r.value}</span>
              </div>
              <div style={{ height: 2, background: 'var(--border)', borderRadius: 1 }}>
                <div className="rep-fill" data-target={r.value} style={{ height: '100%', width: '0%', background: r.color, borderRadius: 1, opacity: 0.85 }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MANIFESTO ── */}
      <section className="section-pad" style={{ padding: '7rem 3rem', borderTop: '0.5px solid var(--border)', textAlign: 'center' }}>
        <div className="reveal">
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--aether)', marginBottom: '2rem', opacity: 0.8 }}>The Aethr Manifesto</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,4vw,3.5rem)', fontWeight: 300, lineHeight: 1.45, maxWidth: 760, margin: '0 auto 3rem' }}>
            You don't <em style={{ color: 'var(--aether)' }}>scroll</em> here.<br />
            You <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>inhabit</span>.<br />
            You don't <em style={{ color: 'var(--aether)' }}>post</em>.<br />
            You <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>leave marks</span> that outlast you.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-pad cta-grid" style={{ padding: '7rem 3rem', borderTop: '0.5px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
        <div className="reveal">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem,5vw,4.5rem)', fontWeight: 300, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            Enter<br />the <em style={{ color: 'var(--aether)' }}>Æther</em>.<br />
            <span style={{ fontSize: '0.45em', color: 'var(--text-dim)', fontStyle: 'normal' }}>Free. Always.</span>
          </h2>
        </div>
        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.65rem,1.5vw,0.72rem)', lineHeight: 2, color: 'var(--text-muted)' }}>
            Aethr is free to join. Your reputation, signals, discoveries, and connections belong to you — not to us. The galaxy is live now.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--void)', background: 'var(--aether)', padding: '0.9rem 2rem', borderRadius: '2px' }}>Create account →</Link>
            <Link href="/commons" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--text-muted)', padding: '0.9rem 2rem', borderRadius: '2px', border: '0.5px solid var(--border-bright)' }}>Browse first</Link>
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)' }}>No ads. No algorithm. No surveillance. Your data is yours.</p>
        </div>
      </section>
    </>
  )
}
