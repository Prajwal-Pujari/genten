// ═══════════════════════════════════════════════════════════════
// Genten — Toast Container (stack manager)
// ═══════════════════════════════════════════════════════════════

import { useToast } from '../../hooks/useToast'
import { Toast } from './Toast'

export function ToastContainer() {
  const { toasts, dismissToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  )
}
