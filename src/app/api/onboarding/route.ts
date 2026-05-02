export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { personaType, worldId, presenceState } = await req.json()

  // Deactivate existing personas
  await prisma.persona.updateMany({
    where: { userId: session.id },
    data: { isActive: false }
  })

  // Create or activate persona
  const existingPersona = await prisma.persona.findFirst({
    where: { userId: session.id, type: personaType }
  })

  if (existingPersona) {
    await prisma.persona.update({ where: { id: existingPersona.id }, data: { isActive: true } })
  } else {
    await prisma.persona.create({
      data: {
        userId: session.id,
        name: personaType.charAt(0).toUpperCase() + personaType.slice(1),
        type: personaType,
        worldScope: worldId ? [worldId] : ['commons'],
        isActive: true,
      }
    })
  }

  // Set presence
  await prisma.presence.upsert({
    where: { userId: session.id },
    update: { state: presenceState || 'open', worldId: worldId || null },
    create: { userId: session.id, state: presenceState || 'open', worldId: worldId || null }
  })

  // Welcome notification
  await prisma.notification.create({
    data: {
      userId: session.id,
      type: 'welcome',
      title: 'Welcome to Aethr',
      body: 'Your identity has been forged. The galaxy awaits.',
      link: '/dashboard',
    }
  })

  return NextResponse.json({ success: true })
}
