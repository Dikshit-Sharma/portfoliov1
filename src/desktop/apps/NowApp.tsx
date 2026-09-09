import { Suspense, lazy } from 'react'

const NowPage = lazy(() => import('@/components/NowPage').then((m) => ({ default: m.NowPage })))

/**
 * Now application — currently building, learning, experimenting.
 */
export default function NowApp() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center font-mono text-xs text-[var(--text-muted)]">
          loading now…
        </div>
      }
    >
      <NowPage />
    </Suspense>
  )
}