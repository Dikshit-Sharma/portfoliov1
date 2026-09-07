import { ArrowUpRight } from 'lucide-react'
import { Card } from '@/dashboard/components/charts'
import { Badge } from '@/components/ui/badge'
import { skillGroups, amliLinks } from '@/data/site'

const PROJECTS = [
  {
    title: 'AMLI Tools',
    kicker: 'Personal Project · Developer Productivity Platform',
    description:
      'Internal-tools-style platform to make repetitive engineering workflows faster — API artifacts, credential management, BSA tracking and reporting.',
    tags: ['React 19', 'Firebase', 'Netlify Functions', 'GitLab API', 'Groq', 'Edge Extension'],
    links: [{ href: amliLinks.live, label: 'Live app' }],
  },
  {
    title: 'Axis Max Life Insurance',
    kicker: 'Professional work',
    description:
      'Microservices-based insurance applications for policy management, customer onboarding and claim-processing workflows.',
    tags: ['Java', 'Spring Boot', 'AWS', 'Lambda', 'API Gateway', 'SQS', 'DynamoDB'],
  },
  {
    title: 'Travel Booking System',
    kicker: 'Internship project',
    description:
      'Team internship project: a responsive booking experience with login, registration, travel booking and MySQL-backed data.',
    tags: ['HTML', 'CSS', 'JavaScript', 'MySQL', 'GitHub'],
  },
]

export function ProjectsSkillsSection() {
  return (
    <div className="space-y-6">
      <Card title="Skills">
        <div className="grid gap-4 sm:grid-cols-2">
          {skillGroups.map((group) => (
            <div key={group.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4">
              <p className="mb-2 font-mono text-[11px] tracking-[0.16em] text-indigo-400 uppercase">{group.label}</p>
              <ul className="flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <li key={item}>
                    <Badge>{item}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Projects">
        <div className="grid gap-4 lg:grid-cols-3">
          {PROJECTS.map((p) => (
            <article
              key={p.title}
              className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4"
            >
              <p className="font-mono text-[10px] tracking-[0.14em] text-indigo-400 uppercase">{p.kicker}</p>
              <h4 className="mt-1 font-semibold text-[var(--color-fg)]">{p.title}</h4>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-[var(--color-fg-muted)]">{p.description}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {p.tags.slice(0, 4).map((t) => (
                  <li key={t}><Badge className="opacity-80">{t}</Badge></li>
                ))}
              </ul>
              {p.links?.length && (
                <div className="mt-3">
                  {p.links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:underline">
                      {l.label} <ArrowUpRight className="size-3" />
                    </a>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </Card>
    </div>
  )
}