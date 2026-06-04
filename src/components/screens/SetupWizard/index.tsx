// ═══════════════════════════════════════════════════════════════
// Genten — Setup Wizard (5-step flow)
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react'
import { Step1Vault } from './Step1Vault'
import { Step2Format } from './Step2Format'
import { Step3Database } from './Step3Database'
import { Step4AI } from './Step4AI'
import { Step5Confirm } from './Step5Confirm'
import type { AppConfig } from '../../../types/settings'
import { DEFAULT_CONFIG } from '../../../types/settings'

export interface WizardState {
  step: number
  config: AppConfig
}

const STORAGE_KEY = 'genten_wizard_draft'

function loadDraft(): WizardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as WizardState
  } catch { /* ignore */ }
  return {
    step: 1,
    config: { ...DEFAULT_CONFIG },
  }
}

function saveDraft(state: WizardState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function SetupWizard() {
  const [state, setState] = useState<WizardState>(loadDraft)

  // Persist draft on every change
  useEffect(() => {
    saveDraft(state)
  }, [state])

  const setStep = (step: number) => setState(s => ({ ...s, step }))
  const updateConfig = (partial: Partial<AppConfig>) =>
    setState(s => ({ ...s, config: { ...s.config, ...partial } }))

  const steps = [
    <Step1Vault
      key="1"
      config={state.config}
      onUpdate={updateConfig}
      onNext={() => setStep(2)}
    />,
    <Step2Format
      key="2"
      config={state.config}
      onUpdate={updateConfig}
      onBack={() => setStep(1)}
      onNext={() => setStep(3)}
    />,
    <Step3Database
      key="3"
      config={state.config}
      onUpdate={updateConfig}
      onBack={() => setStep(2)}
      onNext={() => setStep(4)}
    />,
    <Step4AI
      key="4"
      config={state.config}
      onUpdate={updateConfig}
      onBack={() => setStep(3)}
      onNext={() => setStep(5)}
    />,
    <Step5Confirm
      key="5"
      config={state.config}
      onBack={() => setStep(4)}
    />,
  ]

  return (
    <div className="h-full flex flex-col items-center justify-center bg-bg-base p-8">
      {/* Wizard card */}
      <div className="w-full max-w-[540px] bg-surface-low border border-border-subtle rounded-xl overflow-hidden">
        <div className="p-8">
          <div
            className={state.step > 1 ? 'animate-slide-in-right' : 'animate-fade-in'}
          >
            {steps[state.step - 1]}
          </div>
        </div>

        {/* Step indicator dots */}
        <div className="flex items-center justify-center gap-2 pb-6">
          {[1, 2, 3, 4, 5].map(i => (
            <span
              key={i}
              className={`
                w-2 h-2 rounded-full transition-state
                ${i === state.step
                  ? 'bg-accent-violet'
                  : i < state.step
                    ? 'bg-accent-espresso'
                    : 'border border-border-medium bg-transparent'
                }
              `}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
