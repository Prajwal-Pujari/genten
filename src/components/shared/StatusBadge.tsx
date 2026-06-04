// ═══════════════════════════════════════════════════════════════
// Genten — StatusBadge (Attempted/Solved/Mastered)
// ═══════════════════════════════════════════════════════════════

interface StatusBadgeProps {
  status: 'attempted' | 'solved' | 'mastered'
  className?: string
}

const colors: Record<string, { bg: string; text: string }> = {
  attempted: { bg: 'rgba(212, 133, 58, 0.15)',  text: '#D4853A' },
  solved:    { bg: 'rgba(58, 138, 130, 0.15)',   text: '#3A8A82' },
  mastered:  { bg: 'rgba(107, 92, 231, 0.15)',   text: '#6B5CE7' },
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const c = colors[status]!

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded font-label text-xs uppercase tracking-wider ${className}`}
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {status}
    </span>
  )
}
