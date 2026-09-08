import { ArrowRight, BookOpen, FolderGit2, ShieldAlert, TrendingUp, Zap } from 'lucide-react'
import { navigate, type DashboardTab } from '@/dashboard/lib/router'
import { GitHubIcon } from '@/components/icons'
import { obsidianCategories, obsidianTotalNotes } from '@/data/obsidian.generated'
import { projects } from '@/data/projects'
import { ProjectsSkillsSection } from '@/dashboard/sections/ProjectsSkillsSection'

interface SummaryCardProps {
  tab: DashboardTab
  icon: React.ReactNode
  kicker: string
  title: string
  description: string
  badges: string[]
  metric?: { label: string; value: string | number; trend?: string }
  accent?: string
}

function SummaryCard({ tab, icon, kicker, title, description, badges, metric, accent = 'var(--color-accent)' }: SummaryCardProps) {
  return (
    <button
      type="button"
      onClick={() => navigate(tab)}
      className="group flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5 text-left transition-all hover:-translate-y-1 hover:border-indigo-400/50"
    >
      <div
        className="mb-4 flex size-11 items-center justify-center rounded-xl"
        style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)`, border: `1px solid ${accent}44`, color: accent }}
      >
        {icon}
      </div>
      <p className="font-mono text-[11px] tracking-[0.16em] text-indigo-400 uppercase">{kicker}</p>
      <h3 className="mt-1 text-lg font-semibold text-[var(--color-fg)]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-fg-muted)]">{description}</p>
      {metric && (
        <div className="mt-3 flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-muted)]">
          <span className="font-mono text-[11px] text-indigo-400">{metric.label}</span>
          <span className="text-xl font-semibold text-[var(--color-fg)]">{metric.value}</span>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {badges.map((b) => (
          <span key={b} className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-fg-muted)]">
            {b}
          </span>
        ))}
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-400">
        Open
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  )
}

export function OverviewSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-fg)]">Control Center</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-fg-muted)]">
          Your whole system in one place — GitHub activity, the Obsidian vault (synced from GitHub), a private
          encrypted journal with Obsidian export, and the password-protected AMLI work data, all with interactive
          graphs that update automatically.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          tab="github"
          icon={<GitHubIcon className="size-5" />}
          kicker="01 / GitHub"
          title="Commits & Activity"
          description="Contribution heatmap, monthly/weekly activity, repos, stars, languages, profile — live from GitHub API."
          badges={['heatmap', 'repos', 'stats', 'novel sync']}
          metric={{ label: 'Repositories', value: projects.length }}
        />
        <SummaryCard
          tab="journal"
          icon={<BookOpen className="size-5" />}
          kicker="02 / Journal"
          title="Private Diary & Notes"
          description="Encrypted personal journal with mood tracking, streak, heatmap, mood trend, word counts, tags, and Obsidian .md export."
          badges={['AES-256-GCM', 'graphs', 'password', 'export']}
          accent="var(--color-accent-2)"
          metric={{ label: 'Entries', value: '—' }}
        />
        <SummaryCard
          tab="knowledge"
          icon={<FolderGit2 className="size-5" />}
          kicker="03 / Obsidian"
          title={`Vault Categories · ${obsidianTotalNotes} Notes`}
          description="4 categories auto-generated from local vault + GitHub repo sync (Dikshit-Sharma/novel). Full markdown reading and .md export."
          badges={obsidianCategories.map((c) => c.label)}
          accent="#34d399"
          metric={{ label: 'Categories', value: obsidianCategories.length }}
        />
        <SummaryCard
          tab="amli"
          icon={<ShieldAlert className="size-5" />}
          kicker="04 / Work"
          title="AMLI Vault"
          description="Company project data (artifacts, BSA, credentials) synced from AMLI Enc/Dec service daily. Public graphs; details protected."
          badges={['artifacts', 'BSA', 'credentials', 'synced daily']}
          accent="#fbbf24"
          metric={{ label: 'Status', value: 'ACTIVE' }}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          tab="activity"
          icon={<TrendingUp className="size-5" />}
          kicker="05 / Activity"
          title="GitHub Activity Stream"
          description="Recent commits, PRs, issues, and deployments across all repositories. Filter by repo, type, date."
          badges={['commits', 'PRs', 'issues', 'releases']}
          metric={{ label: 'Total Repos', value: projects.length }}
        />
        <SummaryCard
          tab="lab"
          icon={<Zap className="size-5" />}
          kicker="06 / Lab"
          title="Experimental Builds"
          description="Developer tools, AI experiments, Linux automation, and side projects. Status: BUILDING / EXPERIMENT / STABLE."
          badges={['building', 'experiment', 'stable', 'archived']}
          metric={{ label: 'Experiments', value: '4' }}
        />
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
        <p className="font-mono text-[11px] tracking-[0.16em] text-indigo-400 uppercase">Quick Note</p>
        <p className="mt-2 text-sm text-[var(--color-fg-muted)]">
          Graphs are shown to everyone on the public overview, GitHub, and Obsidian tabs. The Journal and AMLI Vault
          require the password you configured in Netlify (<code className="font-mono">DASHBOARD_PASSWORD</code>). Set it
          up in <button type="button" className="text-indigo-400 underline underline-offset-2" onClick={() => navigate('settings')}>Settings</button>.
        </p>
      </div>

      <ProjectsSkillsSection />
    </div>
  )
}