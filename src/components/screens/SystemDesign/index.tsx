// ═══════════════════════════════════════════════════════════════
// Genten — System Design Editor Root
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { Canvas } from './Canvas'
import { useNotesStore } from '../../../store/notesStore'
import { EditorArea } from '../NoteEditor/EditorArea'
import { FileTree } from '../NoteEditor/FileTree'

type ViewMode = 'edit' | 'canvas' | 'split'

export function SystemDesignEditor() {
  const activeNote = useNotesStore(s => s.activeNote)
  const [view, setView] = useState<ViewMode>('split')

  if (!activeNote || activeNote.note_type !== 'system_design') {
    return null
  }

  return (
    <div className="h-full flex flex-col w-full bg-bg-base overflow-hidden">
      
      {/* Top Bar: View Toggle */}
      <div className="h-12 border-b border-border-subtle bg-surface flex items-center justify-center shrink-0">
        <div className="flex bg-surface-elevated p-1 rounded-lg border border-border-subtle">
          {(['edit', 'canvas', 'split'] as ViewMode[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`
                px-4 py-1 rounded font-ui text-xs uppercase tracking-wider transition-colors
                ${view === v 
                  ? 'bg-accent-espresso text-[#F5F0E8] shadow-sm' 
                  : 'text-text-secondary hover:text-text-primary'}
              `}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 flex flex-row">
        {/* Optional FileTree based on view (only if fully in edit mode) */}
        {view === 'edit' && (
          <div className="w-[240px] border-r border-border-subtle flex-shrink-0 bg-surface-primary">
            <FileTree />
          </div>
        )}

        {/* Markdown Editor */}
        {(view === 'edit' || view === 'split') && (
          <div className={`flex flex-col relative bg-bg-base ${view === 'split' ? 'w-[400px] border-r border-border-subtle flex-shrink-0' : 'flex-1'}`}>
            <EditorArea />
          </div>
        )}

        {/* React Flow Canvas */}
        {(view === 'canvas' || view === 'split') && (
          <div className="flex-1 relative bg-[#F5F0E8]">
            <ReactFlowProvider>
              <Canvas />
            </ReactFlowProvider>
          </div>
        )}
      </div>
    </div>
  )
}
