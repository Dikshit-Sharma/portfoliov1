import { ArrowRight, Download, LayoutDashboard, Mail } from 'lucide-react'
import { useCommand } from '@/components/CommandPalette'
import { GitHubIcon } from '@/components/icons'
import { buttonClass } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Kbd } from '@/components/ui/kbd'
import { site, heroStack } from '@/data/site'
import { cn } from '@/lib/utils'

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="noise pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        <div>
          <p className="reveal font-mono text-sm text-indigo-400">Hi, I'm Dikshit.</p>
          <h1 className="reveal reveal-delay-1 mt-3 text-3xl font-semibold tracking-tight text-[var(--color-fg)] sm:text-4xl lg:text-5xl">
            {site.title}
          </h1>
          <p className="reveal reveal-delay-2 mt-5 max-w-xl text-base leading-relaxed text-[var(--color-fg-muted)] sm:text-lg">
            I build scalable backend systems, cloud-native applications, and developer tools using
            Java, Spring Boot, AWS, React, and modern web technologies.
          </p>
          <div className="reveal reveal-delay-3 mt-8 flex flex-wrap gap-3">
            <a href="#projects" className={buttonClass({ size: 'lg' })}>
              View Projects
              <ArrowRight className="size-4" />
            </a>
            <a
              href={site.github}
              target="_blank"
              rel="noreferrer"
              className={buttonClass({ variant: 'outline', size: 'lg' })}
            >
              <GitHubIcon className="size-4" />
              GitHub
            </a>
            <a href="#contact" className={buttonClass({ variant: 'outline', size: 'lg' })}>
              <Mail className="size-4" />
              Contact Me
            </a>
            <a href={site.resumePath} className={buttonClass({ variant: 'ghost', size: 'lg' })}>
              <Download className="size-4" />
              Download Resume
            </a>
            <a href="#/dashboard" className={buttonClass({ variant: 'default', size: 'lg' })}>
              <LayoutDashboard className="size-4" />
              Dashboard
            </a>
          </div>
          <ul className="reveal reveal-delay-3 mt-8 flex flex-wrap gap-2" aria-label="Primary stack">
            {heroStack.map((tech) => (
              <li key={tech}>
                <Badge>{tech}</Badge>
              </li>
            ))}
          </ul>
        </div>
        <WorkspacePanel />
      </div>
    </section>
  )
}

function WorkspacePanel() {
  const { openPalette, openHelp, modKey } = useCommand()

  return (
    <div className="reveal reveal-delay-2">
      <div
        className={cn(
          'overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-[0_24px_80px_-32px_rgba(0,0,0,0.6)]',
        )}
      >
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-3 py-2">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-[#28c840]" aria-hidden="true" />
          <p className="ml-2 font-mono text-xs text-[var(--color-fg-muted)]">dikshit@dev — zsh</p>
        </div>
        <div className="space-y-4 p-5 font-mono text-[13px] leading-6 sm:p-6">
          <div>
            <p className="text-indigo-400">$ whoami</p>
            <p className="text-[var(--color-fg)]">Java Full Stack Developer</p>
          </div>
          <div>
            <p className="text-indigo-400">$ stack --primary</p>
            <p className="text-[var(--color-fg)]">Java / Spring Boot / AWS / React</p>
          </div>
          <div>
            <p className="text-indigo-400">$ current_focus</p>
            <p className="text-[var(--color-fg)]">Developer Productivity</p>
          </div>
          <div>
            <p className="text-indigo-400">$ help</p>
            <ul className="mt-1 space-y-1 text-[var(--color-fg-muted)]">
              <li className="flex flex-wrap items-center gap-2">
                <span className="flex gap-1">
                  <Kbd>{modKey}</Kbd>
                  <Kbd>K</Kbd>
                </span>
                command palette
              </li>
              <li className="flex flex-wrap items-center gap-2">
                <Kbd>?</Kbd>
                keyboard shortcuts
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={openPalette}
            className="flex w-full items-center gap-2 rounded-md border border-dashed border-[var(--color-border)] px-3 py-2 text-left text-xs text-[var(--color-fg-muted)] hover:border-indigo-400/50 hover:text-[var(--color-fg)]"
          >
            <span className="text-indigo-400">$</span>
            <span>type a command…</span>
            <span className="caret ml-auto inline-block h-4 w-1.5 bg-indigo-400" aria-hidden="true" />
          </button>
          <p className="flex flex-wrap items-center gap-2 text-[11px] text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            systems online
            <button
              type="button"
              onClick={openHelp}
              className="ml-auto text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
            >
              man shortcuts
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
