import { BookOpen, Cpu, Database, FileText, KeyRound, RefreshCw, ShieldCheck } from 'lucide-react'
import { Card } from '@/dashboard/components/charts'
import { GitHubIcon } from '@/components/icons'
import { buttonClass } from '@/components/ui/button'
import { site } from '@/data/site'
import { getLatestVersion } from '@/data/changelog'

export function SettingsSection() {
  const version = getLatestVersion()

  return (
    <div className="space-y-6">
      <Card title="Privacy & security">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4">
            <ShieldCheck className="size-5 text-emerald-400" />
            <h4 className="mt-2 font-semibold text-sm">Password gates</h4>
            <p className="mt-1 text-xs text-[var(--color-fg-muted)]">
              Journal and AMLI Vault are locked behind a password. Verification runs server-side — no password is
              stored in the browser.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4">
            <KeyRound className="size-5 text-indigo-400" />
            <h4 className="mt-2 font-semibold text-sm">Journal encryption</h4>
            <p className="mt-1 text-xs text-[var(--color-fg-muted)]">
              Journal entries are encrypted with AES-256-GCM in your browser using your password, then stored locally.
              Raw text never touches the network.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4">
            <RefreshCw className="size-5 text-amber-400" />
            <h4 className="mt-2 font-semibold text-sm">Fresh data</h4>
            <p className="mt-1 text-xs text-[var(--color-fg-muted)]">
              GitHub pulls live from the API, Obsidian data comes from a published snapshot, and the AMLI snapshot
              refreshes daily before you visit.
            </p>
          </div>
        </div>
      </Card>

      <Card title="Where the data comes from">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4">
            <div className="flex items-center gap-2">
              <GitHubIcon className="size-5 text-indigo-400" />
              <h4 className="font-semibold text-sm">GitHub</h4>
            </div>
            <p className="mt-2 text-xs text-[var(--color-fg-muted)]">
              Live from the GitHub API — repositories, stars, languages and contribution activity. Only public data is
              shown, with loading and error states when the API is unavailable.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4">
            <div className="flex items-center gap-2">
              <FileText className="size-5 text-emerald-400" />
              <h4 className="font-semibold text-sm">Obsidian vault</h4>
            </div>
            <p className="mt-2 text-xs text-[var(--color-fg-muted)]">
              A published manifest of notes powers the category counts and the markdown reader. Protected vault content
              stays excluded.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-violet-400" />
              <h4 className="font-semibold text-sm">Journal</h4>
            </div>
            <p className="mt-2 text-xs text-[var(--color-fg-muted)]">
              Your own writing, kept in this browser and encrypted with your password. It exists only where you can see
              it.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4">
            <div className="flex items-center gap-2">
              <Database className="size-5 text-amber-400" />
              <h4 className="font-semibold text-sm">AMLI work data</h4>
            </div>
            <p className="mt-2 text-xs text-[var(--color-fg-muted)]">
              A synced snapshot from the AMLI service. Public graphs render for everyone; sensitive entries are
              password-protected.
            </p>
          </div>
        </div>
      </Card>

      <Card title="About the Control Center">
        <div className="flex flex-wrap items-center gap-4">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-4 py-3">
            <p className="font-mono text-2xl font-semibold text-[var(--color-fg)]">{version}</p>
            <p className="font-mono text-[11px] text-[var(--color-fg-muted)]">current build</p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-4 py-3">
            <p className="font-mono text-2xl font-semibold text-[var(--color-fg)]">4</p>
            <p className="font-mono text-[11px] text-[var(--color-fg-muted)]">live integrations</p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-4 py-3">
            <p className="font-mono text-2xl font-semibold text-[var(--color-fg)]">
              <Cpu className="size-5" />
            </p>
            <p className="font-mono text-[11px] text-[var(--color-fg-muted)]">React · TypeScript · serverless</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] pt-4">
          <span className="text-sm text-[var(--color-fg-muted)]">Questions or opportunities?</span>
          <a href={`mailto:${site.email}`} className={buttonClass({ size: 'sm', variant: 'outline' })}>
            Email me
          </a>
          <a href={site.resumePath} target="_blank" rel="noreferrer" className={buttonClass({ size: 'sm', variant: 'ghost' })}>
            Download resume
          </a>
        </div>
      </Card>
    </div>
  )
}