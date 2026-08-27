import { Mail } from 'lucide-react'
import { useCommand } from '@/components/CommandPalette'
import { GitHubIcon, LinkedInIcon } from '@/components/icons'
import { Kbd } from '@/components/ui/kbd'
import { site } from '@/data/site'

export function Footer() {
  const { openPalette, openHelp, modKey } = useCommand()

  return (
    <footer className="border-t border-[var(--color-border)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-semibold">{site.name}</p>
          <p className="mt-1 text-sm text-[var(--color-fg-muted)]">{site.title}</p>
          <p className="mt-3 font-mono text-xs text-[var(--color-fg-muted)]">
            Java • Spring Boot • AWS • Microservices • React
          </p>
        </div>
        <div>
          <nav className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-fg-muted)]" aria-label="Footer">
            <a href={site.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-indigo-400">
              <GitHubIcon className="size-4" aria-hidden="true" />
              GitHub
            </a>
            <a href={site.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-indigo-400">
              <LinkedInIcon className="size-4" aria-hidden="true" />
              LinkedIn
            </a>
            <a href={`mailto:${site.email}`} className="inline-flex items-center gap-1.5 hover:text-indigo-400">
              <Mail className="size-4" aria-hidden="true" />
              Email
            </a>
          </nav>
          <p className="mt-2 text-xs text-[var(--color-fg-muted)]">
            <a href={`tel:${site.phone}`}>{site.phone}</a>
          </p>
          <p className="mt-3 text-xs text-[var(--color-fg-muted)]">
            © 2026 {site.name}. Built with React.
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[11px] text-[var(--color-fg-muted)]">
            <button type="button" onClick={openPalette} className="inline-flex items-center gap-1 hover:text-[var(--color-fg)]">
              <Kbd>{modKey}</Kbd>
              <Kbd>K</Kbd>
              <span>commands</span>
            </button>
            <span aria-hidden="true">·</span>
            <button type="button" onClick={openHelp} className="inline-flex items-center gap-1 hover:text-[var(--color-fg)]">
              <Kbd>?</Kbd>
              <span>shortcuts</span>
            </button>
          </p>
        </div>
      </div>
    </footer>
  )
}
