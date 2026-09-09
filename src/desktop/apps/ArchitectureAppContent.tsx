import { useState } from 'react'
import { ArchitectureDiagram, ArchitectureList } from '@/components/workspace/ArchitectureDiagram'
import { systemMaps, type ArchitectureNode } from '@/data/architecture'
import { cn } from '@/lib/utils'
import { SectionHeading } from '@/components/SectionHeading'

/**
 * Architecture application content — lazy-loaded.
 */
export default function ArchitectureAppContent() {
  const [mapId, setMapId] = useState(systemMaps[0]?.id ?? 'portfolio-os')
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode | null>(null)
  const map = systemMaps.find((m) => m.id === mapId) ?? systemMaps[0]

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <SectionHeading
        kicker="system inspector"
        title="Architecture"
        description="Data-driven diagrams of the systems in this environment. Nodes are inspectable."
      />

      <div className="mb-4 flex flex-wrap items-center gap-1">
        {systemMaps.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => { setMapId(m.id); setSelectedNode(null) }}
            className={cn(
              'rounded-md px-2.5 py-1.5 font-mono text-[11px] transition-colors',
              m.id === mapId
                ? 'bg-[var(--accent-muted)]/15 text-[var(--text)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]',
            )}
          >
            {m.name}
          </button>
        ))}
      </div>

      {map && (
        <div className="space-y-3">
          <ArchitectureDiagram
            nodes={map.nodes}
            edges={map.edges}
            selected={selectedNode}
            onSelect={setSelectedNode}
          />
          <ArchitectureList nodes={map.nodes} edges={map.edges} />
        </div>
      )}
    </div>
  )
}