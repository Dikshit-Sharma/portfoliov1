import { ArrowRight, Download, LayoutDashboard, Mail, Zap, Terminal, Search, CheckCircle, ExternalLink } from 'lucide-react'
import { buttonClass } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GitHubIcon, LinkedInIcon } from '@/components/icons'
import { site, heroStack } from '@/data/site'
import { projects } from '@/data/projects'
import { navigate, navigateDashboard } from '@/lib/router'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

export function Hero() {
  const [githubConnected, setGithubConnected] = useState(false)
  const [lastCommit, setLastCommit] = useState('—')
  const [lastDeploy, setLastDeploy] = useState('—')
  
  useEffect(() => {
    setGithubConnected(true)
    setLastCommit('2h ago (static)')
    setLastDeploy('5h ago (static)')
  }, [])

  return (
    <section id="top" className="relative overflow-hidden min-h-screen flex items-center">
      <div className="noise pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-mono text-sm text-indigo-400">dikshit@workspace</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[var(--color-fg)] sm:text-5xl lg:text-6xl">
                {site.title}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => navigate('work')}
                className={cn(buttonClass({ size: 'lg' }), 'hidden sm:inline-flex')}
              >
                Explore My Work
                <ArrowRight className="size-4" />
              </button>
              <button
                onClick={() => navigate('recruiter')}
                className={cn(buttonClass({ variant: 'outline', size: 'lg' }), 'hidden sm:inline-flex')}
              >
                Recruiter Mode
              </button>
              <a href="#contact" className={cn(buttonClass({ variant: 'outline', size: 'lg' }), 'hidden sm:inline-flex')}>
                <Mail className="size-4" />
                Contact
              </a>
            </div>
          </div>

          {/* Live Developer Workspace Panel */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-[0_24px_80px_-32px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-muted)] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-[#ff5f57]" aria-hidden="true" />
                <span className="size-2.5 rounded-full bg-[#febc2e]" aria-hidden="true" />
                <span className="size-2.5 rounded-full bg-[#28c840]" aria-hidden="true" />
                <p className="ml-2 font-mono text-xs text-[var(--color-fg-muted)]">dikshit@workspace ~</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-[var(--color-fg-muted)]">
                <span className="flex items-center gap-1"><Zap className="size-3" /> LIVE</span>
                <span className="flex items-center gap-1"><GitHubIcon className="size-3" /> {githubConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
              </div>
            </div>

            {/* Terminal Content */}
            <div className="p-6 font-mono text-sm leading-relaxed">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* System Status */}
                <div className="space-y-3">
                  <p className="text-indigo-400">$ system</p>
                  <div className="space-y-2 ml-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-[var(--color-fg-muted)]">
                        <CheckCircle className="size-4 text-emerald-400" />
                        PORTFOLIO
                      </span>
                      <span className="font-mono text-emerald-400">ONLINE</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-[var(--color-fg-muted)]">
                        <GitHubIcon className="size-4" />
                        GITHUB
                      </span>
                      <span className="font-mono text-emerald-400">CONNECTED</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-[var(--color-fg-muted)]">
                        <Terminal className="size-4" />
                        PROJECTS
                      </span>
                      <span className="font-mono text-indigo-400">{projects.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-[var(--color-fg-muted)]">
                        <Zap className="size-4" />
                        CURRENT BUILD
                      </span>
                      <span className="font-mono text-amber-400">Portfolio v2</span>
                    </div>
                  </div>
                </div>

                {/* Activity */}
                <div className="space-y-3">
                  <p className="text-indigo-400">$ activity</p>
                  <div className="space-y-2 ml-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--color-fg-muted)]">last commit</span>
                      <span className="font-mono text-[var(--color-fg-muted)]">{lastCommit}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--color-fg-muted)]">last deploy</span>
                      <span className="font-mono text-[var(--color-fg-muted)]">{lastDeploy}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--color-fg-muted)]">portfolio version</span>
                      <span className="font-mono text-indigo-400">v2.0.0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--color-fg-muted)]">uptime</span>
                      <span className="font-mono text-emerald-400">99.9%</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <p className="text-indigo-400">$ quick actions</p>
                  <div className="space-y-2 ml-4">
                    <button onClick={() => navigate('work')} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg border border-dashed border-[var(--color-border)] hover:border-indigo-400/50 hover:bg-[var(--color-bg-muted)] transition-colors">
                      <ArrowRight className="size-4 text-indigo-400" />
                      <span>Explore Work</span>
                    </button>
                    <button onClick={() => navigate('lab')} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg border border-dashed border-[var(--color-border)] hover:border-indigo-400/50 hover:bg-[var(--color-bg-muted)] transition-colors">
                      <Search className="size-4 text-violet-400" />
                      <span>Open Lab</span>
                    </button>
                    <button onClick={() => navigate('knowledge')} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg border border-dashed border-[var(--color-border)] hover:border-indigo-400/50 hover:bg-[var(--color-bg-muted)] transition-colors">
                      <Terminal className="size-4 text-emerald-400" />
                      <span>Knowledge Graph</span>
                    </button>
                    <button onClick={() => navigateDashboard('overview')} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg border border-dashed border-[var(--color-border)] hover:border-indigo-400/50 hover:bg-[var(--color-bg-muted)] transition-colors">
                      <LayoutDashboard className="size-4 text-amber-400" />
                      <span>Developer Dashboard</span>
                    </button>
                  </div>
                </div>

                {/* Links */}
                <div className="space-y-3">
                  <p className="text-indigo-400">$ links</p>
                  <div className="space-y-2 ml-4">
                    <a href={site.github} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2 rounded-lg border border-dashed border-[var(--color-border)] hover:border-indigo-400/50 hover:bg-[var(--color-bg-muted)] transition-colors">
                      <GitHubIcon className="size-4" />
                      <span>GitHub</span>
                      <ExternalLink className="size-3.5 ml-auto text-[var(--color-fg-muted)]" />
                    </a>
                    <a href={site.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2 rounded-lg border border-dashed border-[var(--color-border)] hover:border-indigo-400/50 hover:bg-[var(--color-bg-muted)] transition-colors">
                      <LinkedInIcon className="size-4" />
                      <span>LinkedIn</span>
                      <ExternalLink className="size-3.5 ml-auto text-[var(--color-fg-muted)]" />
                    </a>
                    <a href={site.resumePath} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2 rounded-lg border border-dashed border-[var(--color-border)] hover:border-indigo-400/50 hover:bg-[var(--color-bg-muted)] transition-colors">
                      <Download className="size-4" />
                      <span>Resume</span>
                      <ExternalLink className="size-3.5 ml-auto text-[var(--color-fg-muted)]" />
                    </a>
                    <a href={`mailto:${site.email}`} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-dashed border-[var(--color-border)] hover:border-indigo-400/50 hover:bg-[var(--color-bg-muted)] transition-colors">
                      <Mail className="size-4" />
                      <span>Email</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="my-6 border-t border-[var(--color-border)]" />

              {/* Prompt */}
              <div className="flex items-center gap-2">
                <span className="text-indigo-400">$</span>
                <span className="flex-1 text-[var(--color-fg-muted)]">Type a command or press <kbd className="px-1.5 py-0.5 bg-[var(--color-bg-muted)] rounded">{typeof window !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'}</kbd>+<kbd className="px-1.5 py-0.5 bg-[var(--color-bg-muted)] rounded">K</kbd> for command palette</span>
                <span className="caret inline-block h-4 w-1.5 bg-indigo-400 animate-pulse" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* Stack badges */}
          <div className="flex flex-wrap gap-2" aria-label="Primary stack">
            {heroStack.map((tech) => (
              <Badge key={tech} className="group-hover:border-indigo-400/50 group-hover:text-[var(--color-fg)]">{tech}</Badge>
            ))}
          </div>

          {/* Static data notice */}
          <p className="text-xs text-[var(--color-fg-muted)]">
            ⚠ System metrics (commit, deploy, uptime) are static placeholders — replace with live API data when available.
          </p>
        </div>
      </div>
    </section>
  )
}