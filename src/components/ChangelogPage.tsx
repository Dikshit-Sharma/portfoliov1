import { SectionHeading } from '@/components/SectionHeading'
import { getChangelog, getLatestVersion } from '@/data/changelog'
import { Reveal } from '@/hooks/useReveal'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

export function ChangelogPage() {
  const data = getChangelog()
  const [expanded, setExpanded] = useState<string[]>([data[0]?.version || ''])

  return (
    <section id="changelog" className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <Reveal>
        <SectionHeading
          kicker="06 / Changelog"
          title="Changelog"
          description={`All notable changes to this portfolio. Current version: ${getLatestVersion()}`}
        />
      </Reveal>

      <Reveal delayClass="reveal-delay-1">
        <div className="space-y-4">
          {data.map((entry) => {
            const isExpanded = expanded.includes(entry.version)
            return (
              <article key={entry.version} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] overflow-hidden">
                <button
                  onClick={() => setExpanded(prev => isExpanded ? prev.filter(v => v !== entry.version) : [...prev, entry.version])}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] tracking-[0.16em] text-indigo-400 uppercase">{entry.version}</span>
                    <span className="text-sm text-[var(--color-fg-muted)]">{entry.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.changes.added.length > 0 && <Badge className="text-emerald-400 border-emerald-400/30">+{entry.changes.added.length}</Badge>}
                    {entry.changes.changed.length > 0 && <Badge className="text-amber-400 border-amber-400/30">~{entry.changes.changed.length}</Badge>}
                    {entry.changes.fixed.length > 0 && <Badge className="text-violet-400 border-violet-400/30">#{entry.changes.fixed.length}</Badge>}
                    {entry.changes.removed.length > 0 && <Badge className="text-red-400 border-red-400/30">-{entry.changes.removed.length}</Badge>}
                    {isExpanded ? <ChevronUp className="size-4 text-[var(--color-fg-muted)]" /> : <ChevronDown className="size-4 text-[var(--color-fg-muted)]" />}
                  </div>
                </button>
                {isExpanded && (
                  <div className="border-t border-[var(--color-border)] p-5 space-y-4">
                    {entry.changes.added.length > 0 && (
                      <div>
                        <p className="font-mono text-[10px] text-emerald-400 uppercase mb-2">Added</p>
                        <ul className="space-y-1 text-sm text-[var(--color-fg)]">
                          {entry.changes.added.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">+ {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {entry.changes.changed.length > 0 && (
                      <div>
                        <p className="font-mono text-[10px] text-amber-400 uppercase mb-2">Changed</p>
                        <ul className="space-y-1 text-sm text-[var(--color-fg)]">
                          {entry.changes.changed.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">~ {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {entry.changes.fixed.length > 0 && (
                      <div>
                        <p className="font-mono text-[10px] text-violet-400 uppercase mb-2">Fixed</p>
                        <ul className="space-y-1 text-sm text-[var(--color-fg)]">
                          {entry.changes.fixed.map((item, i) => (
                            <li key={i} className="flex items-start gap-2"># {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {entry.changes.removed.length > 0 && (
                      <div>
                        <p className="font-mono text-[10px] text-red-400 uppercase mb-2">Removed</p>
                        <ul className="space-y-1 text-sm text-[var(--color-fg)]">
                          {entry.changes.removed.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">- {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </Reveal>
    </section>
  )
}