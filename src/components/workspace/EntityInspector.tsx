import { useEffect } from 'react'
import { X } from 'lucide-react'
import { inspectEntity, type EntityKind, type RelatedEntity } from '@/lib/relations'
import { buttonClass } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const KIND_LABEL: Record<EntityKind, string> = {
  project: 'Project',
  technology: 'Technology',
  experience: 'Experience',
  impact: 'Impact',
  knowledge: 'Knowledge',
}

export interface InspectorTarget {
  kind: EntityKind
  id: string
}

export function EntityInspector({ target, onClose }: { target: InspectorTarget | null; onClose: () => void }) {
  // Reset the inspector if the target disappears.
  useEffect(() => {
    if (!target) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [target, onClose])

  if (!target) return null

  const { entity, relations } = inspectEntity(target.kind, target.id)
  if (!entity) return null

  const related = (relations ?? []).slice(0, 12)

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 p-0 font-mono"
      onClick={onClose}
      role="dialog"
      aria-label={`Entity inspector: ${entity.name}`}
    >
      <aside
        className="scrollbar-thin h-full w-full max-w-sm overflow-y-auto border-l border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Window chrome */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3">
          <p className="text-[11px] text-[var(--color-fg-muted)]">inspector / {target.kind}</p>
          <button
            type="button"
            onClick={onClose}
            className={cn(buttonClass({ variant: 'ghost', size: 'icon' }), 'size-7')}
            aria-label="Close inspector"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-4">
          {/* Entity */}
          <div className="border-b border-[var(--color-border)] pb-4">
            <p className="text-[10px] tracking-[0.16em] text-[var(--color-accent)] uppercase">
              {KIND_LABEL[entity.kind]}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[var(--color-fg)]">{entity.name}</h2>
            {entity.description && (
              <p className="mt-2 text-xs leading-relaxed text-[var(--color-fg-muted)]">{entity.description}</p>
            )}
          </div>

          {/* Relations */}
          <div className="mt-4">
            <p className="mb-2 text-[10px] tracking-[0.16em] text-[var(--color-fg-muted)] uppercase">
              Related ({related.length})
            </p>
            {related.length === 0 ? (
              <p className="text-xs text-[var(--color-fg-muted)]">No related entities.</p>
            ) : (
              <ul className="space-y-1">
                {related.map((rel, i) => (
                  <li key={`${rel.kind}-${rel.id}-${i}`}>
                    <a
                      href={rel.path}
                      className="flex items-start gap-2 rounded-md p-2 text-xs text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-fg)]"
                    >
                      <span className="mt-0.5 shrink-0 text-[10px] text-[var(--color-accent)]">
                        {KIND_LABEL[rel.kind].toLowerCase() === 'technology'
                          ? '◆'
                          : rel.kind === 'project'
                            ? '◈'
                            : rel.kind === 'experience'
                              ? '▤'
                              : '◈'}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate">{rel.name}</span>
                        {rel.description && (
                          <span className="block truncate text-[10px] text-[var(--color-fg-muted)]">
                            {rel.description}
                          </span>
                        )}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-4">
            <a href={entity.path} className={buttonClass({ size: 'sm' })}>
              Open
            </a>
          </div>
        </div>
      </aside>
    </div>
  )
}

export type { RelatedEntity }