import { SectionHeading } from '@/components/SectionHeading'
import { education } from '@/data/site'
import { Reveal } from '@/hooks/useReveal'

export function Education() {
  return (
    <section id="education" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <SectionHeading kicker="05 / Education" title="Education" />
        <ul className="grid gap-4 md:grid-cols-2">
          {education.map((item) => (
            <li
              key={item.title}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6"
            >
              <p className="font-mono text-xs text-indigo-400">{item.period}</p>
              <h3 className="mt-2 font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-[var(--color-fg-muted)]">{item.school}</p>
              <p className="text-sm text-[var(--color-fg-muted)]">{item.place}</p>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}
