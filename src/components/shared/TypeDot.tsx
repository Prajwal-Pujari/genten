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
  const info = NOTE_TYPE_INFO[type] || { color: 'var(--text-tertiary)', label: String(type || 'note') }

  return (
    <span
      className={`inline-block rounded-full flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: info.color,
      }}
      aria-label={`${info.label} note`}
    />
  )
}
