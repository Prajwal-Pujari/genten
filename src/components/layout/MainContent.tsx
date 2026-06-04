// ═══════════════════════════════════════════════════════════════
// Genten — MainContent (screen router)
// ═══════════════════════════════════════════════════════════════

import { useUIStore } from '../../store/uiStore'
import { HomeScreen } from '../screens/HomeScreen'
import { SetupWizard } from '../screens/SetupWizard'
import { NoteEditor } from '../screens/NoteEditor'
import { ProblemEditor } from '../screens/ProblemEditor'
import { GraphView } from '../screens/GraphView'
import { SystemDesignEditor } from '../screens/SystemDesign'
import { SettingsScreen } from '../screens/Settings'

/**
 * Routes to the active screen based on uiStore.activeScreen.
 * Screens are lazily rendered — only the active one is mounted.
 */
export function MainContent() {
  const activeScreen = useUIStore(s => s.activeScreen)

  return (
    <main className="flex-1 overflow-hidden bg-bg-base">
      {activeScreen === 'setup' && <SetupWizard />}
      {activeScreen === 'home' && <HomeScreen />}
      {activeScreen === 'editor' && <NoteEditor />}
      {activeScreen === 'problem' && <ProblemEditor />}
      {activeScreen === 'sysdesign' && <SystemDesignEditor />}
      {activeScreen === 'graph' && <GraphView />}
      {activeScreen === 'settings' && <SettingsScreen />}
    </main>
  )
}


