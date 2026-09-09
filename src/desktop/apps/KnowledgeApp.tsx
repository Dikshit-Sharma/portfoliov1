import { Suspense, lazy } from 'react'

const KnowledgePage = lazy(() => import('@/components/KnowledgePage').then((m) => ({ default: m.KnowledgePage })))

/**
 * Knowledge application — Obsidian notes, graph, categories, search.
 */
export default function KnowledgeApp() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center font-mono text-xs text-[var(--text-muted)]">
          loading knowledge graph…
        </div>
      }
    >
      <KnowledgePage />
    </Suspense>
  )
}