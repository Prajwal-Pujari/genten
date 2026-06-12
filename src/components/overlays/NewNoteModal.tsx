import { useState, useEffect, useRef } from 'react'
import { FilePlus2, X } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useNotesStore } from '../../store/notesStore'
import type { NoteType } from '../../types/note'
import { NOTE_TYPE_INFO } from '../../types/note'

export function NewNoteModal() {
  const visible = useUIStore(s => s.newNoteModalVisible)
  const toggle = useUIStore(s => s.toggleNewNoteModal)
  const createNote = useNotesStore(s => s.createNote)
  const navigate = useUIStore(s => s.navigate)

  const [title, setTitle] = useState('')
  const [type, setType] = useState<NoteType>('capture')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (visible) {
      setTitle('')
      setType('capture')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [visible])

  if (!visible) return null

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!title.trim()) return

    const newNote = await createNote(type, title.trim())
    toggle()
    
    // Auto-navigate to editor if not already there
    if (newNote) {
      if (type === 'problem') navigate('problem')
      else if (type === 'system_design') navigate('sysdesign')
      else navigate('editor')
    }
  }

  const types: { id: NoteType, label: string }[] = [
    { id: 'capture', label: 'Quick Capture' },
    { id: 'study', label: 'Study Note' },
    { id: 'problem', label: 'Problem Solving' },
    { id: 'system_design', label: 'System Design' },
    { id: 'diagram', label: 'Diagram' },
    { id: 'canvas', label: 'Canvas' },
    { id: 'daily', label: 'Daily Note' },
    { id: 'expense', label: 'Expense Tracker' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#1A1714]/40 backdrop-blur-[2px]" 
        onClick={toggle} 
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md bg-surface-primary rounded-xl shadow-modal border border-border-subtle overflow-hidden animate-fade-in"
      >
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between bg-surface-high">
          <div className="flex items-center gap-2">
            <FilePlus2 size={18} className="text-accent-violet" />
            <h2 className="font-ui text-base font-medium text-text-primary">Create New Note</h2>
          </div>
          <button 
            onClick={toggle}
            className="p-1 rounded hover:bg-surface-elevated text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-5 space-y-5">
          <div>
            <label className="block font-ui text-xs uppercase tracking-wider text-text-secondary mb-2">
              Note Title
            </label>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Binary Search Trees"
              className="w-full bg-surface border border-border-subtle rounded-md px-3 py-2 font-ui text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-violet focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block font-ui text-xs uppercase tracking-wider text-text-secondary mb-2">
              Note Type / Folder
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as NoteType)}
              className="w-full bg-surface border border-border-subtle rounded-md px-3 py-2 font-ui text-sm text-text-primary focus:border-accent-violet focus:outline-none transition-colors"
            >
              {types.map(t => (
                <option key={t.id} value={t.id}>
                  {t.label} (→ /{NOTE_TYPE_INFO[t.id].folder})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={toggle}
              className="px-4 py-2 rounded font-ui text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 rounded bg-accent-violet text-white font-ui text-sm font-medium hover:bg-[#5a4cdb] disabled:opacity-50 transition-colors"
            >
              Create Note
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
