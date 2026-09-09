import { SectionHeading } from '@/components/SectionHeading'
import { skillGroups } from '@/data/site'
import { TechBadge } from '@/components/workspace/TechBadge'
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
          title="Installed Modules"
          description="The stack as an environment — grouped by how I actually use it, no fabricated proficiency bars. Select a module to inspect where it is used."
        />
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)] font-mono">
          <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-bg-muted)] px-4 py-2 text-xs text-[var(--color-fg-muted)]">
            <span className="text-[var(--color-accent)]">$</span> pkg list
            <span className="ml-auto hidden text-[10px] sm:inline">click a module to inspect</span>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {skillGroups.map((group) => {
              const Icon = icons[group.id]
              return (
                <div
                  key={group.id}
                  className="flex flex-col gap-3 bg-[var(--color-bg-elevated)] px-4 py-4 sm:flex-row sm:items-start sm:gap-4"
                >
                  <div className="flex w-44 shrink-0 items-center gap-2">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-sm border border-[var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-accent)]">
                      <Icon className="size-3.5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-[var(--color-fg)]">{group.label}</p>
                      <p className="text-[10px] text-[var(--color-fg-muted)]">{group.items.length} modules</p>
                    </div>
                  </div>
                  <ul className="flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <li key={item}>
                        <TechBadge tech={item} className="text-[10px]" />
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
