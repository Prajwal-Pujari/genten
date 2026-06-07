// ═══════════════════════════════════════════════════════════════
// Genten — Home Screen
// ═══════════════════════════════════════════════════════════════

import { DailyInput } from './DailyInput'
import { RecentNotes } from './RecentNotes'
import { RevisitCard } from './RevisitCard'
import { GrowingCard } from './GrowingCard'
import { SurfaceCard } from './SurfaceCard'
import { ConnectionCard } from './ConnectionCard'
import { formatDateFull, formatYear } from '../../../utils/dateFormat'

export function HomeScreen() {
  const today = new Date()

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 p-6 md:p-10 max-w-[1200px] mx-auto">
        {/* Left column — 60% */}
        <div className="flex-[3] min-w-0">
          {/* Date block */}
          <div className="mb-8">
            <h1 className="font-ui text-2xl font-semibold text-text-primary tracking-[-0.02em]">
              {formatDateFull(today)}
            </h1>
            <p className="font-ui text-sm text-text-tertiary mt-1">
              {formatYear(today)}
            </p>
          </div>

          {/* Daily input */}
          <DailyInput />

          {/* Recent notes */}
          <RecentNotes />
        </div>

        {/* Right column — 40% */}
        <div className="flex-[2] min-w-0 flex flex-col gap-4">
          <RevisitCard />
          <GrowingCard />
          <SurfaceCard />
          <ConnectionCard />
        </div>
      </div>
    </div>
  )
}
