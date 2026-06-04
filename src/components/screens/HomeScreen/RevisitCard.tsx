// ═══════════════════════════════════════════════════════════════
// Genten — Revisit Card (Spaced Repetition Queue)
// ═══════════════════════════════════════════════════════════════

import { RotateCcw } from 'lucide-react'
import { useSpacedRep } from '../../../hooks/useSpacedRep'
import { useNotesStore } from '../../../store/notesStore'
import { useUIStore } from '../../../store/uiStore'

export function RevisitCard() {
  const { nextDue, dueCount } = useSpacedRep()
  const openNote = useNotesStore(s => s.openNote)
  const navigate = useUIStore(s => s.navigate)

  const handleClick = () => {
    if (nextDue) {
      openNote(nextDue.id)
      navigate('problem')
    }
  }

  return (
    <div
      onClick={handleClick}
      className="bg-surface-low border border-border-subtle rounded-lg overflow-hidden cursor-pointer hover:bg-surface transition-state"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-high border-b border-border-subtle">
        <span className="text-section-label">REVISIT</span>
        <RotateCcw size={14} className="text-text-tertiary" />
      </div>

      {/* Body */}
      <div className="px-4 py-4">
        {nextDue ? (
          <>
            <p className="font-code text-[11px] text-text-tertiary mb-1">
              Spaced Repetition Queue · {dueCount} due
            </p>
            <p className="font-ui text-base text-text-primary mb-1">
              {nextDue.title}
            </p>
            <p className="font-prose text-sm text-text-secondary line-clamp-2 mb-3">
              {nextDue.content.slice(0, 80)}
            </p>
            {nextDue.metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {nextDue.metadata.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 border border-border-subtle rounded font-label text-[11px] text-text-tertiary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="font-prose text-sm text-text-tertiary italic">
            No problems due for review today.
          </p>
        )}
      </div>
    </div>
  )
}
