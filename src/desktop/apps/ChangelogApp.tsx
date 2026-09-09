import { Suspense, lazy } from 'react'

const ChangelogPage = lazy(() => import('@/components/ChangelogPage').then((m) => ({ default: m.ChangelogPage })))

/**
 * Changelog application — version history.
 */
export default function ChangelogApp() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center font-mono text-xs text-[var(--text-muted)]">
          loading changelog…
        </div>
      }
    >
      <ChangelogPage />
    </Suspense>
  )
}