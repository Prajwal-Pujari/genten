// ═══════════════════════════════════════════════════════════════
// Genten — AppFooter (32px status bar)
// ═══════════════════════════════════════════════════════════════

import { useNotesStore } from '../../store/notesStore'
import { useConnectionStore } from '../../store/connectionStore'
import { useSettingsStore } from '../../store/settingsStore'

export function AppFooter() {
  const noteCount = useNotesStore(s => s.notes.length)
  const activeNote = useNotesStore(s => s.activeNote)
  const effectiveState = useConnectionStore(s => s.effectiveState)()
  const fileFormat = useSettingsStore(s => s.config.file_format)

  return (
    <footer className="h-8 bg-surface-primary border-t border-border-subtle flex items-center px-4 gap-4 no-select flex-shrink-0">
      {/* Left: note count */}
      <span className="font-label text-xs text-text-tertiary">
        {noteCount} note{noteCount !== 1 ? 's' : ''}
      </span>

      {/* Center: active note info */}
      {activeNote && (
        <span className="font-label text-xs text-text-tertiary truncate flex-1 text-center">
          {activeNote.title}
          <span className="mx-1">·</span>
          {activeNote.word_count} words
        </span>
      )}

      {!activeNote && <span className="flex-1" />}

      {/* Right: format + connection */}
      <span className="font-code text-xs text-text-tertiary uppercase">
        {fileFormat}
      </span>

      {effectiveState !== 'unconfigured' && (
        <span className="font-label text-xs text-text-tertiary">
          {effectiveState === 'connected' ? 'TARS ✓' : 
           effectiveState === 'syncing' ? 'Syncing…' : 
           effectiveState === 'checking' ? 'Checking…' : 
           'TARS ✗'}
        </span>
      )}
    </footer>
  )
}
