import { ArrowUpRight, X } from 'lucide-react'
import { useEffect } from 'react'
import { ArchitectureDiagram } from '@/components/ArchitectureDiagram'
import { Badge } from '@/components/ui/badge'
import { Button, buttonClass } from '@/components/ui/button'
import { amliLinks, amliStack } from '@/data/site'

const features = [
  {
    title: 'AES Encryption Toolkit',
    body: 'AES-256 encryption and decryption in the browser using the Web Crypto API, with GCM and CBC, key generation, key history, and a dedicated encryption/decryption workspace.',
    note: 'Plaintext and encryption keys are processed client-side and are not sent to the server.',
    items: ['AES-256', 'Web Crypto API', 'GCM', 'CBC', 'Key generation', 'Key history'],
  },
  {
    title: 'API Artifacts Manager',
    body: 'A working surface for API documentation and related artifacts — tickets, environments, requests, samples, and packaging — in one place.',
    items: [
      'API documentation',
      'Jira ticket tracking',
      'Environment tracking',
      'cURL storage',
      'JSON response samples',
      'Encryption status',
      'Request volume',
      'cURL validation',
      'Automatic method/URL/header/body extraction',
      'Bulk import',
      'ZIP generation',
      'Masked payload generation',
      'Artifact comparison',
    ],
  },
  {
    title: 'Credentials Vault',
    body: 'Environment-specific credentials with masking, extraction from API artifacts, and protected access. Secrets are never exposed directly through API responses. This portfolio does not display any real credentials.',
    items: ['DEV', 'UAT', 'PROD', 'Credential masking', 'Protected access'],
  },
  {
    title: 'BSA Tracker',
    body: 'Tracking for API consumers and SPOCs, with search, filtering, and operational reporting.',
    items: [
      'API consumers',
      'SPOCs',
      'Search',
      'Filtering',
      'Duplicate detection',
      'Version history',
      'Rollback',
      'Bulk editing',
      'CSV import',
      'Excel export',
      'Consumer overlap matrix',
      'Activity feed',
      'Weekly reports',
    ],
  },
]

const security = [
  {
    title: 'Client-side encryption',
    body: 'AES operations happen in the browser.',
  },
  {
    title: 'Credential masking',
    body: 'Credentials are masked and protected.',
  },
  {
    title: 'CORS restrictions',
    body: 'Serverless functions restrict allowed origins.',
  },
  {
    title: 'SSRF protection',
    body: 'GitLab proxy access is restricted to allowed GitLab domains.',
  },
  {
    title: 'Server-side AI key protection',
    body: 'Groq API credentials are not exposed to the frontend.',
  },
  {
    title: 'Production source-map protection',
    body: 'Source maps are disabled in the production build.',
  },
  {
    title: 'Error monitoring',
    body: 'Sentry is used for error tracking and session replay.',
  },
]

export function AmliToolsDetail({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[color-mix(in_srgb,var(--color-bg)_92%,transparent)] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="amli-title"
    >
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-5 py-4 sm:px-8">
            <div>
              <p className="font-mono text-[11px] tracking-[0.16em] text-indigo-400 uppercase">
                Personal Project · Developer Productivity Platform
              </p>
              <h2 id="amli-title" className="mt-1 text-2xl font-semibold">
                AMLI Tools
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={amliLinks.live}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClass({ size: 'sm' })}
                >
                  Live app
                  <ArrowUpRight className="size-3.5" />
                </a>
                <a
                  href={amliLinks.extension}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClass({ variant: 'outline', size: 'sm' })}
                >
                  RepoScope v2.1.0
                  <ArrowUpRight className="size-3.5" />
                </a>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close AMLI Tools details">
              <X className="size-5" />
            </Button>
          </div>

          <div className="space-y-12 px-5 py-8 sm:px-8">
            <section>
              <h3 className="text-lg font-semibold">Overview</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-fg-muted)]">
                AMLI Tools is a full-stack internal-tools-style productivity platform created to
                consolidate repetitive engineering workflows around AES encryption/decryption, API
                documentation, API artifacts, credential management, BSA tracking, GitLab analytics,
                reporting, and developer productivity. It combines a web application (
                <a
                  href={amliLinks.live}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 underline-offset-4 hover:underline"
                >
                  amliaes.netlify.app
                </a>
                ) with a Microsoft Edge extension,{' '}
                <a
                  href={amliLinks.extension}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 underline-offset-4 hover:underline"
                >
                  RepoScope v2.1.0
                </a>
                .
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-fg-muted)]">
                It was created as a personal project while working on the Axis Max Life Insurance
                project. It is not an official Cognizant product and is not presented as officially
                deployed by Cognizant.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Problem</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-fg-muted)]">
                Engineering teams working with APIs and sensitive data often have information
                distributed across Jira, Confluence, Git repositories, spreadsheets, local files,
                chat, and environment-specific configuration. The project attempts to centralize these
                workflows into one platform.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Features</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {features.map((feature) => (
                  <article
                    key={feature.title}
                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5"
                  >
                    <h4 className="font-medium">{feature.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-fg-muted)]">
                      {feature.body}
                    </p>
                    {'note' in feature && feature.note ? (
                      <p className="mt-3 border-l-2 border-indigo-400 pl-3 text-sm text-[var(--color-fg)]">
                        {feature.note}
                      </p>
                    ) : null}
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {feature.items.map((item) => (
                        <li key={item}>
                          <Badge>{item}</Badge>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold">RepoScope</h3>
              <p className="mt-1 font-mono text-xs text-indigo-400">
                Microsoft Edge Extension for GitLab Analytics
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-fg-muted)]">
                RepoScope provides GitLab project overview, contributors, commit activity, branch
                activity, CI pipeline status, LOC reports, 3D graph visualization, API library
                scanning, and GitLab project metadata.
              </p>
              <a
                href={amliLinks.extension}
                target="_blank"
                rel="noreferrer"
                className={buttonClass({ variant: 'outline', size: 'sm' }) + ' mt-4'}
              >
                Install on Microsoft Edge Add-ons
                <ArrowUpRight className="size-3.5" />
              </a>
              <p className="mt-3 text-sm text-[var(--color-fg-muted)]">Supported host patterns:</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {['gitlab.com', 'gitlab.nvidia.com', 'gitlab.internal'].map((host) => (
                  <li key={host}>
                    <Badge>{host}</Badge>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-[var(--color-fg-muted)]">
                This portfolio does not claim access to any private GitLab environment.
              </p>
            </section>

            <section>
              <h3 className="mb-4 text-lg font-semibold">Architecture</h3>
              <ArchitectureDiagram />
            </section>

            <section>
              <h3 className="text-lg font-semibold">Technology stack</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {amliStack.map((item) => (
                  <li key={item}>
                    <Badge>{item}</Badge>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Security by Design</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {security.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-xl border border-[var(--color-border)] p-4"
                  >
                    <h4 className="text-sm font-medium">{item.title}</h4>
                    <p className="mt-1 text-sm text-[var(--color-fg-muted)]">{item.body}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
