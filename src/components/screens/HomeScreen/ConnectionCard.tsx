// ═══════════════════════════════════════════════════════════════
// Genten — Connection Status Card
// ═══════════════════════════════════════════════════════════════

import { useConnectionStore } from '../../../store/connectionStore'
import { ConnectionDot } from '../../shared/ConnectionDot'
import { formatRelativeTime } from '../../../utils/dateFormat'

export function ConnectionCard() {
  const effectiveState = useConnectionStore(s => s.effectiveState)()
  const lastConnected = useConnectionStore(s => s.lastConnected)
  const modelsAvailable = useConnectionStore(s => s.modelsAvailable)
  const ping = useConnectionStore(s => s.ping)

  // Hidden when unconfigured
  if (effectiveState === 'unconfigured') return null

  const primaryModel = modelsAvailable[0] ?? 'unknown'

  return (
    <div className="bg-surface-low border border-border-subtle rounded-lg overflow-hidden">
      <div className="px-4 py-4">
        {effectiveState === 'connected' && (
          <div className="flex items-center gap-2">
            <ConnectionDot state="connected" size={6} />
            <div className="min-w-0">
              <p className="font-ui text-sm text-text-primary">
                TARS connected · {primaryModel}
              </p>
              <p className="font-label text-xs text-text-tertiary">
                {lastConnected
                  ? `Last synced ${formatRelativeTime(lastConnected)}`
                  : 'Connected'}
              </p>
            </div>
          </div>
        )}

        {effectiveState === 'disconnected' && (
          <div className="flex items-center gap-2">
            <ConnectionDot state="disconnected" size={6} />
            <div className="min-w-0 flex-1">
              <p className="font-ui text-sm text-text-primary">
                TARS offline
                {lastConnected && ` · last seen ${formatRelativeTime(lastConnected)}`}
              </p>
              <button
                onClick={() => ping('')}
                className="font-label text-xs text-text-secondary hover:text-accent-violet transition-state mt-0.5 cursor-pointer"
              >
                Retry connection
              </button>
            </div>
          </div>
        )}

        {effectiveState === 'syncing' && (
          <div className="flex items-center gap-2">
            <ConnectionDot state="syncing" size={6} />
            <p className="font-ui text-sm text-text-primary">
              Syncing…
            </p>
          </div>
        )}

        {effectiveState === 'checking' && (
          <div className="flex items-center gap-2">
            <ConnectionDot state="checking" size={6} />
            <p className="font-ui text-sm text-text-primary">
              Checking connection…
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
