// ═══════════════════════════════════════════════════════════════
// Genten — Note Editor (3-panel layout)
// ═══════════════════════════════════════════════════════════════

import { useUIStore } from '../../../store/uiStore'
import { FileTree } from './FileTree'
import { EditorArea } from './EditorArea'
import { RightPanel } from './RightPanel'

import { useNotesStore } from '../../../store/notesStore'

export function NoteEditor() {
  const sidebarCollapsed = useUIStore(s => s.sidebarCollapsed)
  const focusMode = useUIStore(s => s.focusMode)
  const activeNote = useNotesStore(s => s.activeNote)

  return (
    <div className="h-full flex flex-row w-full bg-bg-base overflow-hidden">
      {/* Left Panel: File Tree */}
      {(!sidebarCollapsed && !focusMode) && (
        <div className={`${activeNote ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[240px] border-r border-border-subtle flex-shrink-0 bg-surface-primary`}>
          <FileTree />
        </div>
      )}

      {/* Center Panel: Editor */}
      <div className={`${!activeNote ? 'hidden md:flex' : 'flex'} flex-1 min-w-0 flex-col relative bg-bg-base`}>
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
