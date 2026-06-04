// ═══════════════════════════════════════════════════════════════
// Genten — Editor Footer
// ═══════════════════════════════════════════════════════════════

import type { Note } from '../../../types/note'
import { TypeDot } from '../../shared/TypeDot'
import { NOTE_TYPE_INFO } from '../../../types/note'

interface Props {
  note: Note
  status: 'saved' | 'saving'
}

export function EditorFooter({ note, status }: Props) {
  const typeInfo = NOTE_TYPE_INFO[note.note_type]

  return (
    <div className="absolute bottom-0 left-0 right-0 h-8 bg-surface-primary border-t border-border-subtle flex items-center px-4 justify-between text-text-tertiary text-xs font-label">
      <div className="flex items-center gap-2">
        <TypeDot type={note.note_type} size={6} />
        <span className="uppercase tracking-widest">{typeInfo.label}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <span>{note.word_count} words</span>
        <span className={status === 'saving' ? 'text-accent-violet' : ''}>
          {status === 'saving' ? 'Saving...' : 'Saved'}
        </span>
      </div>
    </div>
  )
}
