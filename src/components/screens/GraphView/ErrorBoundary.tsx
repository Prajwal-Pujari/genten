// ═══════════════════════════════════════════════════════════════
// Genten — Graph Error Boundary
// ═══════════════════════════════════════════════════════════════

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class GraphErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Graph rendering failed:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex items-center justify-center bg-[#0F0D0B]">
          <div className="text-center">
            <h2 className="font-ui text-lg text-text-primary mb-2">Graph unavailable</h2>
            <p className="font-prose text-sm text-text-tertiary italic">
              The physics simulation encountered an error.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 px-4 py-2 bg-surface text-text-primary font-ui text-xs uppercase tracking-wider rounded border border-border-subtle hover:bg-surface-elevated transition-state"
            >
              Retry
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
