// ═══════════════════════════════════════════════════════════════
// Genten — Quick Open Overlay (Cmd+K)
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react'
import { Search, FileText } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useNotesStore } from '../../store/notesStore'
import { TypeDot } from '../shared/TypeDot'

export function QuickOpen() {
  const visible = useUIStore(s => s.quickOpenVisible)
  const toggle = useUIStore(s => s.toggleQuickOpen)
  const navigate = useUIStore(s => s.navigate)
  const notes = useNotesStore(s => s.notes)
  const openNote = useNotesStore(s => s.openNote)
  const searchNotes = useNotesStore(s => s.searchNotes)

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = query ? searchNotes(query).slice(0, 8) : notes.slice(-8).reverse()

  useEffect(() => {
    if (visible) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [visible])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  if (!visible) return null

  const handleSelect = (id: string) => {
    openNote(id)
    navigate('editor')
    toggle()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const selected = results[selectedIndex]
      if (selected) handleSelect(selected.id)
    } else if (e.key === 'Escape') {
      // Handled globally by useKeyboard
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-bg-base/80" 
        onClick={toggle}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[540px] bg-surface-low border border-border-subtle rounded-xl shadow-modal overflow-hidden animate-slide-up">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle bg-surface">
          <Search size={18} className="text-text-tertiary" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search notes or commands..."
            className="flex-1 bg-transparent border-none font-ui text-base text-text-primary placeholder:text-text-tertiary focus:outline-none"
          />
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="p-4 text-center font-prose text-sm text-text-tertiary italic">
              No results found.
            </p>
          ) : (
            results.map((note, i) => (
              <div
                key={note.id}
                onClick={() => handleSelect(note.id)}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`
                  flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-state
                  ${i === selectedIndex ? 'bg-accent-violet/10' : 'hover:bg-surface'}
                `}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={14} className={i === selectedIndex ? 'text-accent-violet' : 'text-text-tertiary'} />
                  <span className={`font-ui text-sm truncate ${i === selectedIndex ? 'text-accent-violet' : 'text-text-primary'}`}>
                    {note.title}
                  </span>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <span className="font-label text-[10px] text-text-tertiary uppercase">{note.note_type}</span>
                  <TypeDot type={note.note_type} size={6} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
