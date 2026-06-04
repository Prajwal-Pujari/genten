// ═══════════════════════════════════════════════════════════════
// Genten — Settings Store (Zustand)
// ═══════════════════════════════════════════════════════════════

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppConfig } from '../types/settings'
import { DEFAULT_CONFIG } from '../types/settings'

interface SettingsState {
  config: AppConfig
  isFirstLaunch: boolean
  isLoading: boolean
  
  llmEndpoint: string
  llmModel: string
  llmCodeModel: string
  llmVisionModel: string
  focusModeDefault: boolean
  
  // Actions
  loadConfig: () => Promise<void>
  completeSetup: (config: AppConfig) => Promise<void>
  testConnection: (url?: string) => Promise<{ success: boolean; models?: string[]; error?: string }>
  updateLLMConfig: (endpoint: string, model: string, codeModel: string, visionModel: string) => void
  toggleFocusModeDefault: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      config: DEFAULT_CONFIG,
      isFirstLaunch: true,
      isLoading: true,
      
      llmEndpoint: 'http://localhost:11434',
      llmModel: 'gemma4:26b',
      llmCodeModel: 'deepseek-coder-v2:16b',
      llmVisionModel: 'gemma4:26b',
      focusModeDefault: false,

      loadConfig: async () => {
        // Hydration happens automatically via persist middleware,
        // so we just mark loading as false.
        set({ isLoading: false })
      },

      completeSetup: async (newConfig) => {
        set({
          config: newConfig,
          isFirstLaunch: false,
        })
      },

      testConnection: async (url = 'http://localhost:11434') => {
        try {
          const res = await fetch(new URL('/api/tags', url).toString())
          if (res.ok) {
            const data = await res.json()
            const models = data.models?.map((m: any) => m.name) || []
            return { success: true, models }
          }
          return { success: false, error: res.statusText }
        } catch (e: any) {
          return { success: false, error: e.message }
        }
      },

      updateLLMConfig: (endpoint, model, codeModel, visionModel) => {
        const state = get()
        set({
          llmEndpoint: endpoint,
          llmModel: model,
          llmCodeModel: codeModel,
          llmVisionModel: visionModel,
          // Update the config object if it exists
          config: {
            ...state.config,
            tars: state.config.tars ? {
              ...state.config.tars,
              llm_base_url: endpoint,
              models: {
                ...state.config.tars.models,
                reasoning: model,
                coding: codeModel,
                vision: visionModel
              }
            } : null
          }
        })
      },

      toggleFocusModeDefault: () => set(s => ({ focusModeDefault: !s.focusModeDefault })),
    }),
    {
      name: 'genten-settings',
      onRehydrateStorage: () => (state) => {
        if (state) state.isLoading = false
      }
    }
  )
)
