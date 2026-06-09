// ═══════════════════════════════════════════════════════════════
// Genten — File Tree
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import { ChevronRight, ChevronDown, Folder, FileText, Plus, Trash2 } from 'lucide-react'
import { useNotesStore } from '../../../store/notesStore'
import { useUIStore } from '../../../store/uiStore'
import type { Note } from '../../../types/note'

export function FileTree() {
  const notes = useNotesStore(s => s.notes)
  const activeNote = useNotesStore(s => s.activeNote)
  const openNote = useNotesStore(s => s.openNote)
  const toggleNewNoteModal = useUIStore(s => s.toggleNewNoteModal)

  // Group notes by type for a simple virtual tree
  const folders = {
    Daily: notes.filter(n => n.note_type === 'daily'),
    Study: notes.filter(n => n.note_type === 'study'),
    Problems: notes.filter(n => n.note_type === 'problem'),
    'System Design': notes.filter(n => n.note_type === 'system_design'),
    Captures: notes.filter(n => n.note_type === 'capture'),
  }

  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, noteId: string, title: string } | null>(null)

  return (
    <div className="h-full flex flex-col relative">
      <div className="p-3 border-b border-border-subtle bg-surface-high flex items-center justify-between">
        <h2 className="font-ui text-sm font-medium text-text-primary">Vault</h2>
        <button 
          onClick={toggleNewNoteModal}
          title="New Note"
          className="text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
        >
          <Plus size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 no-select">
        {Object.entries(folders).map(([name, folderNotes]) => (
          <FolderNode
            key={name}
            name={name}
            notes={folderNotes}
            activeId={activeNote?.id}
            onSelect={openNote}
            onContextMenuOpen={(x, y, noteId, title) => setContextMenu({ x, y, noteId, title })}
          />
        ))}
      </div>

      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setContextMenu(null)} 
            onContextMenu={(e) => { e.preventDefault(); setContextMenu(null) }} 
          />
          <div 
            className="fixed z-50 bg-surface-elevated border border-border-subtle rounded-md shadow-lg py-1 w-48"
            style={{ top: Math.min(contextMenu.y, window.innerHeight - 50), left: contextMenu.x }}
          >
            <button 
              className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-surface-high hover:text-red-500 flex items-center gap-2 transition-colors cursor-pointer"
              onClick={() => {
                if (window.confirm(`Delete "${contextMenu.title}"?`)) {
                  useNotesStore.getState().deleteNote(contextMenu.noteId)
                }
                setContextMenu(null)
              }}
            >
              <Trash2 size={14} /> Delete Note
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function FolderNode({ name, notes, activeId, onSelect, onContextMenuOpen }: {
  name: string
  notes: Note[]
  activeId?: string
  onSelect: (id: string) => void
  onContextMenuOpen: (x: number, y: number, noteId: string, title: string) => void
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
              onContextMenu={(e) => {
                e.preventDefault()
                onContextMenuOpen(e.clientX, e.clientY, note.id, note.title)
              }}
              title="Right-click to delete"
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
