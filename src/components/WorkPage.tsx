import { SectionHeading } from '@/components/SectionHeading'
import { projects, getFeaturedProjects, getProjectsByCategory, type Project } from '@/data/projects'
import { ProjectCard } from '@/components/ProjectCard'
import { TechBadge } from '@/components/workspace/TechBadge'
import { Reveal } from '@/hooks/useReveal'
import { ArrowUpRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonClass } from '@/components/ui/button'
import { navigate } from '@/lib/router'
import { cn } from '@/lib/utils'

export function WorkPage() {
  const featured = getFeaturedProjects()
  const personal = getProjectsByCategory('personal')
  const professional = getProjectsByCategory('professional')

  function ProjectDetailCard({ project }: { project: Project }) {
    return (
      <article className="group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-[0_20px_50px_-40px_rgba(0,0,0,0.8)] transition-transform hover:-translate-y-1">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent" />
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <p className="font-mono text-[11px] tracking-[0.16em] text-indigo-400 uppercase">{project.kicker}</p>
              {project.status && (
                <Badge className={cn(
                  'text-xs',
                  project.status === 'production' && 'text-emerald-400 border-emerald-400/30',
                  project.status === 'building' && 'text-amber-400 border-amber-400/30',
                  project.status === 'experiment' && 'text-violet-400 border-violet-400/30',
                  project.status === 'stable' && 'text-emerald-400 border-emerald-400/30',
                  project.status === 'archived' && 'text-zinc-500 border-zinc-500/30',
                )}>
                  {project.status.toUpperCase()}
                </Badge>
              )}
            </div>
            <h3 className="text-2xl font-semibold tracking-tight">{project.name}</h3>
            <p className="mt-4 text-sm leading-relaxed text-[var(--color-fg-muted)]">{project.description}</p>
            {project.longDescription && (
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-fg-muted)]">{project.longDescription}</p>
            )}
            {project.problem && (
              <div className="mt-4 p-3 rounded-lg bg-[var(--color-bg-muted)] border-l-2 border-indigo-400">
                <p className="font-mono text-[10px] text-indigo-400 uppercase">Problem</p>
                <p className="mt-1 text-sm text-[var(--color-fg-muted)]">{project.problem}</p>
              </div>
            )}
            {project.solution && (
              <div className="mt-4 p-3 rounded-lg bg-[var(--color-bg-muted)] border-l-2 border-emerald-400">
                <p className="font-mono text-[10px] text-emerald-400 uppercase">Solution</p>
                <p className="mt-1 text-sm text-[var(--color-fg-muted)]">{project.solution}</p>
              </div>
            )}
            <ul className="mt-5 flex flex-wrap gap-2">
              {project.capabilities.map((item) => (
                <li key={item} className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-xs text-[var(--color-fg-muted)]">
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                className={buttonClass({ size: 'sm' })}
                onClick={() => navigate('work', project.id)}
              >
                Deep Dive
                <ArrowUpRight className="size-3.5" />
              </button>
              {project.links.live && (
                <a
                  href={project.links.live}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClass({ variant: 'outline', size: 'sm' })}
                >
                  Live
                  <ArrowUpRight className="size-3.5" />
                </a>
              )}
              {project.links.source && (
                <a
                  href={project.links.source}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClass({ variant: 'ghost', size: 'sm' })}
                >
                  Source
                </a>
              )}
            </div>
          </div>
          <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-muted)] p-6 lg:border-t-0 lg:border-l">
            <p className="mb-3 font-mono text-[11px] text-[var(--color-fg-muted)]">Stack</p>
            <ul className="flex flex-wrap gap-2">
              {project.technologies.map((tag) => (
                <li key={tag}>
                  <TechBadge tech={tag} className="opacity-80 group-hover:opacity-100 group-hover:border-indigo-400/50" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>
    )
  }

  return (
    <section id="work" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <SectionHeading
          kicker="01 / Work"
          title="What I've Built"
          description="Professional systems at Cognizant, plus personal developer tools that solve real engineering problems."
        />
      </Reveal>

      <Reveal delayClass="reveal-delay-1">
        <div className="space-y-8">
          {featured.map((project) => (
            <ProjectDetailCard key={project.id} project={project} />
          ))}
        </div>
      </Reveal>

      <Reveal delayClass="reveal-delay-2">
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {personal.filter(p => !p.featured).map((project) => (
            <ProjectCard
              key={project.id}
              kicker={project.kicker}
              title={project.name}
              description={project.description}
              tags={project.technologies}
              capabilities={project.capabilities}
              links={Object.entries(project.links).map(([k, v]) => ({ href: v!, label: k }))}
              onOpen={() => navigate('work', project.id)}
            />
          ))}
        </div>
      </Reveal>

      <Reveal delayClass="reveal-delay-3">
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {professional.filter(p => !p.featured).map((project) => (
            <ProjectCard
              key={project.id}
              kicker={project.kicker}
              title={project.name}
              description={project.description}
              tags={project.technologies}
              capabilities={project.capabilities}
              production={project.status === 'production'}
              onOpen={() => navigate('work', project.id)}
            />
          ))}
        </div>
      </Reveal>
    </section>
  )
}

