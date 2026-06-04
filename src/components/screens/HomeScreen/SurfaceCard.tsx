// ═══════════════════════════════════════════════════════════════
// Genten — Surface Card (serendipitous note recall)
// ═══════════════════════════════════════════════════════════════

import { useMemo } from 'react'
import { Sparkles } from 'lucide-react'
import { useNotesStore } from '../../../store/notesStore'
import { useUIStore } from '../../../store/uiStore'
import { daysAgo } from '../../../utils/dateFormat'

export function SurfaceCard() {
  const notes = useNotesStore(s => s.notes)
  const openNote = useNotesStore(s => s.openNote)
  const navigate = useUIStore(s => s.navigate)

  // Pick a note deterministically based on date seed
  const surfacedNote = useMemo(() => {
    const candidates = notes.filter(n => n.content.trim().length > 20)
    if (candidates.length === 0) return null

    // Seeded by today's date
    const today = new Date()
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
    const idx = seed % candidates.length
    return candidates[idx] ?? null
  }, [notes])

  if (!surfacedNote) {
    return (
      <div className="bg-surface-low border border-border-subtle rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-surface-high border-b border-border-subtle">
          <span className="text-section-label">SURFACE</span>
          <Sparkles size={14} className="text-text-tertiary" />
        </div>
        <div className="px-4 py-4">
          <p className="font-prose text-sm text-text-tertiary italic">
            Write a few notes and something will surface here.
          </p>
        </div>
      </div>
    )
  }

  const days = daysAgo(surfacedNote.created_at)
  const preview = surfacedNote.content
    .replace(/^---[\s\S]*?---\n?/, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/[*_~`]/g, '')
    .trim()
    .slice(0, 140)

  return (
    <div
      onClick={() => {
        openNote(surfacedNote.id)
        navigate('editor')
      }}
      className="bg-surface-low border border-border-subtle rounded-lg overflow-hidden cursor-pointer hover:bg-surface transition-state"
    >
      <div className="flex items-center justify-between px-4 py-3 bg-surface-high border-b border-border-subtle">
        <span className="text-section-label">SURFACE</span>
        <span className="font-label text-[10px] text-text-tertiary uppercase">
          From {days} days ago
        </span>
      </div>
      <div className="px-4 py-4">
        <blockquote className="border-l-[3px] border-border-medium pl-4 mb-3">
          <p className="font-prose text-base italic text-text-secondary line-clamp-2">
            {preview}
          </p>
        </blockquote>
        <p className="font-label text-xs text-text-tertiary">
          — {surfacedNote.title}
        </p>
      </div>
    </div>
  )
}
