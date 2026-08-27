import { SectionHeading } from '@/components/SectionHeading'
import { Badge } from '@/components/ui/badge'
import { cognizantRole, internRole } from '@/data/site'
import { Reveal } from '@/hooks/useReveal'

export function Experience() {
  return (
    <section id="experience" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <SectionHeading kicker="03 / Experience" title="Professional Experience" />
        <ol className="relative ml-3 border-l border-[var(--color-border)] pl-6 sm:ml-4 sm:pl-8">
          <li className="relative pb-14">
            <span className="absolute top-1 -left-[31px] size-3 rounded-full border-2 border-indigo-400 bg-[var(--color-bg)] sm:-left-[39px]" />
            <p className="font-mono text-xs text-indigo-400">{cognizantRole.period}</p>
            <h3 className="mt-1 text-lg font-semibold">{cognizantRole.title}</h3>
            <p className="text-sm text-[var(--color-fg-muted)]">{cognizantRole.company}</p>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[var(--color-fg-muted)]">
              {cognizantRole.bullets.map((item) => (
                <li key={item} className="pl-3 -indent-3">
                  — {item}
                </li>
              ))}
            </ul>
            <ul className="mt-4 flex flex-wrap gap-2">
              {cognizantRole.tech.map((tech) => (
                <li key={tech}>
                  <Badge>{tech}</Badge>
                </li>
              ))}
            </ul>
          </li>
          <li className="relative">
            <span className="absolute top-1 -left-[31px] size-3 rounded-full border-2 border-violet-400 bg-[var(--color-bg)] sm:-left-[39px]" />
            <p className="font-mono text-xs text-indigo-400">{internRole.period}</p>
            <h3 className="mt-1 text-lg font-semibold">{internRole.title}</h3>
            <p className="text-sm text-[var(--color-fg-muted)]">{internRole.company}</p>
            <p className="mt-3 text-sm font-medium text-[var(--color-fg)]">
              Project: {internRole.project}
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--color-fg-muted)]">
              {internRole.bullets.map((item) => (
                <li key={item} className="pl-3 -indent-3">
                  — {item}
                </li>
              ))}
            </ul>
          </li>
        </ol>
      </Reveal>
    </section>
  )
}
