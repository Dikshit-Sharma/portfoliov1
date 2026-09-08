import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Section label used in the fallback message (e.g. "GitHub", "knowledge graph"). */
  label?: string
  /** Optional custom fallback UI. */
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * Error boundary — prevents a single failing section (dashboard widget,
 * knowledge graph, terminal...) from blanking the whole application.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep class signature (stateful boundary); log without exposing internals.
    console.error(`[ErrorBoundary:${this.props.label ?? 'section'}]`, error, info.componentStack)
  }

  private reset = () => this.setState({ hasError: false })

  render() {
    const { children, fallback, label = 'this section' } = this.props
    if (!this.state.hasError) return children

    if (fallback) return fallback

    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 text-center">
        <p className="font-mono text-[11px] tracking-[0.16em] text-indigo-400 uppercase">Error</p>
        <p className="mt-2 text-sm text-[var(--color-fg)]">Something went wrong loading {label}.</p>
        <button
          type="button"
          onClick={this.reset}
          className="mt-4 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-fg)] hover:border-indigo-400/50"
        >
          Try again
        </button>
      </div>
    )
  }
}