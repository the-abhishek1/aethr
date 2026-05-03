export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const [signals, tips, debates, discoveries, factions, mysteries] = await Promise.all([
    prisma.signal.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: 'desc' }, take: 10, include: { author: { select: { username: true, avatarEmoji: true } }, _count: { select: { reactions: true, replies: true } } } }),
    prisma.tip.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: 'desc' }, take: 10, include: { fromUser: { select: { username: true } }, toUser: { select: { username: true, avatarEmoji: true } } } }),
    prisma.debate.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: 'desc' }, take: 3, include: { creator: { select: { username: true } }, _count: { select: { arguments: true, votes: true } } } }),
    prisma.discovery.findMany({ where: { createdAt: { gte: since } }, orderBy: { ripples: 'desc' }, take: 3, include: { author: { select: { username: true, avatarEmoji: true } } } }),
    prisma.faction.findMany({ where: { createdAt: { gte: since } }, take: 3, include: { _count: { select: { members: true } } } }),
    prisma.mystery.findMany({ where: { status: 'solved', solvedAt: { gte: since } }, take: 2 }),
  ])

  const segments: any[] = []

  if (signals.length > 0) {
    // Sort by engagement, pick top 5
    const topSignals = [...signals].sort((a: any, b: any) => (b._count.reactions * 2 + b._count.replies * 3) - (a._count.reactions * 2 + a._count.replies * 3)).slice(0, 5)
    segments.push({ type: 'signals', icon: '📡', title: 'Hot signals today', world: 'The Commons', color: '#1D9E75', items: topSignals.map((s: any) => ({ text: `${s.author.avatarEmoji} @${s.author.username}: "${s.content.slice(0, 80)}${s.content.length > 80 ? '...' : ''}"`, mood: s.mood, mediaUrl: s.mediaUrl, stats: s._count.reactions > 0 ? `${s._count.reactions} reactions · ${s._count.replies} replies` : null })) })
  }
  if (discoveries.length > 0) segments.push({ type: 'discoveries', icon: '🔭', title: 'Discoveries that rippled', world: 'The Deep', color: '#378ADD', items: discoveries.map((d: any) => ({ text: `${d.author.avatarEmoji} @${d.author.username} discovered: "${d.title}"`, ripples: d.ripples })) })
  if (debates.length > 0) segments.push({ type: 'debates', icon: '⚔️', title: 'Debates in The Arena', world: 'The Arena', color: '#D85A30', items: debates.map((d: any) => ({ text: `@${d.creator.username} opened: "${d.title}"`, stats: `${d._count.arguments} arguments · ${d._count.votes} votes` })) })
  if (tips.length > 0) {
    const byR = tips.reduce((a: any, t: any) => { a[t.toUser.username] = (a[t.toUser.username] || 0) + t.amount; return a }, {})
    const top = Object.entries(byR).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3)
    segments.push({ type: 'tips', icon: '✦', title: 'Most tipped in The Forge', world: 'The Forge', color: '#BA7517', items: top.map(([u, n]: any) => ({ text: `@${u} received ${n} tip${n !== 1 ? 's' : ''}` })) })
  }
  if (mysteries.length > 0) segments.push({ type: 'mysteries', icon: '🌑', title: 'Mysteries solved in The Void', world: 'The Void', color: '#7F77DD', items: mysteries.map((m: any) => ({ text: `"${m.title}" was solved` })) })
  if (factions.length > 0) segments.push({ type: 'factions', icon: '🏴', title: 'New factions forged', world: 'The Arena', color: '#D85A30', items: factions.map((f: any) => ({ text: `"${f.name}" emerged with ${f._count.members} member${f._count.members !== 1 ? 's' : ''}` })) })

  return NextResponse.json({ date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }), segments, stats: { signals: signals.length, tips: tips.length, debates: debates.length, discoveries: discoveries.length, factions: factions.length, mysteriesSolved: mysteries.length }, empty: segments.length === 0 })
}
