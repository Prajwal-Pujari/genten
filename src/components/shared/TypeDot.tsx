// ═══════════════════════════════════════════════════════════════
// Genten — TypeDot (colored note type indicator)
// ═══════════════════════════════════════════════════════════════

import type { NoteType } from '../../types/note'
import { NOTE_TYPE_INFO } from '../../types/note'

interface TypeDotProps {
  type: NoteType
  size?: number
  className?: string
}

export function TypeDot({ type, size = 6, className = '' }: TypeDotProps) {
  const color = NOTE_TYPE_INFO[type].color

  return (
    <span
      className={`inline-block rounded-full flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
      }}
      aria-label={`${NOTE_TYPE_INFO[type].label} note`}
    />
  )
}
