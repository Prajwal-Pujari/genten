// ═══════════════════════════════════════════════════════════════
// Genten — File Watcher Hook (stub)
// ═══════════════════════════════════════════════════════════════

import { useEffect } from 'react'
import { useSettingsStore } from '../store/settingsStore'

/**
 * Watches the vault folder for file changes.
 * Currently a stub — will be wired to Tauri fs watch API in Phase 5.
 */
export function useFileWatcher() {
  const vaultPath = useSettingsStore(s => s.config.vault_path)

  useEffect(() => {
    if (!vaultPath) return

    // Phase 5: implement file watching via tauri-plugin-fs watch API
    // Will emit 'vault:file:changed' events through the event bus

    return () => {
      // Cleanup watcher
    }
  }, [vaultPath])
}
