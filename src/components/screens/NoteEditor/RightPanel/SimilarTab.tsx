// ═══════════════════════════════════════════════════════════════
// Genten — Similar Tab (Vector Search)
// ═══════════════════════════════════════════════════════════════

import { Sparkles } from 'lucide-react'
import { useConnectionStore } from '../../../../store/connectionStore'

export function SimilarTab() {
  const effectiveState = useConnectionStore(s => s.effectiveState)()

  // Feature stub for Phase 5 (requires PostgreSQL pgvector)
  return (
    <div className="p-6 flex flex-col items-center justify-center text-center h-full">
      <Sparkles size={32} className="text-text-tertiary mb-4" />
      <p className="font-ui text-sm text-text-secondary mb-2">Semantic Search</p>
      
      {effectiveState === 'unconfigured' ? (
        <p className="font-prose text-xs text-text-tertiary italic">
          Configure PostgreSQL and TARS to find semantically similar notes automatically.
        </p>
      ) : (
        <p className="font-prose text-xs text-text-tertiary italic">
          Coming in Phase 5 when pgvector is integrated.
        </p>
      )}
    </div>
  )
}
