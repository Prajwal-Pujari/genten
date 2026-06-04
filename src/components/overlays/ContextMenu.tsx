// ═══════════════════════════════════════════════════════════════
// Genten — Context Menu
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from 'react'
import { useUIStore } from '../../store/uiStore'

export function ContextMenu() {
  const contextMenu = useUIStore(s => s.contextMenu)
  const hideContextMenu = useUIStore(s => s.hideContextMenu)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        hideContextMenu()
      }
    }

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [contextMenu, hideContextMenu])

  if (!contextMenu) return null

  // Ensure menu stays within viewport
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  // Estimate dimensions (actual dimensions require mounting first, but this is close enough)
  const menuWidth = 200
  const menuHeight = contextMenu.items.length * 32 + 8 // 32px per item + padding
  
  const x = Math.min(contextMenu.x, viewportWidth - menuWidth - 8)
  const y = Math.min(contextMenu.y, viewportHeight - menuHeight - 8)

  return (
    <div 
      ref={menuRef}
      className="fixed z-[100] w-[200px] bg-surface-elevated border border-border-subtle rounded-lg shadow-modal py-1 animate-fade-in"
      style={{ left: x, top: y }}
    >
      {contextMenu.items.map((item, i) => {
        if (item.divider) {
          return <div key={i} className="h-px bg-border-subtle my-1 mx-2" />
        }
        
        return (
          <button
            key={i}
            onClick={() => {
              item.action()
              hideContextMenu()
            }}
            className={`
              w-full text-left px-3 py-1.5 font-ui text-sm flex items-center justify-between cursor-pointer
              ${item.danger 
                ? 'text-accent-rose hover:bg-accent-rose/10' 
                : 'text-text-primary hover:bg-accent-violet/10 hover:text-accent-violet'
              }
            `}
          >
            {item.label}
            {item.icon && <span className="text-text-tertiary">{item.icon}</span>}
          </button>
        )
      })}
    </div>
  )
}
