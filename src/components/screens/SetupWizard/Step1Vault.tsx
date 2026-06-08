// ═══════════════════════════════════════════════════════════════
// Genten — Step 1: Vault Location
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import { open } from '@tauri-apps/plugin-dialog'
import { FolderOpen } from 'lucide-react'
import type { AppConfig } from '../../../types/settings'

interface Props {
  config: AppConfig
  onUpdate: (partial: Partial<AppConfig>) => void
  onNext: () => void
}

export function Step1Vault({ config, onUpdate, onNext }: Props) {
  const [error, setError] = useState('')

  const isMobile = window.navigator.userAgent.includes('Mobile')
  const defaultPath = isMobile ? '/data/user/0/com.genten.app/files/genten/Vault' : `${getHomePath()}/Genten`

  const handleBrowse = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Choose vault location',
      })
      if (selected) {
        onUpdate({ vault_path: selected as string })
        setError('')
      }
    } catch (err) {
      setError(`Could not open folder picker: ${err}`)
    }
  }

  const handleUseDefault = () => {
    onUpdate({ vault_path: defaultPath })
    setError('')
  }

  return (
    <div>
      <h2 className="font-ui text-xl font-semibold text-text-primary mb-2">
        Where should Genten store your notes?
      </h2>
      <p className="font-prose text-sm text-text-secondary mb-8">
        This is where all your notes will live as files.
      </p>

      {/* Path display */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 flex items-center gap-3 bg-surface border border-border-subtle rounded-lg px-4 py-3">
          <FolderOpen size={16} className="text-text-tertiary flex-shrink-0" />
          <span className="font-code text-sm text-text-primary truncate">
            {config.vault_path || defaultPath}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleBrowse}
          className="px-4 py-2 bg-surface-elevated border border-border-subtle rounded-lg font-ui text-sm text-text-primary hover:bg-surface-highest transition-state cursor-pointer"
        >
          Browse…
        </button>
        <button
          onClick={handleUseDefault}
          className="px-4 py-2 font-ui text-sm text-text-secondary hover:text-accent-violet transition-state cursor-pointer"
        >
          Use default
        </button>
      </div>

      {error && (
        <p className="text-sm text-accent-rose mb-4">{error}</p>
      )}

      {/* Continue button */}
      <button
        onClick={onNext}
        disabled={!config.vault_path && !defaultPath}
        className="w-full py-3 bg-accent-espresso text-surface-low font-ui text-sm font-medium rounded-lg hover:opacity-90 transition-state disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        Continue →
      </button>
    </div>
  )
}

function getHomePath(): string {
  // In Tauri, we can't easily get the home dir synchronously.
  // Default to a reasonable path; the user can browse to change it.
  if (navigator.platform.includes('Win') || navigator.userAgent.includes('Windows')) {
    return 'C:/Users/User'
  }
  return '~'
}
