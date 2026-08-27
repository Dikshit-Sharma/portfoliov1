import { ArrowUpRight, Lock, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonClass } from '@/components/ui/button'
import { amliLinks, axisStack } from '@/data/site'
import { cn } from '@/lib/utils'

export function ProjectCard({
  kicker,
  title,
  description,
  tags,
  capabilities,
  onOpen,
  links,
  production,
}: {
  kicker: string
  title: string
  description: string
  tags: readonly string[]
  capabilities: readonly string[]
  onOpen?: () => void
  links?: readonly { href: string; label: string }[]
  production?: boolean
}) {
  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]',
        'shadow-[0_20px_50px_-40px_rgba(0,0,0,0.8)] transition-transform hover:-translate-y-1',
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent" />
      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-6 sm:p-8">
          <p className="font-mono text-[11px] tracking-[0.16em] text-indigo-400 uppercase">{kicker}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h3>
          {production ? (
            <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-xs text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              Production Experience
            </p>
          ) : null}
          <p className="mt-4 text-sm leading-relaxed text-[var(--color-fg-muted)]">{description}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {capabilities.map((item) => (
              <li
                key={item}
                className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-xs text-[var(--color-fg-muted)]"
              >
                {item}
              </li>
            ))}
          </ul>
          {onOpen || links?.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {onOpen ? (
                <button type="button" className={buttonClass()} onClick={onOpen}>
                  View details
                  <ArrowUpRight className="size-4" />
                </button>
              ) : null}
              {links?.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClass({ variant: 'outline' })}
                >
                  {link.label}
                  <ArrowUpRight className="size-4" />
                </a>
              ))}
            </div>
          ) : null}
        </div>
        <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-muted)] p-6 lg:border-t-0 lg:border-l">
          <p className="mb-3 font-mono text-[11px] text-[var(--color-fg-muted)]">Stack</p>
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag}>
                <Badge className="opacity-80 group-hover:opacity-100">{tag}</Badge>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  )
}

export function Projects({ onOpenAmli }: { onOpenAmli: () => void }) {
  return (
    <div className="space-y-6">
      <ProjectCard
        kicker="Personal Project · Developer Productivity Platform"
        title="AMLI Tools"
        description="A full-stack internal-tools-style platform created as a personal project to make repetitive engineering workflows easier while working on the Axis Max Life Insurance project. It is not an official Cognizant product."
        tags={[
          'React 19',
          'Firebase',
          'Netlify Functions',
          'GitLab API',
          'Groq',
          'Edge Extension',
        ]}
        capabilities={[
          'AES encryption',
          'API artifacts',
          'Credential management',
          'BSA tracking',
          'GitLab analytics',
          'Reporting',
        ]}
        onOpen={onOpenAmli}
        links={[
          { href: amliLinks.live, label: 'Live app' },
          { href: amliLinks.extension, label: 'RepoScope v2.1.0' },
        ]}
      />
      <ProjectCard
        kicker="Professional work"
        title="Axis Max Life Insurance"
        description="Developed and maintained microservices-based insurance applications for policy management, customer onboarding, and claim-processing workflows."
        tags={axisStack}
        capabilities={[
          'Microservices',
          'REST APIs',
          'AWS integration',
          'Event-driven communication',
          'Policy workflows',
          'Customer onboarding',
          'Claim workflows',
        ]}
        production
      />
      <ProjectCard
        kicker="Internship project"
        title="Travel Booking System"
        description="Team internship project: a responsive booking experience with login, registration, travel booking, and MySQL-backed data management."
        tags={['HTML', 'CSS', 'JavaScript', 'MySQL', 'GitHub']}
        capabilities={['Auth flows', 'Booking workflows', 'Responsive UI', 'Collaboration']}
      />
    </div>
  )
}

export function StorySection() {
  const steps = [
    'Axis Max Life Insurance',
    'Repeated engineering workflows',
    'Manual / fragmented processes',
    'AMLI Tools',
    'Centralized developer productivity platform',
  ]

  return (
    <section className="mt-16 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 sm:p-8">
      <p className="font-mono text-[11px] tracking-[0.16em] text-indigo-400 uppercase">
        From solving problems to building tools
      </p>
      <h3 className="mt-2 text-xl font-semibold">The story connecting the work</h3>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--color-fg-muted)]">
        Working with API documentation, encryption workflows, credentials, BSA tracking, and GitLab
        information exposed repetitive tasks that could be streamlined. AMLI Tools was created as a
        personal project to make these workflows faster and more organized.
      </p>
      <ol className="mt-8 grid gap-3 sm:grid-cols-5">
        {steps.map((step, index) => (
          <li key={step} className="relative rounded-lg border border-[var(--color-border)] p-3">
            <span className="font-mono text-[10px] text-indigo-400">
              {String(index + 1).padStart(2, '0')}
            </span>
            <p className="mt-2 text-sm">{step}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6 flex items-start gap-2 text-xs text-[var(--color-fg-muted)]">
        <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        AMLI Tools is a personal project inspired by workflows on Axis Max Life Insurance — not
        company-owned software.
      </p>
      <p className="mt-2 flex items-start gap-2 text-xs text-[var(--color-fg-muted)]">
        <Shield className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        No production usage statistics are claimed for AMLI Tools.
      </p>
    </section>
  )
}
