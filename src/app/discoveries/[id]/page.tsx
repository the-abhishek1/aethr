import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import DiscoveryDetailClient from './DiscoveryDetailClient'

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const discovery = await prisma.discovery.findUnique({
    where: { id },
    include: { author: { select: { username: true } } }
  })
  if (!discovery) return { title: 'Discovery not found — Aethr' }
  const base = process.env.NEXTAUTH_URL || 'https://aethr-galaxy.netlify.app'
  return {
    title: `${discovery.title} — Aethr`,
    description: discovery.content.slice(0, 160),
    openGraph: {
      title: `🔭 ${discovery.title}`,
      description: `${discovery.ripples} ripples · @${discovery.author?.username} · Aethr`,
      url: `${base}/discoveries/${id}`,
      type: 'article',
      images: discovery.mediaUrl ? [{ url: discovery.mediaUrl }] : [{ url: `${base}/og-default.png` }],
    },
    twitter: { card: 'summary_large_image', title: discovery.title, description: discovery.content.slice(0, 160) },
  }
}

export default async function DiscoveryPage({ params }: Props) {
  const { id } = await params
  const discovery = await prisma.discovery.findUnique({
    where: { id },
    include: { author: { select: { id: true, username: true, avatarEmoji: true, bio: true } } }
  })
  return <DiscoveryDetailClient discovery={discovery} />
}
