// ═══════════════════════════════════════════════════════════════
// Genten — NoteCard (reusable note preview)
// ═══════════════════════════════════════════════════════════════

import type { Note } from '../../types/note'
import { NOTE_TYPE_INFO } from '../../types/note'
import { TypeDot } from './TypeDot'

interface NoteCardProps {
  note: Note
  onClick?: () => void
  className?: string
}

export function NoteCard({ note, onClick, className = '' }: NoteCardProps) {
  const typeInfo = NOTE_TYPE_INFO[note.note_type] || { label: String(note.note_type || 'note'), color: 'bg-surface-high' }

  // Get first ~100 chars of content, stripping markdown
  const preview = note.content
    .replace(/^---[\s\S]*?---\n?/, '') // strip frontmatter
    .replace(/#{1,6}\s/g, '')           // strip headings
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // strip links
    .replace(/[*_~`]/g, '')             // strip formatting
    .trim()
    .slice(0, 120)

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left bg-surface-low border border-border-subtle
        rounded-lg p-4 min-h-[140px] cursor-pointer
        transition-state hover:bg-surface group
        ${className}
      `}
    >
      <div className="flex items-center gap-2 mb-2">
        <TypeDot type={note.note_type} size={6} />
        <span className="font-label text-[10px] uppercase tracking-[0.15em] text-text-tertiary">
          {typeInfo.label}
        </span>
      </div>

      <h3 className="font-ui text-base font-medium text-text-primary group-hover:text-accent-violet transition-state mb-2 line-clamp-2">
        {note.title || 'Untitled'}
      </h3>

      {preview && (
        <p className="font-prose text-sm text-text-secondary line-clamp-2">
          {preview}
        </p>
      )}
    </button>
  )
}
