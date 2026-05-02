import WorldStub from '@/components/worlds/WorldStub'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'The Sanctum — Aethr' }
export default function SanctumPage() { return <WorldStub worldId="sanctum" /> }
