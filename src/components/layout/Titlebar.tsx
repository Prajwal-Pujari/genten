// ═══════════════════════════════════════════════════════════════
// Genten — Custom Titlebar
// ═══════════════════════════════════════════════════════════════

import { Minus, Square, X } from 'lucide-react'
import { getCurrentWindow } from '@tauri-apps/api/window'

export function Titlebar() {
  const appWindow = getCurrentWindow()

  return (
    <div className="h-[30px] w-full flex justify-between items-center bg-bg-base select-none fixed top-0 left-0 right-0 z-[100]">
      {/* Title / Drag Area */}
      <div 
        data-tauri-drag-region 
        className="flex items-center h-full flex-1 px-3"
      >
        <span className="font-ui text-[11px] uppercase tracking-widest font-medium text-text-tertiary pointer-events-none">Genten</span>
      </div>

      {/* Window Controls */}
      <div className="flex h-full flex-shrink-0">
        <button
          className="w-[46px] h-full flex items-center justify-center text-text-secondary hover:bg-black/5 transition-colors"
          onClick={() => appWindow.minimize()}
        >
          <Minus size={14} />
        </button>
        <button
          className="w-[46px] h-full flex items-center justify-center text-text-secondary hover:bg-black/5 transition-colors"
          onClick={() => appWindow.toggleMaximize()}
        >
          <Square size={12} />
        </button>
        <button
          className="w-[46px] h-full flex items-center justify-center text-text-secondary hover:bg-red-500 hover:text-white transition-colors"
          onClick={() => appWindow.close()}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
