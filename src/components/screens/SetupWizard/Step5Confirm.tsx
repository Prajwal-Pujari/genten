// ═══════════════════════════════════════════════════════════════
// Genten — Step 5: Confirm & Launch
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import type { AppConfig } from '../../../types/settings'
import { useSettingsStore } from '../../../store/settingsStore'
import { useUIStore } from '../../../store/uiStore'

interface Props {
  config: AppConfig
  onBack: () => void
}

export function Step5Confirm({ config, onBack }: Props) {
  const [launching, setLaunching] = useState(false)
  const [error, setError] = useState('')
  const completeSetup = useSettingsStore(s => s.completeSetup)
  const navigate = useUIStore(s => s.navigate)

  const handleLaunch = async () => {
    setLaunching(true)
    setError('')
    try {
      await completeSetup(config)
      navigate('home')
    } catch (err) {
      setError(`Setup failed: ${err}`)
      setLaunching(false)
    }
  }

  const tarsStatus = config.tars?.enabled
    ? `Connected (${config.tars.models.reasoning})`
    : 'Skipped'

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
        You're ready.
      </h2>
      <p className="font-prose text-sm text-text-secondary mb-6">
        Here's what Genten will create.
      </p>

      {/* Summary card */}
      <div className="bg-surface border border-border-subtle rounded-lg p-4 mb-6">
        <div className="space-y-2">
          <SummaryRow label="Vault" value={config.vault_path} />
          <SummaryRow label="Format" value={config.file_format === 'md' ? 'Markdown (.md)' : 'HTML (.html)'} />
          <SummaryRow label="Database" value={config.db_path || `${config.vault_path}/genten.db`} />
          <SummaryRow label="TARS" value={tarsStatus} />
        </div>
      </div>

      {/* Folder tree preview */}
      <div className="bg-surface border border-border-subtle rounded-lg p-4 mb-8">
        <p className="font-code text-xs text-text-tertiary mb-2">
          {config.vault_path}/
        </p>
        <div className="font-code text-xs text-text-secondary space-y-0.5 ml-2">
          {[
            '├── Daily/',
            '├── Study/',
            '├── Problems/',
            '├── System Design/',
            '├── Diagrams/',
            '├── Canvas/',
            '├── Captures/',
            '└── Attachments/images/',
          ].map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-accent-rose mb-4">{error}</p>
      )}

      {/* Launch button */}
      <button
        onClick={handleLaunch}
        disabled={launching}
        className="w-full h-12 bg-accent-espresso text-surface-low font-ui text-base font-medium rounded-lg hover:opacity-90 transition-state disabled:opacity-60 cursor-pointer"
      >
        {launching ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Setting up…
          </span>
        ) : (
          'Launch Genten'
        )}
      </button>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-label text-xs text-text-tertiary w-16 flex-shrink-0">
        {label}:
      </span>
      <span className="font-code text-xs text-text-primary truncate">
        {value}
      </span>
    </div>
  )
}
