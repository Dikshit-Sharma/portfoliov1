import { useState } from 'react'
import { SectionHeading } from '@/components/SectionHeading'
import { ArchitectureDiagram, ArchitectureList } from '@/components/workspace/ArchitectureDiagram'
import { Reveal } from '@/hooks/useReveal'
import { systemMaps, type ArchitectureNode } from '@/data/architecture'
import { OS_IDENTITY, STATUS_SYMBOL } from '@/lib/workspaces'
import { obsidianGeneratedAt, obsidianTotalNotes, obsidianCategories } from '@/data/obsidian.generated'
import { getLatestVersion, getChangelog } from '@/data/changelog'
import { site } from '@/data/site'
import { cn } from '@/lib/utils'

function Neofetch() {
  const lines: [string, string][] = [
    ['ROLE', site.title],
    ['OS', OS_IDENTITY.os],
    ['WM', `${OS_IDENTITY.wm} (web)`],
    ['SHELL', OS_IDENTITY.shell],
    ['EDITOR', OS_IDENTITY.editor],
    ['THEME', 'personal'],
    ['STACK', 'React 19 / TypeScript'],
    ['HOST', 'Netlify'],
    ['VERSION', getLatestVersion()],
  ]
  const empty = '──────────────────────────────'
  return (
    <pre className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5 font-mono text-xs leading-relaxed text-[var(--color-fg-muted)]">
      <span className="text-[var(--color-accent)]">
        {`        /\\\n       /  \\\n      /    \\\n     /  ${OS_IDENTITY.username}  \\\n    /________\\`}
      </span>
      {'\n'}
      <span className="text-[var(--color-fg)]">{`        ${OS_IDENTITY.username}@${OS_IDENTITY.host}`}</span>
      {'\n'}
      <span className="text-[var(--color-fg-muted)]">{`        ${empty}`}</span>
      {'\n'}
      {lines.map(([k, v]) => (
        <span key={k}>
          <span className="text-[var(--color-fg)]"> {k.padEnd(11, ' ')}</span>
          {v}
          {'\n'}
        </span>
      ))}
    </pre>
  )
}

export function SystemPage() {
  const [mapId, setMapId] = useState<string>(systemMaps[0]?.id ?? 'portfolio-os')
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode | null>(null)
  const map = systemMaps.find((m) => m.id === mapId) ?? systemMaps[0]
  const changelog = getChangelog()[0]

  return (
    <section id="system" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Reveal>
        <SectionHeading
          kicker="04 / System"
          title="System Status"
          description="This workspace as a system: identity, architecture, integrations and versions."
        />
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
        {/* System identity */}
        <div className="space-y-6">
          <Reveal delayClass="reveal-delay-1">
            <Neofetch />
          </Reveal>

          <Reveal delayClass="reveal-delay-2">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
              <p className="mb-3 font-mono text-[10px] tracking-[0.16em] text-[var(--color-accent)] uppercase">
                Integrations
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between gap-3">
                  <span className="text-[var(--color-fg-muted)]">GitHub</span>
                  <span className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-emerald-400">●</span> ONLINE
                  </span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-[var(--color-fg-muted)]">Obsidian</span>
                  <span className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-emerald-400">◐</span> CACHED
                    <span className="text-[10px] text-[var(--color-fg-muted)]">
                      {obsidianTotalNotes} notes
                    </span>
                  </span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-[var(--color-fg-muted)]">Dashboard</span>
                  <span className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-[var(--color-accent)]">🔒</span> LOCKED
                  </span>
                </li>
              </ul>

              <dl className="mt-4 space-y-2 border-t border-[var(--color-border)] pt-4 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--color-fg-muted)]">Knowledge snapshot</dt>
                  <dd className="font-mono text-[var(--color-fg)]">
                    {new Date(obsidianGeneratedAt).toLocaleDateString()}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--color-fg-muted)]">Categories</dt>
                  <dd className="font-mono text-[var(--color-fg)]">{obsidianCategories.length}</dd>
                </div>
              </dl>
            </div>
          </Reveal>
        </div>

        {/* Architecture */}
        <div className="space-y-6">
          <Reveal delayClass="reveal-delay-2">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.16em] text-[var(--color-accent)] uppercase">
                    Architecture
                  </p>
                  <h3 className="mt-1 font-semibold text-[var(--color-fg)]">{map?.name}</h3>
                  <p className="mt-1 text-xs text-[var(--color-fg-muted)]">{map?.description}</p>
                </div>
                <div className="flex gap-1">
                  {systemMaps.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setMapId(m.id)
                        setSelectedNode(null)
                      }}
                      className={cn(
                        'rounded-md px-2.5 py-1.5 font-mono text-[11px] transition-colors',
                        m.id === mapId
                          ? 'bg-[var(--color-accent)]/15 text-[var(--color-fg)]'
                          : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]',
                      )}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              {map && (
                <>
                  <ArchitectureDiagram
                    nodes={map.nodes}
                    edges={map.edges}
                    selected={selectedNode}
                    onSelect={setSelectedNode}
                  />
                  <div className="mt-3">
                    <ArchitectureList nodes={map.nodes} edges={map.edges} />
                  </div>
                </>
              )}
            </div>
          </Reveal>

          <Reveal delayClass="reveal-delay-3">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
              <p className="font-mono text-[10px] tracking-[0.16em] text-[var(--color-accent)] uppercase">
                Latest release
              </p>
              {changelog && (
                <div className="mt-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-[var(--color-fg)]">{changelog.version}</h3>
                    <span className="font-mono text-xs text-[var(--color-fg-muted)]">{changelog.date}</span>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm text-[var(--color-fg-muted)]">
                    {changelog.changes.added.slice(0, 4).map((c) => (
                      <li key={c} className="flex items-start gap-2">
                        <span className="text-emerald-400">+</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>

      {/* Status legend */}
      <Reveal delayClass="reveal-delay-4">
        <p className="mt-8 flex flex-wrap items-center gap-4 font-mono text-[11px] text-[var(--color-fg-muted)]">
          <span>Status legend:</span>
          {(['ONLINE', 'CACHED', 'LOADING', 'ERROR', 'LOCKED', 'UNAVAILABLE'] as const).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span>{STATUS_SYMBOL[s]}</span> {s}
            </span>
          ))}
          <span className="hidden text-[10px] text-[var(--color-fg-muted)] sm:inline">
            · status reflects real wiring, never fabricated metrics
          </span>
        </p>
      </Reveal>
    </section>
  )
}