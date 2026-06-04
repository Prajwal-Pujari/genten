// ═══════════════════════════════════════════════════════════════
// Genten — TARS Model Router
// ═══════════════════════════════════════════════════════════════

import type { ModelConfig } from '../types/settings'

type TaskType = 'reasoning' | 'coding' | 'fast' | 'embedding'

/**
 * Routes a task to the appropriate model based on task type.
 */
export function routeModel(models: ModelConfig, task: TaskType): string {
  switch (task) {
    case 'reasoning': return models.reasoning
    case 'coding':    return models.coding
    case 'fast':      return models.fast
    case 'embedding': return models.embeddings
  }
}

/**
 * Determine the appropriate task type from a user query.
 * Simple heuristic — will be enhanced with the FastAPI router in Phase 5.
 */
export function classifyTask(query: string): TaskType {
  const lower = query.toLowerCase()

  if (lower.includes('code') || lower.includes('implement') || lower.includes('function') || lower.includes('algorithm')) {
    return 'coding'
  }

  if (lower.includes('explain') || lower.includes('why') || lower.includes('how') || lower.includes('analyze')) {
    return 'reasoning'
  }

  return 'fast'
}
