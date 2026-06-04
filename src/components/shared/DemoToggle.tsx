// ═══════════════════════════════════════════════════════════════
// Genten — Demo Mode Toggle Pill
// ═══════════════════════════════════════════════════════════════

import { useConnectionStore } from '../../store/connectionStore'

export function DemoToggle() {
  const demoMode = useConnectionStore(s => s.demoMode)
  const demoOverride = useConnectionStore(s => s.demoOverride)

  if (!demoMode) return null

  return (
    <div className="fixed top-3 right-3 z-[90] flex items-center gap-2 bg-accent-violet/10 border border-accent-violet/30 rounded-full px-3 py-1">
      <span className="w-2 h-2 rounded-full bg-accent-violet animate-pulse" />
      <span className="font-label text-xs text-accent-violet">
        Demo: {demoOverride ?? 'connected'}
      </span>
    </div>
  )
}
