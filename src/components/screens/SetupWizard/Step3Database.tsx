// ═══════════════════════════════════════════════════════════════
// Genten — Step 3: Database Location
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { open } from '@tauri-apps/plugin-dialog'
import type { AppConfig } from '../../../types/settings'

interface Props {
  config: AppConfig
  onUpdate: (partial: Partial<AppConfig>) => void
  onBack: () => void
  onNext: () => void
}

export function Step3Database({ config, onUpdate, onBack, onNext }: Props) {
  const [useVault, setUseVault] = useState(true)

  const vaultDbPath = `${config.vault_path}/genten.db`

  const handleBrowse = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Choose database location',
      })
      if (selected) {
        onUpdate({ db_path: `${selected}/genten.db` })
      }
    } catch {
      // user cancelled
    }
  }

  const handleNext = () => {
    if (useVault) {
      onUpdate({ db_path: vaultDbPath })
    }
    onNext()
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-state mb-6 cursor-pointer"
      >
        <ArrowLeft size={14} />
        <span className="font-label text-xs">Back</span>
      </button>

      <h2 className="font-ui text-xl font-semibold text-text-primary mb-2">
        Where should Genten store its database?
      </h2>
      <p className="font-prose text-sm text-text-secondary mb-8">
        A small local database for search and graph.
      </p>

      <div className="flex flex-col gap-3 mb-8">
        {/* Same as vault */}
        <button
          onClick={() => setUseVault(true)}
          className={`
            w-full text-left p-4 rounded-lg border-2 transition-state cursor-pointer
            ${useVault
              ? 'border-accent-violet bg-accent-violet/5'
              : 'border-border-subtle bg-surface hover:border-border-medium'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${useVault ? 'border-accent-violet' : 'border-border-medium'}`}>
              {useVault && <span className="w-2 h-2 rounded-full bg-accent-violet" />}
            </span>
            <span className="font-ui text-base font-medium text-text-primary">
              Same as vault folder
            </span>
          </div>
          <p className="font-code text-xs text-text-tertiary mt-2 ml-7 truncate">
            {vaultDbPath}
          </p>
        </button>

        {/* Custom location */}
        <button
          onClick={() => setUseVault(false)}
          className={`
            w-full text-left p-4 rounded-lg border-2 transition-state cursor-pointer
            ${!useVault
              ? 'border-accent-violet bg-accent-violet/5'
              : 'border-border-subtle bg-surface hover:border-border-medium'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${!useVault ? 'border-accent-violet' : 'border-border-medium'}`}>
              {!useVault && <span className="w-2 h-2 rounded-full bg-accent-violet" />}
            </span>
            <span className="font-ui text-base font-medium text-text-primary">
              Custom location
            </span>
          </div>
        </button>

        {/* Browse appears when custom is selected */}
        {!useVault && (
          <div className="ml-7 flex items-center gap-3 animate-fade-in">
            <div className="flex-1 bg-surface border border-border-subtle rounded-lg px-4 py-2">
              <span className="font-code text-xs text-text-tertiary truncate">
                {config.db_path || 'Choose a location…'}
              </span>
            </div>
            <button
              onClick={handleBrowse}
              className="px-4 py-2 bg-surface-elevated border border-border-subtle rounded-lg font-ui text-sm text-text-primary hover:bg-surface-highest transition-state cursor-pointer"
            >
              Browse…
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handleNext}
        className="w-full py-3 bg-accent-espresso text-surface-low font-ui text-sm font-medium rounded-lg hover:opacity-90 transition-state cursor-pointer"
      >
        Continue →
      </button>
    </div>
  )
}
