import { SectionHeading } from '@/components/SectionHeading'
import { Reveal } from '@/hooks/useReveal'
import { getImpactMetrics } from '@/data/impact'
import { buttonClass } from '@/components/ui/button'
import { navigate } from '@/lib/router'

export function ImpactSection() {
  const metrics = getImpactMetrics()

  return (
    <section id="impact" className="border-t border-[var(--color-border)]">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <SectionHeading
            kicker="Impact"
            title="Measurable Results"
            description="Quantified outcomes from real engineering work — no invented numbers."
          />
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, i) => (
            <Reveal key={metric.id} delayClass={`reveal-delay-${Math.min(i, 3)}`}>
              <article className="group h-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
                <p className="font-mono text-3xl font-semibold tracking-tight text-indigo-400">
                  {metric.value}
                </p>
                <h3 className="mt-3 font-medium text-[var(--color-fg)]">{metric.label}</h3>
                <p className="mt-1 text-sm text-[var(--color-fg-muted)]">{metric.context}</p>
                <p className="mt-4 border-t border-[var(--color-border)] pt-3 text-xs leading-relaxed text-[var(--color-fg-muted)]">
                  {metric.source}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delayClass="reveal-delay-3">
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('recruiter')}
              className={buttonClass({ variant: 'outline', size: 'lg' })}
            >
              View full resume
            </button>
            <button
              type="button"
              onClick={() => navigate('work')}
              className={buttonClass({ size: 'lg' })}
            >
              Explore the work behind these
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}