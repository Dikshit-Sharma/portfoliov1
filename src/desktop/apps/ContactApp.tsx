import { Suspense, lazy } from 'react'

const ContactPage = lazy(() => import('@/components/ContactPage').then((m) => ({ default: m.ContactPage })))

/**
 * Contact application — email, location, social links.
 */
export default function ContactApp() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center font-mono text-xs text-[var(--text-muted)]">
          loading contact…
        </div>
      }
    >
      <ContactPage />
    </Suspense>
  )
}