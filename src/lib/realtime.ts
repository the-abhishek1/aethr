'use client'
import { createClient } from '@supabase/supabase-js'

// Supabase client for realtime subscriptions only
// This uses the public anon key - safe for browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let _client: ReturnType<typeof createClient> | null = null

export function getRealtimeClient() {
  if (!_client && supabaseUrl && supabaseKey) {
    _client = createClient(supabaseUrl, supabaseKey)
  }
  return _client
}

// Subscribe to new signals in a world
export function subscribeToSignals(worldId: string, onSignal: (signal: any) => void) {
  const client = getRealtimeClient()
  if (!client) return () => {}

  const channel = client
    .channel(`signals:${worldId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'signals',
      filter: `world_id=eq.${worldId}`,
    }, payload => onSignal(payload.new))
    .subscribe()

  return () => { client.removeChannel(channel) }
}

// Subscribe to presence changes
export function subscribeToPresence(worldId: string, onUpdate: (presence: any) => void) {
  const client = getRealtimeClient()
  if (!client) return () => {}

  const channel = client
    .channel(`presence:${worldId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'presences',
      filter: `world_id=eq.${worldId}`,
    }, payload => onUpdate(payload.new))
    .subscribe()

  return () => { client.removeChannel(channel) }
}

// Subscribe to live transmission updates
export function subscribeToTransmissions(onUpdate: (tx: any) => void) {
  const client = getRealtimeClient()
  if (!client) return () => {}

  const channel = client
    .channel('transmissions:live')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'transmissions',
      filter: 'is_live=eq.true',
    }, payload => onUpdate(payload.new))
    .subscribe()

  return () => { client.removeChannel(channel) }
}
