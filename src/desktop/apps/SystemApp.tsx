import { Suspense, lazy } from 'react'

const SystemPage = lazy(() => import('@/components/SystemPage').then((m) => ({ default: m.SystemPage })))

/**
 * System application — environment, integrations, architecture, about.
 */
export default function SystemApp() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center font-mono text-xs text-[var(--text-muted)]">
          loading system…
        </div>
      }
    >
      <SystemPage />
    </Suspense>
  )
}