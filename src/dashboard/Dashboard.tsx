import { FolderGit2, Home, ShieldAlert, Settings, X, Activity, Zap } from 'lucide-react'
import { useHashTab, navigate, type DashboardTab } from '@/dashboard/lib/router'
import { GithubSection } from '@/dashboard/sections/GithubSection'
import { JournalSection } from '@/dashboard/sections/JournalSection'
import { ObsidianSection } from '@/dashboard/sections/ObsidianSection'
import { AmliSection } from '@/dashboard/sections/AmliSection'
import { OverviewSection } from '@/dashboard/sections/OverviewSection'
import { SettingsSection } from '@/dashboard/sections/SettingsSection'
import { GitHubIcon } from '@/components/icons'
import { buttonClass } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const TABS: { id: DashboardTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <Home className="size-4" /> },
  { id: 'github', label: 'GitHub', icon: <GitHubIcon className="size-4" /> },
  { id: 'knowledge', label: 'Knowledge', icon: <FolderGit2 className="size-4" /> },
  { id: 'activity', label: 'Activity', icon: <Activity className="size-4" /> },
  { id: 'lab', label: 'Lab', icon: <Zap className="size-4" /> },
  { id: 'amli', label: 'AMLI', icon: <ShieldAlert className="size-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="size-4" /> },
]

export function Dashboard() {
  const tab = useHashTab()

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-[0.18em] text-indigo-400 uppercase">Developer Control Center</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--color-fg)] sm:text-3xl">
            DIKSHIT // CONTROL CENTER
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Back to the main site */}
          <a href="/" onClick={(e) => { e.preventDefault(); window.location.hash = ''; window.scrollTo({ top: 0 }) }} className={buttonClass({ variant: 'outline', size: 'sm' })}>
            <X className="size-3.5" /> Back to Workspace
          </a>
        </div>
      </header>

      {/* Tab navigation */}
      <nav className="sticky top-0 z-30 -mx-4 mb-8 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg)_85%,transparent)] px-4 backdrop-blur-md sm:mx-0 sm:px-0">
        <div className="flex gap-1 overflow-x-auto pb-px">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => navigate(t.id)}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition-colors',
                tab === t.id
                  ? 'border-indigo-400 text-[var(--color-fg)]'
                  : 'border-transparent text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]',
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main>
        {tab === 'overview' && <OverviewSection />}
        {tab === 'github' && <GithubSection />}
        {tab === 'journal' && <JournalSection />}
        {tab === 'knowledge' && <ObsidianSection />}
        {tab === 'activity' && <GithubSection />}
        {tab === 'lab' && <div className="py-8 text-center text-[var(--color-fg-muted)]">Lab integration coming soon — see /lab for experiments</div>}
        {tab === 'amli' && <AmliSection />}
        {tab === 'settings' && <SettingsSection />}
      </main>
    </div>
  )
}