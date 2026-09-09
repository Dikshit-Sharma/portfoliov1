import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search, ZoomIn, ZoomOut, Target } from 'lucide-react'
import { buttonClass } from '@/components/ui/button'
import { navigate } from '@/lib/router'
import { obsidianCategories, obsidianTotalNotes } from '@/data/obsidian.generated'
import { buildKnowledgeGraph, type GraphEdge, type GraphNode } from '@/lib/knowledge-graph'

interface Positioned extends GraphNode {
  x: number
  y: number
}

const CATEGORY_TOOLS = new Set(['cognizant', 'meldora', 'project-ideas'])

export function KnowledgePage() {
  const [selected, setSelected] = useState<Positioned | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [graph, setGraph] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] } | null>(null)
  const [graphLoading, setGraphLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null)

  // Lazy-build the graph from published note content (real edges only).
  useEffect(() => {
    let cancelled = false
    setGraphLoading(true)
    buildKnowledgeGraph().then((g) => {
      if (cancelled) return
      setGraph(g)
      setGraphLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const positioned = useMemo<Positioned[]>(() => {
    const nodes = graph?.nodes ?? []
    // Fixed coordinate space so positions never depend on layout measurement.
    const width = 760
    const height = 520
    const cx = width / 2
    const cy = height / 2
    const categories = nodes.filter((n) => n.kind === 'category')
    const techs = nodes.filter((n) => n.kind === 'technology')
    const radius = Math.min(width, height) * 0.3
    const out: Positioned[] = []

    categories.forEach((node, i) => {
      const angle = (i / Math.max(1, categories.length)) * Math.PI * 2 - Math.PI / 2
      out.push({ ...node, x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) })
    })
    // Technology nodes orbit inside, offset from category ring.
    techs.forEach((node, i) => {
      const angle = (i / Math.max(1, techs.length)) * Math.PI * 2
      out.push({ ...node, x: cx + radius * 0.55 * Math.cos(angle), y: cy + radius * 0.55 * Math.sin(angle) })
    })
    return out
  }, [graph])

  const filtered = useMemo(() => {
    if (!graph) return { nodes: [] as Positioned[], edges: [] as GraphEdge[] }

    const q = searchQuery.trim().toLowerCase()
    let nodeIds = new Set(graph.nodes.map((n) => n.id))
    if (q) {
      nodeIds = new Set(
        [...nodeIds].filter((id) => {
          const node = graph.nodes.find((n) => n.id === id)
          return node ? node.label.toLowerCase().includes(q) : false
        }),
      )
    }
    if (filterCategory) {
      // Keep the selected category + its directly connected tech nodes.
      const keep = new Set<string>([filterCategory])
      for (const e of graph.edges) {
        if (e.source === filterCategory) keep.add(e.target)
        if (e.target === filterCategory) keep.add(e.source)
      }
      nodeIds = new Set([...nodeIds].filter((id) => keep.has(id)))
    }
    const nodeSet = nodeIds
    return {
      nodes: positioned.filter((n) => nodeSet.has(n.id)),
      edges: graph.edges.filter((e) => nodeSet.has(e.source) && nodeSet.has(e.target)),
    }
  }, [graph, positioned, searchQuery, filterCategory])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setZoom((prev) => Math.max(0.3, Math.min(3, prev - e.deltaY * 0.001)))
  }, [])

  function handlePanStart(e: React.MouseEvent) {
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y }
    const onMove = (ev: MouseEvent) => {
      const drag = dragRef.current
      if (!drag) return
      setPan({ x: drag.panX + (ev.clientX - drag.startX), y: drag.panY + (ev.clientY - drag.startY) })
    }
    const onUp = () => {
      dragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const selectedNode = selected
  const selectedCategory = selected?.kind === 'category'
    ? obsidianCategories.find((c) => c.id === selected.id)
    : null

  return (
    <section id="knowledge" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <p className="mb-3 font-mono text-xs tracking-[0.18em] text-indigo-400 uppercase">03 / Knowledge</p>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-fg)] sm:text-3xl">Knowledge</h1>
        <p className="mt-3 max-w-2xl text-[var(--color-fg-muted)] leading-relaxed">
          Published notes from the Obsidian vault — {obsidianTotalNotes} notes across {obsidianCategories.length} categories.
          Edges are real: a category links to a technology only when that name appears in a published note.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Category side panel */}
        <aside className="lg:border-r lg:border-[var(--color-border)] lg:pr-4">
          <p className="mb-3 font-mono text-[10px] tracking-[0.16em] text-[var(--color-fg-muted)] uppercase">
            Notes
          </p>
          <ul className="space-y-1">
            {obsidianCategories.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => {
                    setFilterCategory(cat.id)
                    setSearchQuery('')
                    // Center on the category node in the graph.
                    const node = positioned.find((n) => n.id === cat.id)
                    if (node) setSelected(node)
                  }}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors ${
                    filterCategory === cat.id
                      ? 'bg-[var(--color-accent)]/15 text-[var(--color-fg)]'
                      : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-muted)]'
                  }`}
                >
                  <span aria-hidden="true">{cat.emoji}</span>
                  <span className="min-w-0 flex-1 truncate">{cat.label}</span>
                  <span className="font-mono text-[10px] text-[var(--color-fg-muted)]">{cat.noteCount}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <p className="mb-2 font-mono text-[10px] tracking-[0.16em] text-[var(--color-fg-muted)] uppercase">
              Focus
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_TOOLS.has(filterCategory || '')
                ? graph?.nodes
                    .filter((n) => n.kind === 'technology' && filtered.edges.some((e) => e.target === n.id))
                    .slice(0, 8)
                    .map((n) => (
                      <span key={n.id} className="rounded-full border border-[var(--color-border)] px-2 py-0.5 font-mono text-[10px] text-[var(--color-fg-muted)]">
                        {n.label}
                      </span>
                    ))
                : (
                    <p className="text-xs text-[var(--color-fg-muted)]">
                      {filterCategory ? 'No technology mentions in this category.' : 'Select a category to focus its graph connections.'}
                    </p>
                  )}
            </div>
          </div>
        </aside>

        {/* Graph */}
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-fg-muted)]" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes and topics…"
                aria-label="Search knowledge graph"
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-muted)] pl-10 pr-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={() => setZoom((z) => Math.max(0.3, z - 0.2))} className={buttonClass({ variant: 'ghost', size: 'icon' })} aria-label="Zoom out"><ZoomOut className="size-4" /></button>
              <span className="font-mono text-xs text-[var(--color-fg-muted)]">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom((z) => Math.min(3, z + 0.2))} className={buttonClass({ variant: 'ghost', size: 'icon' })} aria-label="Zoom in"><ZoomIn className="size-4" /></button>
              <button
                onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); setFilterCategory(null) }}
                className={buttonClass({ variant: 'ghost', size: 'icon' })}
                aria-label="Reset view"
              >
                <Target className="size-4" />
              </button>
            </div>
          </div>

          <div
            ref={containerRef}
            className="relative h-[520px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] overflow-hidden"
            onWheel={handleWheel}
            onMouseDown={handlePanStart}
          >
            {graphLoading ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-[var(--color-fg-muted)]">
                building graph from published notes…
              </div>
            ) : (
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 760 520"
                className="cursor-grab active:cursor-grabbing touch-none"
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'center center' }}
                aria-label="Knowledge graph"
              >
                <defs>
                  <marker id="kg-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 Z" fill="var(--color-border)" />
                  </marker>
                  <filter id="kg-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <g stroke="var(--color-border)" strokeWidth="1" opacity="0.5">
                  {filtered.edges.map((edge, i) => {
                    const source = positioned.find((n) => n.id === edge.source)
                    const target = positioned.find((n) => n.id === edge.target)
                    if (!source || !target) return null
                    return (
                      <line
                        key={i}
                        x1={source.x}
                        y1={source.y}
                        x2={target.x}
                        y2={target.y}
                        strokeDasharray="4,4"
                        markerEnd="url(#kg-arrow)"
                      />
                    )
                  })}
                </g>

                <g>
                  {filtered.nodes.map((node) => {
                    const isSel = selectedNode?.id === node.id
                    const radius = node.kind === 'category' ? (node.count ? Math.max(34, Math.min(70, node.count * 0.4)) : 34) : 22
                    const color = node.color || 'var(--color-accent)'
                    return (
                      <g
                        key={node.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelected(node)
                        }}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={radius}
                          fill={node.kind === 'category' ? `color-mix(in srgb, ${color} 16%, transparent)` : 'var(--color-bg-muted)'}
                          stroke={isSel ? 'var(--color-accent)' : color}
                          strokeWidth={isSel ? 2.5 : 1.5}
                          strokeDasharray={node.kind === 'technology' ? '3 3' : undefined}
                          filter={isSel ? 'url(#kg-glow)' : undefined}
                        />
                        <text x={node.x} y={node.y - 4} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="var(--color-fg)" style={{ pointerEvents: 'none', userSelect: 'none' }}>
                          {node.label.length > 18 ? `${node.label.slice(0, 17)}…` : node.label}
                        </text>
                        {node.kind === 'category' && node.count != null && (
                          <text x={node.x} y={node.y + 16} textAnchor="middle" fontSize="10" fill="var(--color-fg-muted)" style={{ pointerEvents: 'none', userSelect: 'none' }}>
                            {node.count} notes
                          </text>
                        )}
                      </g>
                    )
                  })}
                </g>
              </svg>
            )}

            {filtered.nodes.length === 0 && !graphLoading && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-[var(--color-fg-muted)]">
                No matches.
              </div>
            )}
          </div>

          <p className="mt-2 font-mono text-[11px] text-[var(--color-fg-muted)]">
            {filtered.nodes.length} of {graph?.nodes.length ?? 0} nodes · {filtered.edges.length} real edges
          </p>
        </div>
      </div>

      {/* Selected node detail */}
      {selectedNode && (
        <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.16em] text-[var(--color-accent)] uppercase">
                {selectedNode.kind}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-[var(--color-fg)]">{selectedNode.label}</h2>
              {selectedNode.kind === 'category' && selectedCategory && (
                <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
                  {selectedCategory.noteCount} published notes · {selectedCategory.description}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedNode.kind === 'category' && (
                <button onClick={() => navigate('work')} className={buttonClass({ variant: 'outline', size: 'sm' })}>
                  Browse Notes
                </button>
              )}
              <button onClick={() => setSelected(null)} className={buttonClass({ variant: 'ghost', size: 'sm' })}>
                Close
              </button>
            </div>
          </div>
          {selectedNode.kind === 'category' && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {filtered.edges.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                .map((e) => {
                  const otherId = e.source === selectedNode.id ? e.target : e.source
                  const other = graph?.nodes.find((n) => n.id === otherId)
                  return other ? (
                    <span key={other.id} className="rounded-full border border-[var(--color-border)] px-2 py-0.5 font-mono text-[10px] text-[var(--color-fg-muted)]">
                      {other.label}
                    </span>
                  ) : null
                })}
            </div>
          )}
        </div>
      )}
    </section>
  )
}