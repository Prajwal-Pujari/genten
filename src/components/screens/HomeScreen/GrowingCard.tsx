// ═══════════════════════════════════════════════════════════════
// Genten — Growing Card (cluster/topic progress)
// ═══════════════════════════════════════════════════════════════

import { Layers } from 'lucide-react'
import { useMemo } from 'react'
import { useNotesStore } from '../../../store/notesStore'

export function GrowingCard() {
  const notes = useNotesStore(s => s.notes)

  // Find the most active topic (most linked)
  const topTopic = useMemo(() => {
    const tagCounts = new Map<string, number>()
    for (const note of notes) {
      for (const tag of note.metadata.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
      }
    }
    let bestTag = ''
    let bestCount = 0
    tagCounts.forEach((count, tag) => {
      if (count > bestCount) {
        bestTag = tag
        bestCount = count
      }
    })
    return { name: bestTag, count: bestCount, total: notes.length }
  }, [notes])

  const progress = topTopic.total > 0
    ? Math.round((topTopic.count / topTopic.total) * 100)
    : 0

  return (
    <div className="bg-surface-low border border-border-subtle rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-high border-b border-border-subtle">
        <span className="text-section-label">GROWING</span>
        <Layers size={14} className="text-text-tertiary" />
      </div>

      {/* Body */}
      <div className="px-4 py-4">
        {topTopic.name ? (
          <>
            <p className="font-ui text-base text-text-primary mb-1">
              {topTopic.name}
            </p>
            <p className="font-prose text-sm text-text-secondary mb-3">
              Your most active topic area.
            </p>
            {/* Progress bar */}
            <div className="h-0.5 bg-border-subtle rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-accent-violet rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="font-label text-xs text-text-tertiary">
              {topTopic.count} note{topTopic.count !== 1 ? 's' : ''} · {progress}% of vault
            </p>
          </>
        ) : (
          <p className="font-prose text-sm text-text-tertiary italic">
            Add tags to your notes to see growth patterns.
          </p>
        )}
      </div>
    </div>
  )
}
