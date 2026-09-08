import { site, heroStack, skillGroups } from '@/data/site'
import { getFeaturedProjects } from '@/data/projects'
import { experience } from '@/data/experience'
import { getImpactMetrics } from '@/data/impact'
import { getLatestVersion } from '@/data/changelog'
import { Reveal } from '@/hooks/useReveal'
import { Badge } from '@/components/ui/badge'
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
    <section id="recruiter" className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <Reveal>
        <div className="text-center mb-12">
          <p className="font-mono text-[11px] tracking-[0.16em] text-indigo-400 uppercase">Recruiter Mode</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{site.fullName}</h1>
          <p className="mt-2 text-lg text-[var(--color-fg-muted)]">{site.title}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {heroStack.map((tech) => (
              <Badge key={tech} className="text-xs opacity-80">{tech}</Badge>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delayClass="reveal-delay-1">
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold">Experience</h2>
          <div className="space-y-6">
            {experience.map((exp) => (
              <article key={exp.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs text-indigo-400">{exp.period}</p>
                    <h3 className="mt-1 text-lg font-semibold">{exp.title}</h3>
                    <p className="text-sm text-[var(--color-fg-muted)]">{exp.company}{exp.location && ` · ${exp.location}`}</p>
                  </div>
                  <Badge className={exp.type === 'full-time' ? 'text-emerald-400 border-emerald-400/30' : 'text-amber-400 border-amber-400/30'}>
                    {exp.type.toUpperCase()}
                  </Badge>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-[var(--color-fg-muted)]">
                  {exp.bullets.slice(0, 3).map((bullet) => (
                    <li key={bullet} className="pl-3 -indent-3 flex items-start gap-2">— {bullet}</li>
                  ))}
                  {exp.bullets.length > 3 && (
                    <li className="pl-3 -indent-3 text-indigo-400">+ {exp.bullets.length - 3} more achievements...</li>
                  )}
                </ul>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {exp.technologies.slice(0, 8).map((tech) => (
                    <Badge key={tech} className="text-[10px]">{tech}</Badge>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal delayClass="reveal-delay-2">
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold">Impact & Metrics</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {impactMetrics.map((metric) => (
              <article key={metric.label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
                <p className="text-xs text-[var(--color-fg-muted)]">{metric.context}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-[var(--color-fg)]">{metric.value}</p>
                <p className="mt-0.5 font-mono text-[11px] text-indigo-400">{metric.label}</p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal delayClass="reveal-delay-3">
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold">Featured Projects</h2>
          <div className="space-y-4">
            {featuredProjects.slice(0, 3).map((project) => (
              <article key={project.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[11px] tracking-[0.16em] text-indigo-400 uppercase">{project.kicker}</p>
                    <h3 className="mt-1 font-semibold truncate">{project.name}</h3>
                    <p className="mt-2 text-sm text-[var(--color-fg-muted)] line-clamp-2">{project.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button onClick={() => navigate('work', project.id)} className={buttonClass({ size: 'sm' })}>
                      Details
                    </button>
                    {project.links.live && (
                      <a href={project.links.live} target="_blank" rel="noreferrer" className={buttonClass({ variant: 'outline', size: 'sm' })}>
                        Live
                      </a>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.technologies.slice(0, 5).map((tech) => (
                    <Badge key={tech} className="text-[10px]">{tech}</Badge>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal delayClass="reveal-delay-4">
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold">Skills & Technologies</h2>
          <div className="flex flex-wrap gap-2">
            {skillGroups.flatMap((group) => group.items).slice(0, 15).map((skill) => (
              <Badge key={skill} className="group-hover:border-indigo-400/50 group-hover:text-[var(--color-fg)]">{skill}</Badge>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal delayClass="reveal-delay-5">
        <div className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-6 text-center">
          <p className="font-mono text-[11px] tracking-[0.16em] text-indigo-400 uppercase">Portfolio v{latestVersion.replace('v', '')}</p>
          <p className="mt-2 text-[var(--color-fg-muted)]">
            This is the Recruiter Mode — a simplified view optimized for quick scanning.
            Press <kbd className="px-1.5 py-0.5 bg-[var(--color-bg-muted)] rounded text-xs font-mono">{typeof window !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'}</kbd>+<kbd className="px-1.5 py-0.5 bg-[var(--color-bg-muted)] rounded text-xs font-mono">K</kbd> for full workspace.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a href={site.resumePath} target="_blank" rel="noreferrer" className={cn(buttonClass({ size: 'lg' }), 'w-full sm:w-auto')}>
              <Download className="size-4" /> Download Resume
            </a>
            <a href={`mailto:${site.email}`} className={cn(buttonClass({ variant: 'outline', size: 'lg' }), 'w-full sm:w-auto')}>
              <Mail className="size-4" /> Contact Me
            </a>
            <a href={site.linkedin} target="_blank" rel="noreferrer" className={cn(buttonClass({ variant: 'ghost', size: 'lg' }), 'w-full sm:w-auto')}>
              <LinkedInIcon className="size-4" /> LinkedIn
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  )
}