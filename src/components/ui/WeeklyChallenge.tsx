'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// Deterministic weekly challenge based on week number
function getWeekNumber() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  return Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7)
}

const CHALLENGES = [
  {
    type: 'debate',
    emoji: '⚔️',
    title: 'This week\'s debate',
    prompt: 'Social media has made the world more divided, not less.',
    desc: 'Vote and argue in The Arena. Top argument earns +10 debate rep.',
    href: '/arena',
    cta: 'Enter the Arena →',
    color: '#D85A30',
  },
  {
    type: 'discovery',
    emoji: '🔭',
    title: 'Discovery challenge',
    prompt: 'Drop the most surprising thing you\'ve learned this week.',
    desc: 'First discovery to hit 5 ripples earns a monument in The Archive.',
    href: '/the-deep',
    cta: 'Go to The Deep →',
    color: '#378ADD',
  },
  {
    type: 'void',
    emoji: '🌑',
    title: 'Void challenge',
    prompt: 'A new mystery is live. Can you solve it first?',
    desc: 'First solver earns +25 Discovery rep and a permanent monument.',
    href: '/the-void',
    cta: 'Enter The Void →',
    color: '#7F77DD',
  },
  {
    type: 'forge',
    emoji: '🔥',
    title: 'Forge challenge',
    prompt: 'Transmit something you\'ve been working on. Anything. Go.',
    desc: 'Most-tipped transmission this week earns +15 creativity rep.',
    href: '/forge',
    cta: 'Go to The Forge →',
    color: '#BA7517',
  },
  {
    type: 'signal',
    emoji: '📡',
    title: 'Signal challenge',
    prompt: 'Post the most controversial thing you genuinely believe.',
    desc: 'Most-reacted signal earns +10 trust rep. No playing it safe.',
    href: '/commons',
    cta: 'Go to The Commons →',
    color: '#1D9E75',
  },
  {
    type: 'faction',
    emoji: '🏴',
    title: 'Faction war',
    prompt: 'Which faction will earn the most combined rep this week?',
    desc: 'Faction with highest total rep gain earns a milestone monument.',
    href: '/factions',
    cta: 'View factions →',
    color: '#a89bff',
  },
  {
    type: 'debate',
    emoji: '⚔️',
    title: 'This week\'s debate',
    prompt: 'Creativity requires struggle. Comfort kills it.',
    desc: 'Vote and argue in The Arena. Top argument earns +10 debate rep.',
    href: '/arena',
    cta: 'Enter the Arena →',
    color: '#D85A30',
  },
  {
    type: 'discovery',
    emoji: '🔭',
    title: 'Discovery challenge',
    prompt: 'Find a connection between two fields nobody usually connects.',
    desc: 'Discovery reaching 10 ripples earns a legacy monument.',
    href: '/the-deep',
    cta: 'Go to The Deep →',
    color: '#378ADD',
  },
]

// Days left in the week
function getDaysLeft() {
  const now = new Date()
  const day = now.getDay() // 0 = Sunday
  return 7 - day
}

interface Props {
  compact?: boolean
}

export default function WeeklyChallenge({ compact = false }: Props) {
  const [challenge, setChallenge] = useState<typeof CHALLENGES[0] | null>(null)
  const [daysLeft, setDaysLeft] = useState(0)

  useEffect(() => {
    const week = getWeekNumber()
    setChallenge(CHALLENGES[week % CHALLENGES.length])
    setDaysLeft(getDaysLeft())
  }, [])

  if (!challenge) return null

  if (compact) {
    return (
      <div style={{ border: `0.5px solid ${challenge.color}33`, borderRadius: '2px', padding: '0.85rem 1rem', background: `${challenge.color}06`, borderLeft: `3px solid ${challenge.color}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: challenge.color }}>
            {challenge.emoji} Weekly challenge
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--text-dim)', flexShrink: 0 }}>{daysLeft}d left</span>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.4, marginBottom: '0.5rem' }}>"{challenge.prompt}"</div>
        <Link href={challenge.href} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: challenge.color, textDecoration: 'none', letterSpacing: '0.06em' }}>{challenge.cta}</Link>
      </div>
    )
  }

  return (
    <div style={{ border: `0.5px solid ${challenge.color}44`, borderRadius: '2px', padding: '1.5rem', background: `${challenge.color}06`, marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: challenge.color, opacity: 0.06, filter: 'blur(30px)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: challenge.color, marginBottom: '0.35rem' }}>
            {challenge.emoji} {challenge.title}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.1rem,2.5vw,1.5rem)', color: 'var(--text)', lineHeight: 1.3, fontStyle: 'italic' }}>
            "{challenge.prompt}"
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: challenge.color, lineHeight: 1 }}>{daysLeft}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>days left</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{challenge.desc}</p>
        <Link href={challenge.href} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--void)', background: challenge.color, padding: '0.5rem 1.25rem', borderRadius: '2px', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {challenge.cta}
        </Link>
      </div>
    </div>
  )
}
