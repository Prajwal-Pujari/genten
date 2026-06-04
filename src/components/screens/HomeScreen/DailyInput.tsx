// ═══════════════════════════════════════════════════════════════
// Genten — Daily Input
// ═══════════════════════════════════════════════════════════════

import { useState, useRef } from 'react'
import { useNotesStore } from '../../../store/notesStore'
import { useUIStore } from '../../../store/uiStore'
import { formatDateISO } from '../../../utils/dateFormat'

export function DailyInput() {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const createNote = useNotesStore(s => s.createNote)
  const openNote = useNotesStore(s => s.openNote)
  const notes = useNotesStore(s => s.notes)
  const navigate = useUIStore(s => s.navigate)

  const handleSubmit = async () => {
    if (!value.trim()) return

    const today = formatDateISO()
    
    // Check if today's daily note exists
    const existing = notes.find(
      n => n.note_type === 'daily' && n.file_path.includes(today)
    )

    if (existing) {
      await openNote(existing.id)
    } else {
      const note = await createNote('daily', today)
      await openNote(note.id)
    }
    
    navigate('editor')
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="mb-10">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (value.trim()) handleSubmit() }}
        placeholder="What's on your mind today..."
        className="
          w-full bg-transparent border-0 border-b border-border-subtle
          font-prose text-lg italic text-text-primary
          placeholder:text-text-tertiary placeholder:italic
          focus:border-accent-violet focus:outline-none
          transition-state py-3
        "
      />
    </div>
  )
}
