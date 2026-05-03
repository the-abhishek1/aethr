'use client'
import { createClient, RealtimeChannel } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  || ''
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let _client: ReturnType<typeof createClient> | null = null

export function getRealtimeClient() {
  if (!_client && supabaseUrl && supabaseKey) {
    _client = createClient(supabaseUrl, supabaseKey, {
      realtime: { params: { eventsPerSecond: 10 } }
    })
  }
  return _client
}

// ── Generic table subscription ─────────────────────────────
function subscribeToTable(
  table: string,
  filter: string | undefined,
  onInsert: (row: any) => void,
  onUpdate?: (row: any) => void,
  onDelete?: (row: any) => void,
): () => void {
  const client = getRealtimeClient()
  if (!client) return () => {}

  const channel: RealtimeChannel = client
    .channel(`${table}:${filter || 'all'}:${Math.random()}`)
    .on(
      'postgres_changes' as any,
      { event: 'INSERT', schema: 'public', table, ...(filter ? { filter } : {}) },
      (payload: any) => onInsert(payload.new)
    )

  if (onUpdate) {
    channel.on(
      'postgres_changes' as any,
      { event: 'UPDATE', schema: 'public', table, ...(filter ? { filter } : {}) },
      (payload: any) => onUpdate(payload.new)
    )
  }

  if (onDelete) {
    channel.on(
      'postgres_changes' as any,
      { event: 'DELETE', schema: 'public', table, ...(filter ? { filter } : {}) },
      (payload: any) => onDelete(payload.old)
    )
  }

  channel.subscribe()
  return () => { client.removeChannel(channel) }
}

// ── Public API ──────────────────────────────────────────────

/** New top-level signals in a world */
export function subscribeToSignals(
  worldId: string,
  onSignal: (signal: any) => void
) {
  return subscribeToTable('signals', `world_id=eq.${worldId}`, onSignal)
}

/** New reactions on a specific signal */
export function subscribeToReactions(
  signalId: string,
  onChange: (reaction: any, action: 'added' | 'removed') => void
) {
  const client = getRealtimeClient()
  if (!client) return () => {}

  const channel = client
    .channel(`reactions:${signalId}`)
    .on('postgres_changes' as any, {
      event: 'INSERT', schema: 'public', table: 'signal_reactions',
      filter: `signal_id=eq.${signalId}`
    }, (p: any) => onChange(p.new, 'added'))
    .on('postgres_changes' as any, {
      event: 'DELETE', schema: 'public', table: 'signal_reactions',
      filter: `signal_id=eq.${signalId}`
    }, (p: any) => onChange(p.old, 'removed'))
    .subscribe()

  return () => { client.removeChannel(channel) }
}

/** New messages in a conversation */
export function subscribeToMessages(
  userId: string,
  onMessage: (message: any) => void
) {
  return subscribeToTable('messages', `to_user_id=eq.${userId}`, onMessage)
}

/** Presence changes in a world */
export function subscribeToPresence(
  worldId: string,
  onUpdate: (presence: any) => void
) {
  return subscribeToTable('presences', `world_id=eq.${worldId}`, onUpdate, onUpdate)
}

/** Live transmissions changes */
export function subscribeToTransmissions(
  onUpdate: (tx: any) => void
) {
  return subscribeToTable('transmissions', 'is_live=eq.true', onUpdate, onUpdate)
}

/** New notifications for a user */
export function subscribeToNotifications(
  userId: string,
  onNotification: (n: any) => void
) {
  return subscribeToTable('notifications', `user_id=eq.${userId}`, onNotification)
}
