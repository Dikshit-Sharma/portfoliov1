import { Suspense, lazy } from 'react'
import { GitHubIcon } from '@/components/icons'
import { site } from '@/data/site'
import { buttonClass } from '@/components/ui/button'
import { useGitHubStatus } from '../integrations/useGitHubStatus'

const GithubSection = lazy(() => import('@/dashboard/sections/GithubSection').then((m) => ({ default: m.GithubSection })))

/**
 * GitHub application — repository and integration state.
 * Shows truthful state (online / cached / offline / error) sourced from
 * real requests; never fake live status.
 */
export default function GithubApp() {
  const { status, detail } = useGitHubStatus()

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
        <p className="flex items-center gap-2 font-mono text-xs text-[var(--text)]">
          <GitHubIcon className="size-4" aria-hidden="true" />
          github / Dikshit-Sharma
        </p>
        <div className="flex items-center gap-3">
          <StatusPill status={status} detail={detail} />
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            className={buttonClass({ variant: 'ghost', size: 'sm' })}
          >
            Open on GitHub
          </a>
        </div>
      </div>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
        <Suspense
          fallback={
            <div className="flex min-h-[40vh] items-center justify-center font-mono text-xs text-[var(--text-muted)]">
              fetching GitHub integration…
            </div>
          }
        >
          <GithubSection />
        </Suspense>
      </div>
    </div>
  )
}

function StatusPill({ status, detail }: { status: string; detail: string }) {
  const tone =
    status === 'ONLINE' ? 'text-emerald-400'
    : status === 'CACHED' ? 'text-amber-400'
    : status === 'ERROR' ? 'text-red-400'
    : status === 'LOCKED' ? 'text-[var(--accent)]'
    : 'text-zinc-500'
  return (
    <span className={`flex items-center gap-1.5 font-mono text-[11px] ${tone}`} title={detail}>
      ● {status}
      {detail && <span className="hidden text-[10px] text-[var(--text-muted)] md:inline">· {detail}</span>}
    </span>
  )
}