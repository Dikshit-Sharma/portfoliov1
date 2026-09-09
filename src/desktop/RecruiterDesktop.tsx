import { Suspense, lazy } from 'react'
import { useDesktop } from './DesktopContext'
import { buttonClass } from '@/components/ui/button'

const RecruiterPage = lazy(() => import('@/components/RecruiterPage').then((m) => ({ default: m.RecruiterPage })))

/**
 * Recruiter desktop preset — a clean professional workspace.
 * Advanced OS features (terminal, graph, architecture complexity) are
 * hidden by default; the shell remains recognizable.
 */
export function RecruiterDesktop() {
  const { setView, setWorkspace } = useDesktop()

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col px-4 py-6 sm:px-6">
      <div className="pointer-events-auto mb-4 flex items-center justify-between">
        <p className="font-mono text-xs text-[var(--accent)]">recruiter_mode</p>
        <button
          type="button"
          onClick={() => {
            setWorkspace('work')
            setView({ type: 'desktop', workspace: 'work' })
          }}
          className={buttonClass({ variant: 'ghost', size: 'sm' })}
        >
          ← Enter workspace
        </button>
      </div>

      <div className="pointer-events-auto min-h-0 flex-1 overflow-y-auto scrollbar-thin rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
        <Suspense
          fallback={
            <div className="flex min-h-[40vh] items-center justify-center font-mono text-xs text-[var(--text-muted)]">
              loading profile…
            </div>
          }
        >
          <RecruiterPage />
        </Suspense>
      </div>
    </div>
  )
}