import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import SignalDetailClient from './SignalDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const signal = await prisma.signal.findUnique({
    where: { id },
    include: { author: { select: { username: true, avatarEmoji: true } } }
  })

  if (!signal) {
    return { title: 'Signal not found — Aethr' }
  }

  const title = `${signal.author?.avatarEmoji} @${signal.author?.username} on Aethr`
  const description = signal.content.slice(0, 160)
  const url = `${process.env.NEXTAUTH_URL || 'https://aethr-galaxy.netlify.app'}/signals/${id}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      images: signal.mediaUrl ? [{ url: signal.mediaUrl }] : [
        { url: `${process.env.NEXTAUTH_URL || 'https://aethr-galaxy.netlify.app'}/og-default.png`, width: 1200, height: 630 }
      ],
    },
    twitter: {
      card: signal.mediaUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      images: signal.mediaUrl ? [signal.mediaUrl] : [],
    },
  }
}

export default async function SignalPage({ params }: Props) {
  const { id } = await params
  const signal = await prisma.signal.findUnique({
    where: { id },
    include: {
      author:  { select: { id: true, username: true, avatarEmoji: true, bio: true } },
      persona: { select: { name: true, type: true } },
      _count:  { select: { replies: true, reactions: true } },
      reactions: { select: { emoji: true, userId: true } },
      replies: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { id: true, username: true, avatarEmoji: true } },
          _count: { select: { replies: true, reactions: true } },
          reactions: { select: { emoji: true, userId: true } },
        }
      }
    }
  })

  return <SignalDetailClient signal={signal} />
}
