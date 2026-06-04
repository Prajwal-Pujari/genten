// ═══════════════════════════════════════════════════════════════
// Genten — Step 4: AI Setup
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import { ArrowLeft, Loader2, Check, X } from 'lucide-react'
import type { AppConfig, TARSConfig } from '../../../types/settings'
import { DEFAULT_TARS_CONFIG } from '../../../types/settings'
import { useSettingsStore } from '../../../store/settingsStore'

interface Props {
  config: AppConfig
  onUpdate: (partial: Partial<AppConfig>) => void
  onBack: () => void
  onNext: () => void
}

export function Step4AI({ onUpdate, onBack, onNext }: Props) {
  const [showSetup, setShowSetup] = useState(false)
  const [url, setUrl] = useState(DEFAULT_TARS_CONFIG.llm_base_url)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; models?: string[]; error?: string } | null>(null)
  const testConnection = useSettingsStore(s => s.testConnection)

  const [selectedModels, setSelectedModels] = useState({
    reasoning: DEFAULT_TARS_CONFIG.models.reasoning,
    coding: DEFAULT_TARS_CONFIG.models.coding,
    fast: DEFAULT_TARS_CONFIG.models.fast,
  })

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    const result = await testConnection(url)
    setTestResult(result)
    setTesting(false)
  }

  const handleSkip = () => {
    onUpdate({ tars: null })
    onNext()
  }

  const handleSave = () => {
    const tarsConfig: TARSConfig = {
      ...DEFAULT_TARS_CONFIG,
      llm_base_url: url,
      models: {
        ...DEFAULT_TARS_CONFIG.models,
        ...selectedModels,
      },
    }
    onUpdate({ tars: tarsConfig })
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
        Do you want to connect an AI assistant?
      </h2>
      <p className="font-prose text-sm text-text-secondary mb-8">
        Completely optional. Genten works perfectly without AI.
      </p>

      {!showSetup ? (
        <div className="flex gap-3">
          <button
            onClick={() => setShowSetup(true)}
            className="flex-1 py-3 border-2 border-accent-violet text-accent-violet font-ui text-sm font-medium rounded-lg hover:bg-accent-violet/5 transition-state cursor-pointer"
          >
            Set up TARS
          </button>
          <button
            onClick={handleSkip}
            className="flex-1 py-3 font-ui text-sm text-text-secondary hover:text-text-primary transition-state cursor-pointer"
          >
            Skip for now →
          </button>
        </div>
      ) : (
        <div className="animate-fade-in">
          {/* URL input */}
          <label className="block mb-4">
            <span className="font-label text-xs text-text-secondary block mb-1">
              AI server URL
            </span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://192.168.1.100:11434"
              className="w-full px-4 py-2.5 bg-surface border border-border-subtle rounded-lg font-code text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-violet focus:outline-none transition-state"
            />
            <span className="font-label text-[10px] text-text-tertiary mt-1 block">
              Your Ollama server address
            </span>
          </label>

          {/* Test button */}
          <button
            onClick={handleTest}
            disabled={testing || !url}
            className="px-4 py-2 bg-surface-elevated border border-border-subtle rounded-lg font-ui text-sm text-text-primary hover:bg-surface-highest transition-state disabled:opacity-40 cursor-pointer mb-4"
          >
            {testing ? (
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Testing…
              </span>
            ) : (
              'Test Connection'
            )}
          </button>

          {/* Test result */}
          {testResult && (
            <div className={`flex items-center gap-2 mb-4 p-3 rounded-lg ${
              testResult.success ? 'bg-accent-teal/10' : 'bg-accent-rose/10'
            }`}>
              {testResult.success ? (
                <>
                  <Check size={14} className="text-accent-teal" />
                  <span className="font-ui text-sm text-accent-teal">
                    Connected · {testResult.models?.length ?? 0} models available
                  </span>
                </>
              ) : (
                <>
                  <X size={14} className="text-accent-rose" />
                  <span className="font-ui text-sm text-accent-rose">
                    {testResult.error ?? 'Could not connect'}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Model dropdowns — shown after successful test */}
          {testResult?.success && testResult.models && (
            <div className="space-y-3 mb-6 animate-fade-in">
              <ModelSelect
                label="Reasoning"
                value={selectedModels.reasoning}
                models={testResult.models}
                onChange={(v) => setSelectedModels(s => ({ ...s, reasoning: v }))}
              />
              <ModelSelect
                label="Coding"
                value={selectedModels.coding}
                models={testResult.models}
                onChange={(v) => setSelectedModels(s => ({ ...s, coding: v }))}
              />
              <ModelSelect
                label="Fast"
                value={selectedModels.fast}
                models={testResult.models}
                onChange={(v) => setSelectedModels(s => ({ ...s, fast: v }))}
              />
            </div>
          )}

          {/* Save button — only after test passes */}
          {testResult?.success && (
            <button
              onClick={handleSave}
              className="w-full py-3 bg-accent-espresso text-surface-low font-ui text-sm font-medium rounded-lg hover:opacity-90 transition-state cursor-pointer animate-fade-in"
            >
              Save & Continue →
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function ModelSelect({ label, value, models, onChange }: {
  label: string
  value: string
  models: string[]
  onChange: (v: string) => void
}) {
  return (
    <label className="flex items-center gap-3">
      <span className="font-label text-xs text-text-secondary w-20">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-2 bg-surface border border-border-subtle rounded-lg font-code text-xs text-text-primary focus:border-accent-violet focus:outline-none transition-state cursor-pointer"
      >
        {models.map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
        {!models.includes(value) && (
          <option value={value}>{value} (not found)</option>
        )}
      </select>
    </label>
  )
}
