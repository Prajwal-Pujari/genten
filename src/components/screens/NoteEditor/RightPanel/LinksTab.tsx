// ═══════════════════════════════════════════════════════════════
// Genten — Links Tab
// ═══════════════════════════════════════════════════════════════

import { useNotesStore } from '../../../../store/notesStore'
import { NoteCard } from '../../../shared/NoteCard'

export function LinksTab() {
  const activeNote = useNotesStore(s => s.activeNote)
  const getLinkedNotes = useNotesStore(s => s.getLinkedNotes)
  const getBacklinks = useNotesStore(s => s.getBacklinks)
  const openNote = useNotesStore(s => s.openNote)

  if (!activeNote) return null

  const linked = getLinkedNotes(activeNote.id)
  const backlinks = getBacklinks(activeNote.id)

  return (
    <div className="p-4 space-y-6">
      {/* Forward Links */}
      <div>
        <h3 className="text-section-label mb-3">LINKS OUT</h3>
        {linked.length === 0 ? (
          <p className="font-prose text-sm text-text-tertiary italic">No links in this note.</p>
        ) : (
          <div className="space-y-3">
            {linked.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => openNote(note.id)}
                className="!min-h-0 !p-3"
              />
            ))}
          </div>
        )}
      </div>

      {/* Backlinks */}
      <div>
        <h3 className="text-section-label mb-3">BACKLINKS</h3>
        {backlinks.length === 0 ? (
          <p className="font-prose text-sm text-text-tertiary italic">No notes link here.</p>
        ) : (
          <div className="space-y-3">
            {backlinks.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => openNote(note.id)}
                className="!min-h-0 !p-3"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