export function ProjectDetailPage({ projectId }: { projectId: string }) {
  const project = projects.find(p => p.id === projectId)
  
  if (!project) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 text-center">
        <h2 className="text-2xl font-semibold">Project not found</h2>
        <p className="mt-4 text-[var(--color-fg-muted)]">The project you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('work')}
          className={buttonClass({ variant: 'outline', size: 'sm' })} style={{ marginTop: '1rem' }}
        >
          Back to Work
        </button>
      </section>
    )
  }

  return (
    <section id={`work-${project.id}`} className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('work')}
              className="inline-flex items-center gap-1 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
            >
              <ArrowUpRight className="size-3.5 rotate-180" /> Back to Work
            </button>
            <p className="mt-2 font-mono text-[11px] tracking-[0.16em] text-indigo-400 uppercase">{project.kicker}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{project.name}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {project.status && (
              <Badge className={cn(
                project.status === 'production' && 'text-emerald-400 border-emerald-400/30',
                project.status === 'building' && 'text-amber-400 border-amber-400/30',
                project.status === 'experiment' && 'text-violet-400 border-violet-400/30',
                project.status === 'stable' && 'text-emerald-400 border-emerald-400/30',
                project.status === 'archived' && 'text-zinc-500 border-zinc-500/30',
              )}>
                {project.status.toUpperCase()}
              </Badge>
            )}
            {project.links.live && (
              <a href={project.links.live} target="_blank" rel="noreferrer" className={buttonClass({ variant: 'outline', size: 'sm' })}>
                Live
                <ArrowUpRight className="size-3.5" />
              </a>
            )}
            {project.links.source && (
              <a href={project.links.source} target="_blank" rel="noreferrer" className={buttonClass({ variant: 'ghost', size: 'sm' })}>
                Source
              </a>
            )}
          </div>
        </div>
      </Reveal>

      <Reveal delayClass="reveal-delay-1">
        <div className="space-y-12">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <p className="text-lg leading-relaxed text-[var(--color-fg-muted)]">{project.description}</p>
                {project.longDescription && <p className="mt-4 text-lg leading-relaxed text-[var(--color-fg-muted)]">{project.longDescription}</p>}
              </div>

              {project.problem && (
                <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
                  <h3 className="flex items-center gap-2 font-semibold"><span className="text-indigo-400">01</span> Problem</h3>
                  <p className="mt-4 text-[var(--color-fg-muted)]">{project.problem}</p>
                </section>
              )}

              {project.solution && (
                <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
                  <h3 className="flex items-center gap-2 font-semibold"><span className="text-emerald-400">02</span> Solution</h3>
                  <p className="mt-4 text-[var(--color-fg-muted)]">{project.solution}</p>
                </section>
              )}

              {project.architecture && (
                <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
                  <h3 className="flex items-center gap-2 font-semibold"><span className="text-amber-400">03</span> Architecture</h3>
                  <p className="mt-4 text-[var(--color-fg-muted)]">{project.architecture}</p>
                </section>
              )}

              {project.deepDive && (
                <>
                  {project.deepDive.apis && (
                    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
                      <h3 className="flex items-center gap-2 font-semibold"><span className="text-violet-400">04</span> APIs</h3>
                      <p className="mt-4 text-[var(--color-fg-muted)]">{project.deepDive.apis}</p>
                    </section>
                  )}
                  {project.deepDive.database && (
                    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
                      <h3 className="flex items-center gap-2 font-semibold"><span className="text-violet-400">05</span> Database</h3>
                      <p className="mt-4 text-[var(--color-fg-muted)]">{project.deepDive.database}</p>
                    </section>
                  )}
                  {project.deepDive.auth && (
                    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
                      <h3 className="flex items-center gap-2 font-semibold"><span className="text-violet-400">06</span> Authentication</h3>
                      <p className="mt-4 text-[var(--color-fg-muted)]">{project.deepDive.auth}</p>
                    </section>
                  )}
                  {project.deepDive.caching && (
                    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
                      <h3 className="flex items-center gap-2 font-semibold"><span className="text-violet-400">07</span> Caching</h3>
                      <p className="mt-4 text-[var(--color-fg-muted)]">{project.deepDive.caching}</p>
                    </section>
                  )}
                  {project.deepDive.errorHandling && (
                    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
                      <h3 className="flex items-center gap-2 font-semibold"><span className="text-violet-400">08</span> Error Handling</h3>
                      <p className="mt-4 text-[var(--color-fg-muted)]">{project.deepDive.errorHandling}</p>
                    </section>
                  )}
                  {project.deepDive.monitoring && (
                    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
                      <h3 className="flex items-center gap-2 font-semibold"><span className="text-violet-400">09</span> Monitoring</h3>
                      <p className="mt-4 text-[var(--color-fg-muted)]">{project.deepDive.monitoring}</p>
                    </section>
                  )}
                  {project.deepDive.deployment && (
                    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
                      <h3 className="flex items-center gap-2 font-semibold"><span className="text-violet-400">10</span> Deployment</h3>
                      <p className="mt-4 text-[var(--color-fg-muted)]">{project.deepDive.deployment}</p>
                    </section>
                  )}
                  {project.deepDive.tradeoffs && (
                    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
                      <h3 className="flex items-center gap-2 font-semibold"><span className="text-amber-400">11</span> Trade-offs</h3>
                      <p className="mt-4 text-[var(--color-fg-muted)]">{project.deepDive.tradeoffs}</p>
                    </section>
                  )}
                  {project.deepDive.lessonsLearned && (
                    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
                      <h3 className="flex items-center gap-2 font-semibold"><span className="text-emerald-400">12</span> Lessons Learned</h3>
                      <p className="mt-4 text-[var(--color-fg-muted)]">{project.deepDive.lessonsLearned}</p>
                    </section>
                  )}
                </>
              )}

              <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
                <h3 className="flex items-center gap-2 font-semibold"><span className="text-indigo-400">Tech</span> Technology Stack</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {project.technologies.map((tag) => (
                    <li key={tag}>
                      <TechBadge tech={tag} className="group-hover:border-indigo-400/50 group-hover:text-[var(--color-fg)]" />
                    </li>
                  ))}
                </ul>
              </section>
            </div>
            <div className="space-y-6">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
                <h4 className="font-semibold">Capabilities</h4>
                <ul className="mt-3 space-y-2">
                  {project.capabilities.map((cap) => (
                    <li key={cap} className="flex items-center gap-2 text-sm text-[var(--color-fg-muted)]">
                      <span className="size-1.5 rounded-full bg-indigo-400" />
                      {cap}
                    </li>
                  ))}
                </ul>
              </div>
              {project.links.live || project.links.source && (
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
                  <h4 className="font-semibold">Links</h4>
                  <div className="mt-3 flex flex-col gap-2">
                    {project.links.live && (
                      <a href={project.links.live} target="_blank" rel="noreferrer" className={buttonClass({ variant: 'outline', size: 'sm' })}>
                        <ArrowUpRight className="size-3.5" /> Live Application
                      </a>
                    )}
                    {project.links.source && (
                      <a href={project.links.source} target="_blank" rel="noreferrer" className={buttonClass({ variant: 'ghost', size: 'sm' })}>
                        Source Code
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}