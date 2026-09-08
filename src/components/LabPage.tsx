import { SectionHeading } from '@/components/SectionHeading'
import { labProjects, getLabProjects, labCategories, labStatuses } from '@/data/lab'
import { Reveal } from '@/hooks/useReveal'
import { Badge } from '@/components/ui/badge'
import { buttonClass } from '@/components/ui/button'
import { ArrowUpRight } from 'lucide-react'
import { navigate } from '@/lib/router'
import { cn } from '@/lib/utils'

export function LabPage() {
  return (
    <section id="lab" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <SectionHeading
          kicker="02 / Lab"
          title="Experimental Lab"
          description="Things I'm building because they seemed interesting. Personal experiments, developer tools, and side projects."
        />
      </Reveal>

      {labCategories.map((category) => {
        const projects = getLabProjects(category.id)
        if (projects.length === 0) return null

        return (
          <Reveal key={category.id} delayClass="reveal-delay-1">
            <section className="mt-12">
              <div className="mb-6 flex items-center gap-2">
                <span className="text-2xl">{category.emoji}</span>
                <h3 className="text-xl font-semibold">{category.label}</h3>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <article
                    key={project.id}
                    className="group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5 transition-transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-mono text-[11px] tracking-[0.16em] text-indigo-400 uppercase">{category.label}</p>
                      <Badge className={cn(
                        'text-xs',
                        project.status === 'building' && 'text-amber-400 border-amber-400/30',
                        project.status === 'experiment' && 'text-violet-400 border-violet-400/30',
                        project.status === 'stable' && 'text-emerald-400 border-emerald-400/30',
                        project.status === 'archived' && 'text-zinc-500 border-zinc-500/30',
                      )}>
                        {labStatuses[project.status].label}
                      </Badge>
                    </div>
                    <h4 className="text-lg font-semibold">{project.name}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-fg-muted)]">{project.description}</p>
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {project.technologies.map((tech) => (
                        <li key={tech}>
                          <Badge className="text-[10px] opacity-80 group-hover:opacity-100">{tech}</Badge>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={buttonClass({ size: 'sm' })}
                        onClick={() => navigate('lab', project.id)}
                      >
                        Details
                        <ArrowUpRight className="size-3.5" />
                      </button>
                      {project.links?.source && (
                        <a href={project.links.source} target="_blank" rel="noreferrer" className={buttonClass({ variant: 'outline', size: 'sm' })}>
                          Source
                        </a>
                      )}
                      {project.links?.live && (
                        <a href={project.links.live} target="_blank" rel="noreferrer" className={buttonClass({ variant: 'ghost', size: 'sm' })}>
                          Live
                        </a>
                      )}
                    </div>
                    {project.started && (
                      <p className="mt-3 font-mono text-[10px] text-[var(--color-fg-muted)]">
                        Started: {project.started}{project.updated ? ` · Updated: ${project.updated}` : ''}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          </Reveal>
        )
      })}
    </section>
  )
}

export function LabDetailPage({ projectId }: { projectId: string }) {
  const project = labProjects.find(p => p.id === projectId)
  
  if (!project) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 text-center">
        <h2 className="text-2xl font-semibold">Experiment not found</h2>
        <p className="mt-4 text-[var(--color-fg-muted)]">The experiment you're looking for doesn't exist.</p>
        <button onClick={() => navigate('lab')} className={buttonClass({ variant: 'outline', size: 'sm' })} style={{ marginTop: '1rem' }}>
          Back to Lab
        </button>
      </section>
    )
  }

  return (
    <section id={`lab-${project.id}`} className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <Reveal>
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button onClick={() => navigate('lab')} className="inline-flex items-center gap-1 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]">
              <ArrowUpRight className="size-3.5 rotate-180" /> Back to Lab
            </button>
            <p className="mt-2 font-mono text-[11px] tracking-[0.16em] text-indigo-400 uppercase">{labCategories.find(c => c.id === project.category)?.label || 'Experiment'}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{project.name}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn(
              project.status === 'building' && 'text-amber-400 border-amber-400/30',
              project.status === 'experiment' && 'text-violet-400 border-violet-400/30',
              project.status === 'stable' && 'text-emerald-400 border-emerald-400/30',
              project.status === 'archived' && 'text-zinc-500 border-zinc-500/30',
            )}>
              {labStatuses[project.status].label}
            </Badge>
          </div>
        </div>
      </Reveal>

      <Reveal delayClass="reveal-delay-1">
        <div className="space-y-8">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="mt-3 text-[var(--color-fg-muted)]">{project.description}</p>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
            <h3 className="text-lg font-semibold">Technology Stack</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <li key={tech}>
                  <Badge className="group-hover:border-indigo-400/50 group-hover:text-[var(--color-fg)]">{tech}</Badge>
                </li>
              ))}
            </ul>
          </div>

          {project.links && (project.links.live || project.links.source) && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
              <h3 className="text-lg font-semibold">Links</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.links.live && (
                  <a href={project.links.live} target="_blank" rel="noreferrer" className={buttonClass({ variant: 'outline', size: 'sm' })}>
                    <ArrowUpRight className="size-3.5" /> Live
                  </a>
                )}
                {project.links.source && (
                  <a href={project.links.source} target="_blank" rel="noreferrer" className={buttonClass({ variant: 'ghost', size: 'sm' })}>
                    Source
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
            <h3 className="text-lg font-semibold">Timeline</h3>
            <p className="mt-3 font-mono text-[11px] text-[var(--color-fg-muted)]">
              Started: {project.started || '—'}{project.updated ? ` · Last updated: ${project.updated}` : ''}
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  )
}