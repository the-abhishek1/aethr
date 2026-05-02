import WorldStub from '@/components/worlds/WorldStub'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'The Archive — Aethr' }
export default function ArchivePage() { return <WorldStub worldId="archive" /> }
