// ═══════════════════════════════════════════════════════════════
// Genten — Right Panel (Context Tabs)
// ═══════════════════════════════════════════════════════════════

import { Link, Zap, Sparkles } from 'lucide-react'
import { useUIStore } from '../../../../store/uiStore'
import { LinksTab } from './LinksTab'
import { TARSTab } from './TARSTab'
import { SimilarTab } from './SimilarTab'

export function RightPanel() {
  const activeTab = useUIStore(s => s.activeEditorTab)
  const setTab = useUIStore(s => s.setActiveEditorTab)

  return (
    <div className="h-full flex flex-col">
      {/* Tabs Header */}
      <div className="flex px-2 py-2 border-b border-border-subtle bg-surface-high">
        <TabButton
          active={activeTab === 'links'}
          onClick={() => setTab('links')}
          icon={<Link size={14} />}
          label="Links"
        />
        <TabButton
          active={activeTab === 'tars'}
          onClick={() => setTab('tars')}
          icon={<Zap size={14} />}
          label="TARS"
        />
        <TabButton
          active={activeTab === 'similar'}
          onClick={() => setTab('similar')}
          icon={<Sparkles size={14} />}
          label="Similar"
        />
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto bg-surface-primary">
        {activeTab === 'links' && <LinksTab />}
        {activeTab === 'tars' && <TARSTab />}
        {activeTab === 'similar' && <SimilarTab />}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, icon, label }: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-label uppercase tracking-wider transition-state
        ${active 
          ? 'bg-surface-elevated text-text-primary shadow-sm border border-border-subtle' 
          : 'text-text-tertiary hover:text-text-secondary hover:bg-surface'
        }
      `}
    >
      {icon}
      {label}
    </button>
  )
}
