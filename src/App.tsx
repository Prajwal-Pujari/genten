// ═══════════════════════════════════════════════════════════════
// Genten — App Root Component
// ═══════════════════════════════════════════════════════════════

import { useEffect } from 'react'
import { listen } from '@tauri-apps/api/event'
import { NavRail } from './components/layout/NavRail'
import { AppFooter } from './components/layout/AppFooter'
import { MainContent } from './components/layout/MainContent'
import { Titlebar } from './components/layout/Titlebar'
import { ToastContainer } from './components/shared/ToastContainer'
import { DemoToggle } from './components/shared/DemoToggle'
import { QuickOpen } from './components/overlays/QuickOpen'
import { ContextMenu } from './components/overlays/ContextMenu'
import { NewNoteModal } from './components/overlays/NewNoteModal'
import { useKeyboard } from './hooks/useKeyboard'
import { useConnection } from './hooks/useConnection'
import { useSettingsStore } from './store/settingsStore'
import { useUIStore } from './store/uiStore'
import { useNotesStore } from './store/notesStore'

export default function App() {
  const loadConfig = useSettingsStore(s => s.loadConfig)
  const isFirstLaunch = useSettingsStore(s => s.isFirstLaunch)
  const isLoading = useSettingsStore(s => s.isLoading)
  const navigate = useUIStore(s => s.navigate)
  const activeScreen = useUIStore(s => s.activeScreen)
  const focusMode = useUIStore(s => s.focusMode)
  const loadVault = useNotesStore(s => s.loadVault)

  // Initialize app
  useEffect(() => {
    const init = async () => {
      await loadConfig()
    }
    init()
  }, [loadConfig])

  // Navigate to setup on first launch, load vault otherwise
  useEffect(() => {
    if (isLoading) return
    if (isFirstLaunch) {
      navigate('setup')
    } else {
      if (activeScreen === 'setup') {
        navigate('home')
      }
      loadVault()
    }
  }, [isFirstLaunch, isLoading, navigate, activeScreen, loadVault])

  // Listen for sync completions from mobile devices
  useEffect(() => {
    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    if (!isTauri) return;

    const unlisten = listen('sync:finished', () => {
      console.log('Mobile device completed sync. Reloading vault.')
      loadVault()
    })
    return () => {
      unlisten.then(f => f())
    }
  }, [loadVault])

  // Mount global hooks
  useKeyboard()
  useConnection()

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-base">
        <div className="flex flex-col items-center gap-4">
          <svg width="32" height="32" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="3" fill="#6B5CE7" />
            <circle cx="10" cy="10" r="8" stroke="#6B5CE7" strokeWidth="1.5" fill="none" opacity="0.3" />
          </svg>
          <p className="font-ui text-sm text-text-tertiary">Loading…</p>
        </div>
      </div>
    )
  }

  // Setup wizard — full screen, no nav
  if (activeScreen === 'setup') {
    return (
      <div className="h-screen bg-bg-base pt-[30px]">
        <Titlebar />
        <MainContent />
        <ToastContainer />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-bg-base pt-[30px]">
      <Titlebar />
      <div className="flex flex-col-reverse md:flex-row flex-1 overflow-hidden">
        {/* Nav rail — hidden in focus mode */}
        {!focusMode && <NavRail />}

        {/* Main content */}
        <MainContent />
      </div>

      {/* Footer — hidden in focus mode */}
      {!focusMode && <AppFooter />}

      {/* Overlays */}
      <QuickOpen />
      <ContextMenu />
      <NewNoteModal />
      <ToastContainer />
      <DemoToggle />
    </div>
  )
}
