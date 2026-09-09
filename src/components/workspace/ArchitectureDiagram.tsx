import { useMemo } from 'react'
import { NODE_TONE, type ArchitectureEdge, type ArchitectureNode, type ArchitectureNodeType } from '@/data/architecture'

const TYPE_LAYERS: ArchitectureNodeType[] = [
  'client',
  'gateway',
  'frontend',
  'backend',
  'service',
  'integration',
  'data',
  'storage',
  'platform',
]

function layerOf(type: ArchitectureNodeType): number {
  return TYPE_LAYERS.indexOf(type)
}

interface Positioned extends ArchitectureNode {
  x: number
  y: number
}

/**
 * Layered graph: nodes are grouped by type into horizontal layers, positioned
 * top-down (clients at top, data/integration at the bottom), edges drawn with
 * SVG. Selecting a node shows its inspector info inline.
 */
export function ArchitectureDiagram({
  nodes,
  edges,
  selected,
  onSelect,
}: {
  nodes: ArchitectureNode[]
  edges: ArchitectureEdge[]
  selected: ArchitectureNode | null
  onSelect: (node: ArchitectureNode | null) => void
}) {
  const positioned = useMemo<Positioned[]>(() => {
    const layers = new Map<ArchitectureNodeType, ArchitectureNode[]>()
    for (const node of nodes) {
      const list = layers.get(node.type) ?? []
      list.push(node)
      layers.set(node.type, list)
    }
    const out: Positioned[] = []
    const maxPerLayer = Math.max(1, ...TYPE_LAYERS.map((t) => layers.get(t)?.length ?? 0))
    const unit = 168
    const gapY = 96
    for (const type of TYPE_LAYERS) {
      const group = layers.get(type) ?? []
      const layerIdx = layerOf(type)
      group.forEach((node, i) => {
        const offset = group.length > 1 ? (i - (group.length - 1) / 2) : 0
        out.push({
          ...node,
          x: 120 + offset * unit + (maxPerLayer - group.length) * 40,
          y: 90 + layerIdx * gapY,
        })
      })
    }
    return out
  }, [nodes])

  const nodeById = useMemo(() => new Map(positioned.map((n) => [n.id, n])), [positioned])

  return (
    <div className="overflow-x-auto">
      <svg width="820" height="620" viewBox="0 0 820 620" role="img" aria-label="Architecture diagram" className="mx-auto min-w-[540px]">
        <defs>
          <marker id="arch-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 Z" fill="var(--color-border)" />
          </marker>
        </defs>

        {/* Edges */}
        <g>
          {edges.map((edge, i) => {
            const a = nodeById.get(edge.source)
            const b = nodeById.get(edge.target)
            if (!a || !b) return null
            const x1 = a.x
            const y1 = a.y + 28
            const x2 = b.x
            const y2 = b.y - 28
            const midY = (y1 + y2) / 2
            return (
              <path
                key={`${edge.source}-${edge.target}-${i}`}
                d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="1"
                strokeDasharray="3 3"
                markerEnd="url(#arch-arrow)"
              />
            )
          })}
        </g>

        {/* Nodes */}
        <g>
          {positioned.map((node) => {
            const tone = NODE_TONE[node.type]
            const isSelected = selected?.id === node.id
            const relevant = selected
              ? edges.some((e) => (e.source === selected.id && e.target === node.id) || (e.target === selected.id && e.source === node.id))
              : false
            return (
              <g key={node.id} className="cursor-pointer" onClick={() => onSelect(isSelected ? null : node)}>
                <rect
                  x={node.x - 84}
                  y={node.y - 28}
                  width={168}
                  height={56}
                  rx={6}
                  fill="var(--color-bg-elevated)"
                  stroke={isSelected ? 'var(--color-accent)' : relevant ? 'var(--color-accent)' : 'var(--color-border)'}
                  strokeWidth={isSelected || relevant ? 2 : 1}
                />
                <text
                  x={node.x}
                  y={node.y - 2}
                  textAnchor="middle"
                  fill="var(--color-fg)"
                  fontSize="12.5"
                  fontWeight="600"
                >
                  {node.label.length > 22 ? `${node.label.slice(0, 21)}…` : node.label}
                </text>
                <text
                  x={node.x}
                  y={node.y + 17}
                  textAnchor="middle"
                  fill="var(--color-fg-muted)"
                  fontSize="9.5"
                  className={tone}
                >
                  {node.technology.length > 26 ? `${node.technology.slice(0, 25)}…` : node.technology}
                </text>
              </g>
            )
          })}
        </g>
      </svg>

      {/* Node inspector */}
      {selected && (
        <div className="my-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.16em] text-[var(--color-accent)] uppercase">
                {selected.type}
              </p>
              <h4 className="mt-1 font-semibold text-[var(--color-fg)]">{selected.label}</h4>
            </div>
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="font-mono text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
            >
              close
            </button>
          </div>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-mono text-[10px] tracking-widest text-[var(--color-fg-muted)] uppercase">Technology</dt>
              <dd className="mt-1 text-[var(--color-fg)]">{selected.technology}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] tracking-widest text-[var(--color-fg-muted)] uppercase">Responsibility</dt>
              <dd className="mt-1 text-[var(--color-fg-muted)]">{selected.responsibility}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  )
}

/** Text accessibility alternative — equivalent to the visual diagram. */
export function ArchitectureList({
  nodes,
  edges,
}: {
  nodes: ArchitectureNode[]
  edges: ArchitectureEdge[]
}) {
  return (
    <details className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-muted)]">
      <summary className="cursor-pointer px-4 py-3 font-mono text-xs text-[var(--color-fg-muted)]">
        Architecture (text version)
      </summary>
      <div className="space-y-3 px-4 py-3 text-sm">
        {ARCH_LAYER_LABELS.map(([type, label]) => (
          <div key={type}>
            <p className="font-mono text-[10px] tracking-widest text-[var(--color-accent)] uppercase">{label}</p>
            <ul className="mt-1 space-y-1 text-[var(--color-fg-muted)]">
              {nodes
                .filter((n) => n.type === type)
                .map((n) => (
                  <li key={n.id}>
                    <span className="text-[var(--color-fg)]">{n.label}</span> — {n.technology} · {n.responsibility}
                  </li>
                ))}
            </ul>
          </div>
        ))}
        <div>
          <p className="font-mono text-[10px] tracking-widest text-[var(--color-accent)] uppercase">Connections</p>
          <ul className="mt-1 space-y-1 text-[var(--color-fg-muted)]">
            {edges.map((e, i) => (
              <li key={i}>
                {e.source} → {e.target}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  )
}

const ARCH_LAYER_LABELS: [ArchitectureNodeType, string][] = [
  ['client', 'Clients'],
  ['gateway', 'Gateway'],
  ['frontend', 'Frontend'],
  ['backend', 'Backend'],
  ['service', 'Services'],
  ['integration', 'Integrations'],
  ['data', 'Data'],
  ['storage', 'Storage'],
  ['platform', 'Platform'],
]