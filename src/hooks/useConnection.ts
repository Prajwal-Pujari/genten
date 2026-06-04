// ═══════════════════════════════════════════════════════════════
// Genten — Connection Polling Hook
// ═══════════════════════════════════════════════════════════════

import { useEffect } from 'react'
import { useConnectionStore } from '../store/connectionStore'
import { useSettingsStore } from '../store/settingsStore'

export function useConnection() {
  const tarsConfig = useSettingsStore(s => s.config.tars)
  const startPolling = useConnectionStore(s => s.startPolling)
  const stopPolling = useConnectionStore(s => s.stopPolling)
  const setState = useConnectionStore(s => s.setState)

  useEffect(() => {
    if (!tarsConfig?.enabled || !tarsConfig.llm_base_url) {
      setState('unconfigured')
      return
    }

    startPolling(tarsConfig.llm_base_url)

    return () => {
      stopPolling()
    }
  }, [tarsConfig, startPolling, stopPolling, setState])
}
