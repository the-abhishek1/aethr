export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { question } = await req.json()

  // Gather context about the user
  const [user, signals, discoveries, journal, rep] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      include: { personas: true, presence: true }
    }),
    prisma.signal.findMany({
      where: { authorId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { content: true, mood: true, worldId: true, createdAt: true }
    }),
    prisma.discovery.findMany({
      where: { authorId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { title: true, content: true, tags: true, ripples: true }
    }),
    prisma.journalEntry.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 15,
      select: { content: true, mood: true, createdAt: true }
    }),
    prisma.reputation.findUnique({ where: { userId: session.id } })
  ])

  // Build context summary for the oracle
  const moodCounts: Record<string, number> = {}
  signals.forEach((s: any) => { if (s.mood) moodCounts[s.mood] = (moodCounts[s.mood] || 0) + 1 })
  const topMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([m]) => m)

  const worldCounts: Record<string, number> = {}
  signals.forEach((s: any) => { worldCounts[s.worldId] = (worldCounts[s.worldId] || 0) + 1 })
  const topWorlds = Object.entries(worldCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([w]) => w)

  const journalMoods: Record<string, number> = {}
  journal.forEach((j: any) => { if (j.mood) journalMoods[j.mood] = (journalMoods[j.mood] || 0) + 1 })

  const context = `
You are the Aethr Oracle — a personal AI mirror that shows users patterns in their own journey. 
You are NOT a chatbot or assistant. You speak in brief, poetic, insightful observations.
You never give advice unless asked. You reflect patterns back.
You speak in the language of the galaxy (The Forge, The Deep, etc.) but don't overdo it.
Keep responses to 3-5 sentences maximum. Be honest, not flattering.

User: @${user?.username}
Bio: ${user?.bio || 'No bio yet'}
Active personas: ${user?.personas.map((p: any) => p.name).join(', ') || 'None'}
Current presence: ${user?.presence?.state || 'unknown'}

Signal patterns (${signals.length} total signals):
- Most frequent moods: ${topMoods.join(', ') || 'none recorded'}
- Most active worlds: ${topWorlds.join(', ') || 'none'}
- Recent signals: ${signals.slice(0, 5).map((s: any) => `"${s.content.slice(0, 60)}"`).join(' | ')}

Discoveries (${discoveries.length} total):
${discoveries.slice(0, 3).map((d: any) => `- "${d.title}" (${d.ripples} ripples, tags: ${d.tags.join(', ')})`).join('\n')}

Journal entries (${journal.length} total, private):
- Frequent moods: ${Object.entries(journalMoods).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([m]) => m).join(', ') || 'none'}
- Recent themes: ${journal.slice(0, 3).map((j: any) => j.content.slice(0, 60)).join(' | ')}

Reputation: wisdom=${rep?.wisdom || 0} creativity=${rep?.creativity || 0} discovery=${rep?.discovery || 0} trust=${rep?.trust || 0} debate=${rep?.debate || 0} legacy=${rep?.legacy || 0}

The user asks: "${question || 'What patterns do you see in my journey?'}"
`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{ role: 'user', content: context }]
      })
    })

    const data = await response.json()
    const insight = data.content?.[0]?.text || 'The oracle is silent. Return when the galaxy speaks.'

    return NextResponse.json({ insight })
  } catch {
    return NextResponse.json({
      insight: 'The oracle cannot see clearly right now. The signal is weak. Try again.'
    })
  }
}
