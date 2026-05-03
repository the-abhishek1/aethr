'use client'
import { useEffect, useRef } from 'react'
import { subscribeToSignals, subscribeToMessages, subscribeToNotifications } from '@/lib/realtime'
import { useAuth } from '@/context/AuthContext'

// Hook: subscribe to new signals in a world, prepend to existing list
export function useRealtimeSignals(
  worldId: string,
  setSignals: React.Dispatch<React.SetStateAction<any[]>>
) {
  useEffect(() => {
    const unsub = subscribeToSignals(worldId, (newSignal) => {
      // Enrich with default shape so UI doesn't crash before refresh
      setSignals(prev => {
        if (prev.some(s => s.id === newSignal.id)) return prev
        return [{ ...newSignal, _count: { replies: 0, reactions: 0 }, reactions: [], author: newSignal.author || {} }, ...prev]
      })
    })
    return unsub
  }, [worldId, setSignals])
}

// Hook: subscribe to new messages for the current user
export function useRealtimeMessages(
  onMessage: (msg: any) => void
) {
  const { user } = useAuth()
  const cb = useRef(onMessage)
  cb.current = onMessage

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToMessages(user.id, (msg) => cb.current(msg))
    return unsub
  }, [user])
}

// Hook: subscribe to notifications, returns unread bump
export function useRealtimeNotifications(
  onNotification: (n: any) => void
) {
  const { user } = useAuth()
  const cb = useRef(onNotification)
  cb.current = onNotification

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToNotifications(user.id, (n) => cb.current(n))
    return unsub
  }, [user])
}
