import WorldStub from '@/components/worlds/WorldStub'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'The Market — Aethr' }
export default function MarketPage() { return <WorldStub worldId="market" /> }
