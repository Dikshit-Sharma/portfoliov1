import { Suspense, lazy } from 'react'

const ArchitecturePage = lazy(() => import('@/desktop/apps/ArchitectureAppContent').then((m) => ({ default: m.default })))

/**
 * Architecture application — system inspector.
 * Shows the data-driven architecture maps as an inspectable diagram.
 */
export default function ArchitectureApp() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center font-mono text-xs text-[var(--text-muted)]">
          loading architecture…
        </div>
      }
    >
      <ArchitecturePage />
    </Suspense>
  )
}