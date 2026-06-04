// ═══════════════════════════════════════════════════════════════
// Genten — Connection Types
// ═══════════════════════════════════════════════════════════════

export type ConnectionState =
  | 'unconfigured'
  | 'checking'
  | 'connected'
  | 'disconnected'
  | 'syncing'

export interface ConnectionStatus {
  state: ConnectionState
  last_connected: string | null
  models_available: string[]
  demo_mode: boolean
  demo_override: 'connected' | 'disconnected' | 'unconfigured' | null
}
