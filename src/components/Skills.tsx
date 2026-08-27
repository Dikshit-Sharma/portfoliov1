import { SectionHeading } from '@/components/SectionHeading'
import { Badge } from '@/components/ui/badge'
import { skillGroups } from '@/data/site'
import { Reveal } from '@/hooks/useReveal'
import {
  Box,
  Cloud,
  Code2,
  Database,
  Layout,
  Monitor,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const icons: Record<(typeof skillGroups)[number]['id'], LucideIcon> = {
  languages: Code2,
  backend: Box,
  frontend: Layout,
  aws: Cloud,
  databases: Database,
  tools: Wrench,
  ides: Monitor,
}

export function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <SectionHeading
          kicker="02 / Skills"
          title="Technical Skills"
          description="Grouped by how I actually use them — no fabricated proficiency bars."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {skillGroups.map((group) => {
            const Icon = icons[group.id]
            return (
              <article
                key={group.id}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5 transition-colors hover:border-indigo-500/40"
              >
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-bg-muted)] text-indigo-400">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <h3 className="font-medium">{group.label}</h3>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li key={item}>
                      <Badge className="transition-transform hover:-translate-y-0.5 hover:border-indigo-500/50 hover:text-[var(--color-fg)]">
                        {item}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      </Reveal>
    </section>
  )
}
