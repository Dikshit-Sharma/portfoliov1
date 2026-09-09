import { Suspense, lazy } from 'react'

const WorkPage = lazy(() => import('@/components/WorkPage').then((m) => ({ default: m.WorkPage })))
const ProjectDetailPage = lazy(() => import('@/components/WorkPage').then((m) => ({ default: m.ProjectDetailPage })))

/**
 * Projects application — catalog of work + deep-dive views.
 * `payload.projectId` opens a project deep dive; otherwise the catalog.
 */
export default function ProjectsApp({ payload }: { payload?: Record<string, unknown> }) {
  const projectId = payload?.projectId ? String(payload.projectId) : undefined
  return projectId ? (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center font-mono text-xs text-[var(--text-muted)]">
          loading project…
        </div>
      }
    >
      <ProjectDetailPage projectId={projectId} />
    </Suspense>
  ) : (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center font-mono text-xs text-[var(--text-muted)]">
          loading work…
        </div>
      }
    >
      <WorkPage />
    </Suspense>
  )
}