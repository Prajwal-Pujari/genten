// ═══════════════════════════════════════════════════════════════
// Genten — Toast Hook
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from 'react'
import { eventBus, type ToastConfig } from '../utils/eventBus'

export interface Toast extends ToastConfig {
  id: string
  createdAt: number
}

let toastCounter = 0

/**
 * Manages the toast notification queue.
 * Listens for 'toast:show' events from the event bus.
 */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((config: ToastConfig) => {
    const id = `toast-${++toastCounter}`
    const toast: Toast = {
      ...config,
      id,
      createdAt: Date.now(),
    }
    setToasts(prev => [...prev, toast])

    // Auto-dismiss
    const duration = config.duration ?? 4000
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Listen for events
  useEffect(() => {
    const unsub = eventBus.on('toast:show', addToast)
    return unsub
  }, [addToast])

  return {
    toasts,
    addToast,
    dismissToast,
  }
}

/** Convenience function to show a toast from anywhere */
export function showToast(config: ToastConfig) {
  eventBus.emit('toast:show', config)
}
