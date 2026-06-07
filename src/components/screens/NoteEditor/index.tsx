// ═══════════════════════════════════════════════════════════════
// Genten — Note Editor (3-panel layout)
// ═══════════════════════════════════════════════════════════════

import { useUIStore } from '../../../store/uiStore'
import { FileTree } from './FileTree'
import { EditorArea } from './EditorArea'
import { RightPanel } from './RightPanel'

export function NoteEditor() {
  const sidebarCollapsed = useUIStore(s => s.sidebarCollapsed)
  const focusMode = useUIStore(s => s.focusMode)

  return (
    <div className="h-full flex flex-row w-full bg-bg-base overflow-hidden">
      {/* Left Panel: File Tree */}
      {(!sidebarCollapsed && !focusMode) && (
        <div className="hidden md:flex flex-col w-[240px] border-r border-border-subtle flex-shrink-0 bg-surface-primary">
          <FileTree />
        </div>
      )}

      {/* Center Panel: Editor */}
      <div className="flex-1 min-w-0 flex flex-col relative bg-bg-base">
        <EditorArea />
      </div>

      {/* Right Panel: Context Tabs (Links, TARS, Similar) */}
      {!focusMode && (
        <div className="hidden lg:flex flex-col w-[300px] border-l border-border-subtle flex-shrink-0 bg-surface-primary">
          <RightPanel />
        </div>
      )}
    </div>
  )
}
