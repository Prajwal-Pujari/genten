// ═══════════════════════════════════════════════════════════════
// Genten — Date Formatting Utilities
// ═══════════════════════════════════════════════════════════════

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday',
  'Thursday', 'Friday', 'Saturday',
]

/**
 * "Friday, May 30"
 */
export function formatDateFull(date: Date = new Date()): string {
  const dayName = DAYS[date.getDay()]
  const monthName = MONTHS[date.getMonth()]
  const dayNum = date.getDate()
  return `${dayName}, ${monthName} ${dayNum}`
}

/**
 * "2025"
 */
export function formatYear(date: Date = new Date()): string {
  return date.getFullYear().toString()
}

/**
 * "2025-05-30" (for daily note filenames)
 */
export function formatDateISO(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * "May 30, 2025"
 */
export function formatDateMedium(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const monthName = MONTHS[d.getMonth()]
  return `${monthName} ${d.getDate()}, ${d.getFullYear()}`
}

/**
 * "just now", "2 mins ago", "3 hours ago", "yesterday", "May 28"
 */
export function formatRelativeTime(isoDate: string): string {
  const now = Date.now()
  const then = new Date(isoDate).getTime()
  const diff = now - then

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`

  return formatDateMedium(isoDate)
}

/**
 * "X days ago" for Surface card
 */
export function daysAgo(isoDate: string): number {
  const now = Date.now()
  const then = new Date(isoDate).getTime()
  return Math.floor((now - then) / (1000 * 60 * 60 * 24))
}
