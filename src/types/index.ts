export type WorldStatus = 'live' | 'coming' | 'far' | 'future'

export interface World {
  id: string
  name: string
  glyph: string
  phase: string
  status: WorldStatus
  color: string
  accent: string
  desc: string
  longDesc: string
  href: string
  features: string[]
}

export interface Persona {
  id: string
  name: string
  world: string
  color: string
}

export interface PresenceState {
  id: string
  label: string
  color: string
  desc: string
}

export interface RepScore {
  label: string
  value: number
  color: string
}
