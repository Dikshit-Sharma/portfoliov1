import { site, heroStack } from '@/data/site'
import { getFeaturedProjects } from '@/data/projects'
import { experience } from '@/data/experience'
import { getImpactMetrics } from '@/data/impact'
import { getLatestVersion } from '@/data/changelog'
import { Reveal } from '@/hooks/useReveal'
import { Badge } from '@/components/ui/badge'
import { TechBadge } from '@/components/workspace/TechBadge'
import { buttonClass } from '@/components/ui/button'
import { LinkedInIcon } from '@/components/icons'
import { Download, Mail } from 'lucide-react'
import { navigate } from '@/lib/router'
import { cn } from '@/lib/utils'

export function RecruiterPage() {
  const featuredProjects = getFeaturedProjects()
  const latestVersion = getLatestVersion()
  const impactMetrics = getImpactMetrics()

  return (
    <section id="recruiter" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* Window chrome — a focused Hyprland-style profile window */}
      <Reveal>
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-2xl">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-muted)] px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" aria-hidden="true" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" aria-hidden="true" />
              <span className="size-2.5 rounded-full bg-[#28c840]" aria-hidden="true" />
              <p className="ml-2 font-mono text-[11px] text-[var(--color-fg-muted)]">
                recruiter_mode · profile/{site.fullName.toLowerCase().replace(/\s+/g, '-')}
              </p>
            </div>
            <Badge className="font-mono text-[10px]">FOCUSED</Badge>
          </div>

          <div className="p-6 sm:p-10">
            {/* Header */}
            <div className="text-center">
              <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--color-accent)] uppercase">
                Recruiter Mode
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{site.fullName}</h1>
              <p className="mt-2 text-lg text-[var(--color-fg-muted)]">{site.title}</p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                {heroStack.map((tech) => (
                  <TechBadge key={tech} tech={tech} className="text-xs opacity-90" />
                ))}
              </div>
              <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-3 border-t border-[var(--color-border)] pt-5">
                <a href={site.resumePath} target="_blank" rel="noreferrer" className={cn(buttonClass({ size: 'sm' }), 'font-mono')}>
                  <Download className="size-3.5" /> Resume
                </a>
                <a href={`mailto:${site.email}`} className={cn(buttonClass({ variant: 'outline', size: 'sm' }), 'font-mono')}>
                  <Mail className="size-3.5" /> {site.email}
                </a>
                <a href={site.linkedin} target="_blank" rel="noreferrer" className={cn(buttonClass({ variant: 'ghost', size: 'sm' }), 'font-mono')}>
                  <LinkedInIcon className="size-3.5" /> LinkedIn
                </a>
              </div>
            </div>

            {/* Experience */}
            <section className="mt-10 space-y-6">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <span className="font-mono text-sm text-[var(--color-accent)]">experience</span>
              </h2>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <article key={exp.id} className="border-l-2 border-[var(--color-border)] pl-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-[11px] text-[var(--color-accent)]">{exp.period}</p>
                        <h3 className="mt-0.5 text-lg font-semibold">{exp.title}</h3>
                        <p className="text-sm text-[var(--color-fg-muted)]">
                          {exp.company}
                          {exp.location && ` · ${exp.location}`}
                        </p>
                      </div>
                      <Badge className={exp.type === 'full-time' ? 'text-emerald-400 border-emerald-400/30' : 'text-amber-400 border-amber-400/30'}>
                        {exp.type.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <ul className="mt-3 space-y-1.5 text-sm text-[var(--color-fg-muted)]">
                      {exp.bullets.slice(0, 2).map((bullet) => (
                        <li key={bullet} className="pl-3 -indent-3 flex items-start gap-2">
                          — {bullet}
                        </li>
                      ))}
                      {exp.bullets.length > 2 && (
                        <li className="pl-3 -indent-3 text-[var(--color-accent)]">
                          + {exp.bullets.length - 2} more achievements…
                        </li>
                      )}
                    </ul>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {exp.technologies.slice(0, 6).map((tech) => (
                        <TechBadge key={tech} tech={tech} className="text-[10px]" />
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Impact */}
            <section className="mt-10 space-y-6">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <span className="font-mono text-sm text-[var(--color-accent)]">impact</span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {impactMetrics.map((metric) => (
                  <article key={metric.label} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4">
                    <p className="text-[11px] text-[var(--color-fg-muted)]">{metric.context}</p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight text-[var(--color-fg)]">{metric.value}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-[var(--color-accent)]">{metric.label}</p>
                  </article>
                ))}
              </div>
            </section>

            {/* Projects */}
            <section className="mt-10 space-y-6">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <span className="font-mono text-sm text-[var(--color-accent)]">selected projects</span>
              </h2>
              <div className="space-y-3">
                {featuredProjects.slice(0, 3).map((project) => (
                  <article key={project.id} className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-[var(--color-border)] p-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[10px] tracking-[0.16em] text-[var(--color-accent)] uppercase">
                        {project.kicker}
                      </p>
                      <h3 className="mt-1 font-semibold">{project.name}</h3>
                      <p className="mt-1 line-clamp-1 text-sm text-[var(--color-fg-muted)]">{project.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {project.technologies.slice(0, 4).map((tech) => (
                          <TechBadge key={tech} tech={tech} className="text-[10px]" />
                        ))}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button onClick={() => navigate('work', project.id)} className={buttonClass({ size: 'sm' })}>
                        Details
                      </button>
                      {project.links.live && (
                        <a href={project.links.live} target="_blank" rel="noreferrer" className={buttonClass({ variant: 'outline', size: 'sm' })}>
                          Live
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Footer note */}
            <div className="mt-10 border-t border-[var(--color-border)] pt-5 text-center">
              <p className="font-mono text-[11px] text-[var(--color-fg-muted)]">
                Portfolio v{latestVersion.replace('v', '')} · press{' '}
                <kbd className="px-1.5 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-muted)]">{typeof window !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'}</kbd>
                +<kbd className="px-1.5 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-muted)]">K</kbd>{' '}
                for the full workspace — terminal, knowledge, architecture.
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}