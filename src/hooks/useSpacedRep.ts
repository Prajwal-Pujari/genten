// ═══════════════════════════════════════════════════════════════
// Genten — Spaced Repetition Hook
// ═══════════════════════════════════════════════════════════════

import { useMemo } from 'react'
import { useNotesStore } from '../store/notesStore'
import { isDueForReview } from '../utils/spacedRep'
import type { Note } from '../types/note'

/**
 * Returns notes due for spaced repetition review,
 * sorted by next_review date (oldest first).
 */
export function useSpacedRep() {
  const notes = useNotesStore(s => s.notes)

  const dueNotes = useMemo(() => {
    return notes
      .filter(n =>
        n.note_type === 'problem' &&
        n.metadata.spaced_rep &&
        isDueForReview(n.metadata.spaced_rep)
      )
      .sort((a, b) => {
        const aDate = a.metadata.spaced_rep?.next_review ?? ''
        const bDate = b.metadata.spaced_rep?.next_review ?? ''
        return aDate.localeCompare(bDate)
      })
  }, [notes])

  const nextDue: Note | null = dueNotes[0] ?? null

  return {
    dueNotes,
    nextDue,
    dueCount: dueNotes.length,
  }
}
