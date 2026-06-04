// ═══════════════════════════════════════════════════════════════
// Genten — Socratic Banner (TARS trigger)
// ═══════════════════════════════════════════════════════════════

import { HelpCircle } from 'lucide-react'
import { useUIStore } from '../../../store/uiStore'

export function SocraticBanner() {
  const setTab = useUIStore(s => s.setActiveEditorTab)

  return (
    <div className="absolute bottom-12 right-[60px] bg-surface-elevated border border-border-subtle shadow-modal rounded-full px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-surface-highest transition-state group"
         onClick={() => setTab('tars')}>
      <HelpCircle size={16} className="text-accent-violet" />
      <span className="font-ui text-sm text-text-primary group-hover:text-accent-violet transition-state">
        Ask TARS for a hint
      </span>
    </div>
  )
}
