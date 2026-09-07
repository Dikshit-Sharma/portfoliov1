import { ArrowRight, BookOpen, FolderKanban, ShieldAlert } from 'lucide-react'
import { navigate, type DashboardTab } from '@/dashboard/lib/router'
import { GitHubIcon } from '@/components/icons'
import { obsidianCategories, obsidianTotalNotes } from '@/data/obsidian.generated'
import { ProjectsSkillsSection } from '@/dashboard/sections/ProjectsSkillsSection'

interface SummaryCardProps {
  tab: DashboardTab
  icon: React.ReactNode
  kicker: string
  title: string
  description: string
  badges: string[]
  accent?: string
}

function SummaryCard({ tab, icon, kicker, title, description, badges, accent = 'var(--color-accent)' }: SummaryCardProps) {
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
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-fg)]">Dashboard</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-fg-muted)]">
          Your whole system in one place — GitHub activity, projects, skills, the Obsidian vault, a private journal, and the
          password-protected AMLI work data, all surfaced with graphs that update automatically.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <SummaryCard
          tab="github"
          icon={<GitHubIcon className="size-5" />}
          kicker="01 / GitHub"
          title="Commits & activity"
          description="Contribution heatmap, monthly activity, repositories, stars, top languages and profile — live from the GitHub API."
          badges={['contribution graph', 'repos', 'stats']}
        />
        <SummaryCard
          tab="journal"
          icon={<BookOpen className="size-5" />}
          kicker="02 / Journal"
          title="Private diary & notes"
          description="Encrypted personal journal with mood tracking, entry graphs and per-month charts. Password protected."
          badges={['encrypted', 'graphs', 'password']}
          accent="var(--color-accent-2)"
        />
        <SummaryCard
          tab="obsidian"
          icon={<FolderKanban className="size-5" />}
          kicker="03 / Obsidian"
          title={`Vault categories · ${obsidianTotalNotes} notes`}
          description="Your Obsidian vault grouped into browsable categories, generated from the local vault and kept in sync."
          badges={obsidianCategories.map((c) => c.label)}
          accent="#34d399"
        />
        <SummaryCard
          tab="amli"
          icon={<ShieldAlert className="size-5" />}
          kicker="04 / Work"
          title="AMLI Vault"
          description="Company project data (artifacts, BSA, credentials) synced from the AMLI Enc/Dec service every morning. Password protected."
          badges={['artifacts', 'BSA', 'credentials', 'synced daily']}
          accent="#fbbf24"
        />
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
        <p className="font-mono text-[11px] tracking-[0.16em] text-indigo-400 uppercase">Quick note</p>
        <p className="mt-2 text-sm text-[var(--color-fg-muted)]">
          Graphs are shown to everyone on the public overview and GitHub/Obsidian tabs. The Journal and AMLI Vault require
          the password you configured in Netlify (<code className="font-mono">DASHBOARD_PASSWORD</code>). Set it up in{' '}
          <button type="button" className="text-indigo-400 underline underline-offset-2" onClick={() => navigate('settings')}>
            Settings
          </button>.
        </p>
      </div>

      <ProjectsSkillsSection />
    </div>
  )
}
