import { Suspense, lazy } from 'react'

const ExperiencePage = lazy(() => import('@/components/Experience').then((m) => ({ default: m.Experience })))
const SectionHeading = lazy(() => import('@/components/SectionHeading').then((m) => ({ default: m.SectionHeading })))

/**
 * Experience application — professional timeline.
 */
export default function ExperienceApp() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center font-mono text-xs text-[var(--text-muted)]">
          loading experience…
        </div>
      }
    >
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <SectionHeading
          kicker="experience"
          title="Professional Experience"
          description="Engineering roles and responsibilities, with evidence-backed impact."
        />
        <ExperiencePage />
      </div>
    </Suspense>
  )
}