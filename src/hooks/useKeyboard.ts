// ═══════════════════════════════════════════════════════════════
// Genten — Global Keyboard Shortcuts Hook
// ═══════════════════════════════════════════════════════════════

import { useEffect } from 'react'
import { useUIStore } from '../store/uiStore'
import { useConnectionStore } from '../store/connectionStore'

const isMac = navigator.platform.includes('Mac')

function isInputFocused(): boolean {
  const el = document.activeElement
  if (!el) return false
  const tag = el.tagName.toLowerCase()
  if (tag === 'input' || tag === 'textarea') return true
  if ((el as HTMLElement).isContentEditable) return true
  // CodeMirror editor
  if (el.closest('.cm-editor')) return true
  return false
}

export function useKeyboard() {
  const toggleQuickOpen = useUIStore(s => s.toggleQuickOpen)
  const toggleTARS = useUIStore(s => s.toggleTARS)
  const toggleSettings = useUIStore(s => s.toggleSettings)
  const navigate = useUIStore(s => s.navigate)
  const closeTopmost = useUIStore(s => s.closeTopmost)
  const toggleFocusMode = useUIStore(s => s.toggleFocusMode)
  const toggleDemoMode = useConnectionStore(s => s.toggleDemoMode)
  const connectionState = useConnectionStore(s => s.effectiveState)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = isMac ? e.metaKey : e.ctrlKey

      // Escape always works, even in inputs
      if (e.key === 'Escape') {
        e.preventDefault()
        closeTopmost()
        return
      }

      // Block single-key shortcuts when inside input elements, but allow Meta/Ctrl commands
      if (isInputFocused() && !meta) return

      if (meta && e.key === 'k') {
        e.preventDefault()
        toggleQuickOpen()
        return
      }

      if (meta && e.key === 't') {
        e.preventDefault()
        if (connectionState() !== 'unconfigured') {
          toggleTARS()
        }
        return
      }

      if (meta && e.key === ',') {
        e.preventDefault()
        toggleSettings()
        return
      }

      if (meta && e.key === 'n') {
        e.preventDefault()
        // TODO: show type picker for new note
        return
      }

      if (meta && e.key === 'g') {
        e.preventDefault()
        navigate('graph')
        return
      }

      if (meta && e.key === 'd') {
        e.preventDefault()
        // TODO: open today's daily note
        return
      }

      if (meta && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        toggleFocusMode()
        return
      }

      if (meta && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        toggleDemoMode()
        return
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [
    toggleQuickOpen, toggleTARS, toggleSettings,
    navigate, closeTopmost, toggleFocusMode,
    toggleDemoMode, connectionState,
  ])
}
