// ═══════════════════════════════════════════════════════════════
// Genten — TARS Context Builder
// ═══════════════════════════════════════════════════════════════

import type { Note } from '../types/note'

/**
 * Build a context string from linked notes for TARS conversations.
 * Provides the AI with relevant context from the knowledge graph.
 */
export function buildContext(activeNote: Note, linkedNotes: Note[]): string {
  const parts: string[] = []

  // Current note context
  parts.push(`## Current Note: ${activeNote.title}`)
  parts.push(`Type: ${activeNote.note_type}`)
  if (activeNote.metadata.tags.length > 0) {
    parts.push(`Tags: ${activeNote.metadata.tags.join(', ')}`)
  }
  parts.push('')
  parts.push(activeNote.content.slice(0, 2000))

  // Linked notes context
  if (linkedNotes.length > 0) {
    parts.push('')
    parts.push('## Related Notes:')
    for (const note of linkedNotes.slice(0, 5)) {
      parts.push(`### ${note.title}`)
      parts.push(note.content.slice(0, 500))
      parts.push('')
    }
  }

  return parts.join('\n')
}
