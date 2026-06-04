// ═══════════════════════════════════════════════════════════════
// Genten — Toast Component
// ═══════════════════════════════════════════════════════════════

import { X } from 'lucide-react'
import type { Toast as ToastType } from '../../hooks/useToast'

interface ToastProps {
  toast: ToastType
  onDismiss: (id: string) => void
}

const typeStyles: Record<string, { border: string; icon: string }> = {
  sync:    { border: 'border-l-accent-violet', icon: '↻' },
  error:   { border: 'border-l-accent-rose',   icon: '✕' },
  info:    { border: 'border-l-text-tertiary',  icon: 'ℹ' },
  success: { border: 'border-l-accent-teal',    icon: '✓' },
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const style = typeStyles[toast.type] ?? typeStyles['info']!

  return (
    <div
      className={`
        flex items-start gap-3 bg-surface-elevated border border-border-subtle
        ${style.border} border-l-[3px]
        rounded-lg px-4 py-3 shadow-modal
        animate-slide-up min-w-[280px] max-w-[380px]
      `}
      role="alert"
    >
      <span className="text-sm mt-0.5 flex-shrink-0 opacity-60">
        {style.icon}
      </span>

      <div className="flex-1 min-w-0">
        <p className="font-ui text-sm text-text-primary">{toast.line1}</p>
        {toast.line2 && (
          <p className="font-label text-xs text-text-tertiary mt-0.5">
            {toast.line2}
          </p>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 text-text-tertiary hover:text-text-primary transition-state p-0.5"
        aria-label="Dismiss"
      >
        <X size={12} />
      </button>
    </div>
  )
}
