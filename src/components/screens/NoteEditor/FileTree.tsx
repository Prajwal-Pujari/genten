// ═══════════════════════════════════════════════════════════════
// Genten — File Tree
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import { ChevronRight, ChevronDown, Folder, FileText } from 'lucide-react'
import { useNotesStore } from '../../../store/notesStore'
import type { Note } from '../../../types/note'

export function FileTree() {
  const notes = useNotesStore(s => s.notes)
  const activeNote = useNotesStore(s => s.activeNote)
  const openNote = useNotesStore(s => s.openNote)

  // Group notes by type for a simple virtual tree
  const folders = {
    Daily: notes.filter(n => n.note_type === 'daily'),
    Study: notes.filter(n => n.note_type === 'study'),
    Problems: notes.filter(n => n.note_type === 'problem'),
    'System Design': notes.filter(n => n.note_type === 'system_design'),
    Captures: notes.filter(n => n.note_type === 'capture'),
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-border-subtle bg-surface-high">
        <h2 className="font-ui text-sm font-medium text-text-primary">Vault</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2 no-select">
        {Object.entries(folders).map(([name, folderNotes]) => (
          <FolderNode
            key={name}
            name={name}
            notes={folderNotes}
            activeId={activeNote?.id}
            onSelect={openNote}
          />
        ))}
      </div>
    </div>
  )
}

function FolderNode({ name, notes, activeId, onSelect }: {
  name: string
  notes: Note[]
  activeId?: string
  onSelect: (id: string) => void
}) {
  const [open, setOpen] = useState(false)

  if (notes.length === 0) return null

  return (
    <div className="mb-1">
      <div
        className="flex items-center gap-2 px-2 py-1.5 hover:bg-surface-elevated rounded cursor-pointer transition-state"
        onClick={() => setOpen(!open)}
      >
        {open ? <ChevronDown size={14} className="text-text-tertiary" /> : <ChevronRight size={14} className="text-text-tertiary" />}
        <Folder size={14} className="text-accent-espresso" />
        <span className="font-ui text-sm text-text-secondary">{name}</span>
      </div>

      {open && (
        <div className="ml-5 mt-0.5 space-y-0.5 border-l border-border-subtle pl-2">
          {notes.map(note => (
            <div
              key={note.id}
              onClick={() => onSelect(note.id)}
              className={`
                flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-state truncate
                ${activeId === note.id ? 'bg-accent-violet/10 text-accent-violet' : 'hover:bg-surface text-text-secondary'}
              `}
            >
              <FileText size={12} className={activeId === note.id ? 'text-accent-violet' : 'text-text-tertiary'} />
              <span className="font-ui text-sm truncate" title={note.title}>{note.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
