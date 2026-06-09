// ═══════════════════════════════════════════════════════════════
// Genten — Settings Store (Zustand)
// ═══════════════════════════════════════════════════════════════

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { invoke } from '@tauri-apps/api/core'
import type { AppConfig } from '../types/settings'
import { DEFAULT_CONFIG } from '../types/settings'

interface SettingsState {
  config: AppConfig
  isFirstLaunch: boolean
  isLoading: boolean
  isLlmConnected: boolean
  availableModels: string[]
  llmError: string | null

  // Backwards compatibility for previous local TARS implementation
  llmEndpoint: string
  llmModel: string
  llmCodeModel: string
  llmVisionModel: string
  focusModeDefault: boolean

  // Actions
  loadConfig: () => Promise<void>
  completeSetup: (config: AppConfig) => Promise<void>
  testConnection: (url?: string) => Promise<{ success: boolean; error?: string }>
  updateLLMConfig: (endpoint: string, model: string, codeModel: string, visionModel: string) => void
  toggleFocusModeDefault: () => void
}

function sanitizeUrl(url: string): string {
  let clean = url.trim()
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = 'http://' + clean
  }
  // If it's just an IP or hostname without a port, add :11434
  try {
    const parsed = new URL(clean)
    if (!parsed.port) {
      clean = clean.replace(/\/$/, '') + ':11434'
    }
  } catch (e) {
    // Fallback if URL parsing fails
  }
  return clean
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      config: DEFAULT_CONFIG,
      isFirstLaunch: true,
      isLoading: true,
      isLlmConnected: false,
      availableModels: [],
      llmError: null,

      llmEndpoint: 'http://localhost:11434',
      llmModel: 'gemma4:26b',
      llmCodeModel: 'qwen2.5-coder:7b',
      llmVisionModel: 'llama3.2-vision:11b',
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
          const sanitized = sanitizeUrl(url).replace(/\/$/, '');
          const models: string[] = await invoke('test_ollama_connection', { endpoint: sanitized });
          
          set({
            isLlmConnected: true,
            availableModels: models,
            llmError: null
          })
          return { success: true }
        } catch (error: any) {
          const errorMessage = error.message || String(error)
          set({
            isLlmConnected: false,
            llmError: errorMessage,
            availableModels: []
          })
          return { success: false, error: errorMessage }
        }
      },

      updateLLMConfig: (endpoint, model, codeModel, visionModel) => {
        const state = get()
        const sanitizedEndpoint = sanitizeUrl(endpoint)
        set({
          llmEndpoint: sanitizedEndpoint,
          llmModel: model,
          llmCodeModel: codeModel,
          llmVisionModel: visionModel,
          // Update the config object if it exists
          config: {
            ...state.config,
            tars: state.config.tars ? {
              ...state.config.tars,
              llm_base_url: sanitizedEndpoint,
              models: {
                ...state.config.tars.models,
                reasoning: model,
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
