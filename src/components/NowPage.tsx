import { SectionHeading } from '@/components/SectionHeading'
import { getNowData } from '@/data/now'
import { Reveal } from '@/hooks/useReveal'

export function NowPage() {
  const data = getNowData()

  const sections = [
    { key: 'building', label: 'Currently Building', emoji: '🔨' },
    { key: 'learning', label: 'Learning', emoji: '📚' },
    { key: 'experimenting', label: 'Experimenting', emoji: '🧪' },
    { key: 'reading', label: 'Reading', emoji: '📖' },
  ] as const

  return (
    <section id="now" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <SectionHeading
          kicker="03 / Now"
          title="Now"
          description={`Current focus as of ${data.updated}. What I'm building, learning, and exploring right now.`}
        />
      </Reveal>

      <Reveal delayClass="reveal-delay-1">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {sections.map((section) => {
            const items = data[section.key] || []
            return (
              <article key={section.key} className="relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-2xl">{section.emoji}</span>
                  <h3 className="font-semibold">{section.label}</h3>
                </div>
                <ul className="space-y-3">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[var(--color-fg)]">
                      <span className="mt-0.5 size-1.5 rounded-full shrink-0" style={{ backgroundColor: 'currentColor' }} />
                      {item}
                    </li>
                  ))}
                </ul>
                {items.length === 0 && (
                  <p className="text-sm text-[var(--color-fg-muted)]">Nothing at the moment.</p>
                )}
              </article>
            )
          })}
        </div>
      </Reveal>
    </section>
  )
}