// ═══════════════════════════════════════════════════════════════
// Genten — Recent Notes (2×2 grid)
// ═══════════════════════════════════════════════════════════════

import { useNotesStore } from '../../../store/notesStore'
import { useUIStore } from '../../../store/uiStore'
import { NoteCard } from '../../shared/NoteCard'

export function RecentNotes() {
  const recentNotes = useNotesStore(s => s.recentNotes)
  const notes = useNotesStore(s => s.notes)
  const openNote = useNotesStore(s => s.openNote)
  const navigate = useUIStore(s => s.navigate)

  // Use recent notes, or fall back to latest 4 notes
  const displayed = recentNotes.length > 0
    ? recentNotes.slice(0, 4)
    : notes.slice(-4).reverse()

  if (displayed.length === 0) {
    return (
      <div>
        <p className="text-section-label mb-3">RECENT</p>
        <p className="font-prose text-sm text-text-tertiary italic">
          No notes yet. Create your first note to get started.
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-section-label mb-3">RECENT</p>
      <div className="grid grid-cols-2 gap-4">
        {displayed.map(note => (
          <NoteCard
            key={note.id}
            note={note}
            onClick={() => {
              openNote(note.id)
              navigate('editor')
            }}
          />
        ))}
      </div>
    </div>
  )
}
