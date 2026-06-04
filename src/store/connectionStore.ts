// ═══════════════════════════════════════════════════════════════
// Genten — Connection Store (Zustand)
// ═══════════════════════════════════════════════════════════════

import { create } from 'zustand'
import type { ConnectionState } from '../types/connection'
import { eventBus } from '../utils/eventBus'

const POLL_INTERVAL = 30_000 // 30 seconds
const DEMO_STATES: ConnectionState[] = ['connected', 'disconnected', 'unconfigured']

interface ConnectionStore {
  state: ConnectionState
  lastConnected: string | null
  modelsAvailable: string[]
  demoMode: boolean
  demoOverride: ConnectionState | null
  _pollTimer: ReturnType<typeof setInterval> | null

  // Actions
  setState: (s: ConnectionState) => void
  setModels: (models: string[]) => void
  ping: (url: string) => Promise<void>
  toggleDemoMode: () => void
  startPolling: (url: string) => void
  stopPolling: () => void

  // Computed
  effectiveState: () => ConnectionState
}

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  state: 'unconfigured',
  lastConnected: null,
  modelsAvailable: [],
  demoMode: false,
  demoOverride: null,
  _pollTimer: null,

  setState: (s) => {
    set({ state: s })
    eventBus.emit('connection:changed', s)
  },

  setModels: (models) => set({ modelsAvailable: models }),

  ping: async (url) => {
    const current = get()
    if (current.demoMode) return

    set({ state: 'checking' })
    try {
      const response = await fetch(`${url}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      })
      if (response.ok) {
        const data = await response.json() as { models?: Array<{ name: string }> }
        const models = data.models?.map((m: { name: string }) => m.name) ?? []
        set({
          state: 'connected',
          lastConnected: new Date().toISOString(),
          modelsAvailable: models,
        })
        eventBus.emit('connection:changed', 'connected')
      } else {
        set({ state: 'disconnected' })
        eventBus.emit('connection:changed', 'disconnected')
      }
    } catch {
      set({ state: 'disconnected' })
      eventBus.emit('connection:changed', 'disconnected')
    }
  },

  toggleDemoMode: () => {
    const { demoMode, demoOverride } = get()
    if (!demoMode) {
      // Enter demo mode, start at 'connected'
      set({
        demoMode: true,
        demoOverride: 'connected',
      })
    } else {
      // Cycle through demo states
      const currentIdx = DEMO_STATES.indexOf(demoOverride ?? 'connected')
      const nextIdx = (currentIdx + 1) % DEMO_STATES.length

      if (nextIdx === 0 && currentIdx === DEMO_STATES.length - 1) {
        // Cycled through all — exit demo mode
        set({
          demoMode: false,
          demoOverride: null,
        })
      } else {
        set({ demoOverride: DEMO_STATES[nextIdx] ?? 'connected' })
      }
    }
  },

  startPolling: (url) => {
    const { _pollTimer } = get()
    if (_pollTimer) clearInterval(_pollTimer)

    // Immediate ping
    get().ping(url)

    const timer = setInterval(() => {
      get().ping(url)
    }, POLL_INTERVAL)

    set({ _pollTimer: timer })
  },

  stopPolling: () => {
    const { _pollTimer } = get()
    if (_pollTimer) {
      clearInterval(_pollTimer)
      set({ _pollTimer: null })
    }
  },

  effectiveState: () => {
    const { demoMode, demoOverride, state } = get()
    if (demoMode && demoOverride) return demoOverride
    return state
  },
}))
