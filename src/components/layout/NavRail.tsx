// ═══════════════════════════════════════════════════════════════
// Genten — NavRail (52px left navigation)
// ═══════════════════════════════════════════════════════════════

import {
  Home,
  FileText,
  GitBranch,
  Settings,
  Zap,
} from 'lucide-react'
import { useUIStore, type ScreenId } from '../../store/uiStore'
import { useConnectionStore } from '../../store/connectionStore'
import { ConnectionDot } from '../shared/ConnectionDot'

interface NavItem {
  id: ScreenId
  icon: React.ReactNode
  label: string
  requiresConnection?: boolean
}

const navItems: NavItem[] = [
  { id: 'home',  icon: <Home size={20} />,     label: 'Home' },
  { id: 'editor', icon: <FileText size={20} />, label: 'Notes' },
  { id: 'graph',  icon: <GitBranch size={20} />, label: 'Graph' },
]

export function NavRail() {
  const activeScreen = useUIStore(s => s.activeScreen)
  const navigate = useUIStore(s => s.navigate)
  const toggleTARS = useUIStore(s => s.toggleTARS)
  const connectionState = useConnectionStore(s => s.effectiveState)
  const effectiveState = connectionState()

  // Always show TARS button now that it's a backend multi-agent system
  const showTARSButton = true

  return (
    <nav className="
      z-50
      md:w-[52px] md:h-full md:border-r md:border-t-0 md:flex-col md:py-3 md:justify-start
      w-full h-[60px] border-t flex-row py-0
      bg-surface-primary border-border-subtle flex items-center justify-around no-select flex-shrink-0
    ">
      {/* Logo - Hide on mobile */}
      <div className="hidden md:flex w-8 h-8 items-center justify-center mb-6">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="3" fill="#6B5CE7" />
          <circle cx="10" cy="10" r="8" stroke="#6B5CE7" strokeWidth="1.5" fill="none" opacity="0.3" />
        </svg>
      </div>

      {/* Navigation items */}
      <div className="flex flex-1 md:flex-none md:flex-col items-center justify-evenly md:justify-center w-full md:w-auto px-2 md:px-0 md:gap-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            title={item.label}
            className={`
              w-10 h-10 md:w-9 md:h-9 flex items-center justify-center rounded-md
              transition-state cursor-pointer
              ${activeScreen === item.id
                ? 'text-accent-violet bg-accent-violet/10'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
              }
            `}
          >
            {item.icon}
          </button>
        ))}

        {/* TARS button — hidden when unconfigured */}
        {showTARSButton && (
          <button
            onClick={toggleTARS}
            title="TARS"
            className="w-10 h-10 md:w-9 md:h-9 flex items-center justify-center rounded-md text-text-secondary hover:text-accent-violet hover:bg-surface-elevated transition-state cursor-pointer md:mt-1"
          >
            <Zap size={20} />
          </button>
        )}
      </div>

      {/* Bottom section — connection + settings */}
      <div className="flex md:flex-col items-center justify-center px-4 md:px-0 mt-0 md:mt-auto flex-shrink-0">
        {/* Connection status dot - hidden on mobile for space */}
        {effectiveState !== 'unconfigured' && (
          <div className="hidden md:flex items-center justify-center" title={`TARS: ${effectiveState}`}>
            <ConnectionDot state={effectiveState} size={6} />
          </div>
        )}

        {/* Settings gear */}
        <button
          onClick={() => navigate('settings')}
          title="Settings"
          className={`
            w-10 h-10 md:w-9 md:h-9 flex items-center justify-center rounded-md
            transition-state cursor-pointer
            ${activeScreen === 'settings'
              ? 'text-accent-violet bg-accent-violet/10'
              : 'text-text-tertiary hover:text-text-primary hover:bg-surface-elevated'
            }
          `}
        >
          <Settings size={18} />
        </button>
      </div>
    </nav>
  )
}
