// ═══════════════════════════════════════════════════════════════
// Genten — SM-2 Spaced Repetition Algorithm
// ═══════════════════════════════════════════════════════════════

import type { SpacedRepData } from '../types/note'

/**
 * SM-2 quality ratings:
 * 0 — Complete blackout
 * 1 — Incorrect; correct answer remembered after seeing it
 * 2 — Incorrect; correct answer seemed easy to recall
 * 3 — Correct, but required significant effort
 * 4 — Correct, with some hesitation
 * 5 — Perfect recall
 */
export type SM2Quality = 0 | 1 | 2 | 3 | 4 | 5

export interface SM2Result {
  interval_days: number
  review_count: number
  next_review: string
  last_reviewed: string
}

/**
 * Calculate the next spaced repetition interval using SM-2 algorithm.
 */
export function calculateNextReview(
  current: SpacedRepData | null,
  quality: SM2Quality
): SM2Result {
  const now = new Date().toISOString()

  if (!current) {
    // First review
    const intervalDays = quality >= 3 ? 1 : 0
    return {
      interval_days: intervalDays,
      review_count: 1,
      last_reviewed: now,
      next_review: addDays(now, intervalDays),
    }
  }

  let { interval_days, review_count } = current

  if (quality < 3) {
    // Failed — reset interval
    interval_days = 1
    review_count = 0
  } else {
    // Passed — increase interval
    review_count += 1
    if (review_count === 1) {
      interval_days = 1
    } else if (review_count === 2) {
      interval_days = 6
    } else {
      // EF (easiness factor) simplified
      const ef = Math.max(1.3, 2.5 + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
      interval_days = Math.round(interval_days * ef)
    }
  }

  return {
    interval_days,
    review_count,
    last_reviewed: now,
    next_review: addDays(now, interval_days),
  }
}

/**
 * Get notes that are due for review.
 */
export function isDueForReview(spacedRep: SpacedRepData | undefined): boolean {
  if (!spacedRep) return false
  return new Date(spacedRep.next_review) <= new Date()
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(isoDate)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}
