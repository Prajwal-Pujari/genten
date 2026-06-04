// ═══════════════════════════════════════════════════════════════
// Genten — Problem Editor
// ═══════════════════════════════════════════════════════════════

import { useNotesStore } from '../../../store/notesStore'
import { FileTree } from '../NoteEditor/FileTree'
import { RightPanel } from '../NoteEditor/RightPanel'
import { EditorFooter } from '../NoteEditor/EditorFooter'
import { ProblemBanner } from './ProblemBanner'
import { ProblemStatement } from './ProblemStatement'
import { SolutionArea } from './SolutionArea'
import { SocraticBanner } from './SocraticBanner'

export function ProblemEditor() {
  const activeNote = useNotesStore(s => s.activeNote)
  
  if (!activeNote || activeNote.note_type !== 'problem') {
    return null
  }

  return (
    <div className="h-full flex flex-row w-full bg-bg-base overflow-hidden">
      {/* Left Panel: File Tree */}
      <div className="w-[240px] border-r border-border-subtle flex-shrink-0 bg-surface-primary">
        <FileTree />
      </div>

      {/* Center Panel: Problem Content */}
      <div className="flex-1 min-w-0 flex flex-col relative bg-bg-base">
        <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
          {/* Metadata Banner */}
          <ProblemBanner note={activeNote} />

          <div className="max-w-[680px] mx-auto px-[60px] pt-8">
            {/* Split View */}
            <div className="flex flex-col gap-8">
              <ProblemStatement note={activeNote} />
              
              <div className="h-px bg-border-subtle my-2" />
              
              <SolutionArea note={activeNote} />
            </div>
          </div>
        </div>
        
        {/* Socratic TARS Banner overlay */}
        <SocraticBanner />
        
        <EditorFooter note={activeNote} status="saved" />
      </div>

      {/* Right Panel: Context */}
      <div className="w-[300px] border-l border-border-subtle flex-shrink-0 bg-surface-primary">
        <RightPanel />
      </div>
    </div>
  )
}
