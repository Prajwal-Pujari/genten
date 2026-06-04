// ═══════════════════════════════════════════════════════════════
// Genten — ConnectionDot (status indicator)
// ═══════════════════════════════════════════════════════════════

import type { ConnectionState } from '../../types/connection'

interface ConnectionDotProps {
  state: ConnectionState
  size?: number
  className?: string
}

const stateClasses: Record<ConnectionState, string> = {
  connected:    'connection-dot--connected',
  disconnected: 'connection-dot--disconnected',
  unconfigured: 'connection-dot--disconnected',
  checking:     'connection-dot--checking',
  syncing:      'connection-dot--syncing',
}

export function ConnectionDot({ state, size = 6, className = '' }: ConnectionDotProps) {
  return (
    <span
      className={`connection-dot ${stateClasses[state]} ${className}`}
      style={{ width: size, height: size }}
      aria-label={`Connection: ${state}`}
    />
  )
}
