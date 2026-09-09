import { Suspense, lazy } from 'react'

const RecruiterPage = lazy(() => import('@/components/RecruiterPage').then((m) => ({ default: m.RecruiterPage })))

/**
 * Recruiter application — the simplified professional profile.
 */
export default function RecruiterApp() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center font-mono text-xs text-[var(--text-muted)]">
          loading profile…
        </div>
      }
    >
      <RecruiterPage />
    </Suspense>
  )
}