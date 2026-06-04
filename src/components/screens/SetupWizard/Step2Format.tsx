// ═══════════════════════════════════════════════════════════════
// Genten — Step 2: File Format
// ═══════════════════════════════════════════════════════════════

import { ArrowLeft } from 'lucide-react'
import type { AppConfig } from '../../../types/settings'

interface Props {
  config: AppConfig
  onUpdate: (partial: Partial<AppConfig>) => void
  onBack: () => void
  onNext: () => void
}

export function Step2Format({ config, onUpdate, onBack, onNext }: Props) {
  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-state mb-6 cursor-pointer"
      >
        <ArrowLeft size={14} />
        <span className="font-label text-xs">Back</span>
      </button>

      <h2 className="font-ui text-xl font-semibold text-text-primary mb-2">
        How should Genten save your notes?
      </h2>
      <p className="font-prose text-sm text-text-secondary mb-8">
        Choose your preferred file format.
      </p>

      {/* Radio cards */}
      <div className="flex flex-col gap-3 mb-8">
        <RadioCard
          selected={config.file_format === 'md'}
          onClick={() => onUpdate({ file_format: 'md' })}
          title="Markdown (.md)"
          badge="RECOMMENDED"
          description="Plain text, readable anywhere, version control friendly."
        />
        <RadioCard
          selected={config.file_format === 'html'}
          onClick={() => onUpdate({ file_format: 'html' })}
          title="HTML (.html)"
          description="Rich formatting, embeds images inline, opens in any browser."
        />
      </div>

      <button
        onClick={onNext}
        className="w-full py-3 bg-accent-espresso text-surface-low font-ui text-sm font-medium rounded-lg hover:opacity-90 transition-state cursor-pointer"
      >
        Continue →
      </button>
    </div>
  )
}

function RadioCard({ selected, onClick, title, badge, description }: {
  selected: boolean
  onClick: () => void
  title: string
  badge?: string
  description: string
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-lg border-2 transition-state cursor-pointer
        ${selected
          ? 'border-accent-violet bg-accent-violet/5'
          : 'border-border-subtle bg-surface hover:border-border-medium'
        }
      `}
    >
      <div className="flex items-center gap-3">
        {/* Radio indicator */}
        <span className={`
          w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
          ${selected ? 'border-accent-violet' : 'border-border-medium'}
        `}>
          {selected && <span className="w-2 h-2 rounded-full bg-accent-violet" />}
        </span>

        <span className="font-ui text-base font-medium text-text-primary">
          {title}
        </span>

        {badge && (
          <span className="font-label text-[10px] uppercase tracking-wider text-accent-violet bg-accent-violet/10 px-2 py-0.5 rounded">
            {badge}
          </span>
        )}
      </div>

      <p className="font-prose text-sm text-text-secondary mt-2 ml-7">
        {description}
      </p>
    </button>
  )
}
