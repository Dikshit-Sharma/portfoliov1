import { Suspense, lazy } from 'react'

const LabPage = lazy(() => import('@/components/LabPage').then((m) => ({ default: m.LabPage })))
const LabDetailPage = lazy(() => import('@/components/LabPage').then((m) => ({ default: m.LabDetailPage })))

/**
 * Lab application — experiments and side projects.
 * `payload.projectId` opens a specific lab project.
 */
export default function LabApp({ payload }: { payload?: Record<string, unknown> }) {
  const projectId = payload?.projectId ? String(payload.projectId) : undefined
  return projectId ? (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center font-mono text-xs text-[var(--text-muted)]">
          loading lab project…
        </div>
      }
    >
      <LabDetailPage projectId={projectId} />
    </Suspense>
  ) : (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center font-mono text-xs text-[var(--text-muted)]">
          loading lab…
        </div>
      }
    >
      <LabPage />
    </Suspense>
  )
}