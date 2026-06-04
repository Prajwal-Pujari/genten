// ═══════════════════════════════════════════════════════════════
// Genten — Problem Banner (Metadata)
// ═══════════════════════════════════════════════════════════════

import type { Note } from '../../../types/note'
import { DifficultyBadge } from '../../shared/DifficultyBadge'
import { StatusBadge } from '../../shared/StatusBadge'

export function ProblemBanner({ note }: { note: Note }) {
  const { difficulty, status, platform } = note.metadata

  return (
    <div className="bg-surface border-b border-border-subtle px-[60px] py-4">
      <div className="max-w-[680px] mx-auto flex items-center justify-between">
        
        {/* Left: Title + Platform */}
        <div className="flex items-center gap-4">
          <h1 className="font-ui text-xl font-semibold text-text-primary tracking-[-0.02em]">
            {note.title || 'Untitled Problem'}
          </h1>
          {platform && (
            <span className="font-code text-xs text-text-tertiary">
              {platform}
            </span>
          )}
        </div>

        {/* Right: Badges */}
        <div className="flex items-center gap-3">
          {difficulty && <DifficultyBadge difficulty={difficulty as any} />}
          {status && <StatusBadge status={status as any} />}
        </div>
        
      </div>
    </div>
  )
}
