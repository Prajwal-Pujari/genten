// ═══════════════════════════════════════════════════════════════
// Genten — Graph View Root
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import { GraphErrorBoundary } from './ErrorBoundary'
import { GraphRenderer } from './GraphRenderer'
import { useConnectionStore } from '../../../store/connectionStore'

export type GraphFilter = 'All' | 'Study' | 'Problems' | 'Design' | 'Diagrams'

export function GraphView() {
  const [filter, setFilter] = useState<GraphFilter>('All')
  const [semanticThreshold, setSemanticThreshold] = useState(0.5)
  const isAIConnected = useConnectionStore(s => s.effectiveState)() === 'connected'

  return (
    <div className="relative h-full w-full bg-[#0F0D0B] overflow-hidden">
      
      {/* Top-left Label */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h1 className="font-ui text-sm font-medium text-[#D8D2C8] tracking-widest uppercase opacity-70">
          {isAIConnected ? 'Explicit + Semantic Links' : 'Explicit Links'}
        </h1>
      </div>

      {/* Controls Container (Bottom) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-4">
        
        {/* Semantic Slider (AI only) */}
        {isAIConnected && (
          <div className="flex items-center gap-3 bg-[#1A1714]/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#2D2522]">
            <span className="font-ui text-[10px] text-[#9B9590] uppercase tracking-wider">Semantic Threshold</span>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.1"
              value={semanticThreshold}
              onChange={(e) => setSemanticThreshold(parseFloat(e.target.value))}
              className="w-24 accent-[#6B5CE7]"
            />
            <span className="font-code text-[10px] text-[#9B9590]">{semanticThreshold.toFixed(1)}</span>
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex bg-[#1A1714]/80 backdrop-blur-md p-1 rounded-full border border-[#2D2522]">
          {(['All', 'Study', 'Problems', 'Design', 'Diagrams'] as GraphFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-4 py-1.5 rounded-full font-ui text-xs transition-colors
                ${filter === f 
                  ? 'bg-[#2D2522] text-[#F5F0E8] shadow-sm' 
                  : 'text-[#9B9590] hover:text-[#D8D2C8]'}
              `}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* D3 Canvas */}
      <GraphErrorBoundary>
        <GraphRenderer filter={filter} semanticThreshold={semanticThreshold} />
      </GraphErrorBoundary>

    </div>
  )
}
