// ═══════════════════════════════════════════════════════════════
// Genten — DifficultyBadge (Easy/Medium/Hard pill)
// ═══════════════════════════════════════════════════════════════

interface DifficultyBadgeProps {
  difficulty: 'easy' | 'medium' | 'hard'
  className?: string
}

const colors: Record<string, { bg: string; text: string }> = {
  easy:   { bg: 'rgba(58, 138, 130, 0.15)', text: '#3A8A82' },
  medium: { bg: 'rgba(212, 133, 58, 0.15)',  text: '#D4853A' },
  hard:   { bg: 'rgba(196, 98, 106, 0.15)',  text: '#C4626A' },
}

export function DifficultyBadge({ difficulty, className = '' }: DifficultyBadgeProps) {
  const c = colors[difficulty]!

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded font-label text-xs uppercase tracking-wider ${className}`}
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {difficulty}
    </span>
  )
}
