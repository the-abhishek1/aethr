import WorldStub from '@/components/worlds/WorldStub'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'The Void — Aethr' }
export default function TheVoidPage() { return <WorldStub worldId="void" /> }
