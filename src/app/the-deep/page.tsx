import WorldStub from '@/components/worlds/WorldStub'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'The Deep — Aethr' }
export default function TheDeepPage() { return <WorldStub worldId="deep" /> }
