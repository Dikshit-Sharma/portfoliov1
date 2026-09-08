import { SectionHeading } from '@/components/SectionHeading'
import { obsidianCategories, obsidianTotalNotes } from '@/data/obsidian.generated'
import { Reveal } from '@/hooks/useReveal'
import { Search, ZoomIn, ZoomOut, Target } from 'lucide-react'
import { buttonClass } from '@/components/ui/button'
import { navigate } from '@/lib/router'
import { useState, useMemo, useEffect, useRef } from 'react'

interface KnowledgeNode {
  id: string
  label: string
  category: string
  count: number
  color: string
  connections: string[]
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface KnowledgeLink {
  source: string
  target: string
  value: number
}

export function KnowledgePage() {
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Build nodes from Obsidian categories
  const nodes = useMemo((): KnowledgeNode[] => {
    return obsidianCategories.map((cat) => ({
      id: cat.id,
      label: cat.label,
      category: cat.id,
      count: cat.noteCount,
      color: cat.color,
      connections: [],
    }))
  }, [])

  // Build links (mock connections based on common categories)
  const links = useMemo((): KnowledgeLink[] => {
    const mockLinks: KnowledgeLink[] = []
    const connections: [string, string][] = [
      ['cognizant', 'project-ideas'],
      ['meldora', 'project-ideas'],
    ]
    connections.forEach(([source, target]) => {
      mockLinks.push({ source, target, value: 1 })
    })
    return mockLinks
  }, [])

  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      const matchesSearch = node.label.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = !filterCategory || node.category === filterCategory
      return matchesSearch && matchesCategory
    })
  }, [nodes, searchQuery, filterCategory])

  const filteredLinks = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map(n => n.id))
    return links.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target))
  }, [links, filteredNodes])

  // Simple force-directed layout (basic)
  useEffect(() => {
    if (!containerRef.current) return
    
    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight
    
    // Simple circular layout for initial positions
    filteredNodes.forEach((node, i) => {
      const angle = (i / filteredNodes.length) * Math.PI * 2
      const radius = Math.min(width, height) * 0.35
      node.x = width / 2 + radius * Math.cos(angle)
      node.y = height / 2 + radius * Math.sin(angle)
    })
  }, [filteredNodes, filteredLinks])

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault()
    setZoom(prev => Math.max(0.3, Math.min(3, prev - e.deltaY * 0.001)))
  }

  function handlePan(e: React.MouseEvent) {
    if (e.button !== 0) return
    const startX = e.clientX - pan.x
    const startY = e.clientY - pan.y
    
    function onMove(e: MouseEvent) {
      setPan({ x: e.clientX - startX, y: e.clientY - startY })
    }
    
    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function handleNodeClick(node: KnowledgeNode) {
    setSelectedNode(node === selectedNode ? null : node)
  }

  return (
    <section id="knowledge" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <SectionHeading
          kicker="04 / Knowledge"
          title="Knowledge Graph"
          description={`Interactive map of ${obsidianTotalNotes} notes across ${obsidianCategories.length} categories from my Obsidian vault.`}
        />
      </Reveal>

      <Reveal delayClass="reveal-delay-1">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-fg-muted)]" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-muted)] pl-10 pr-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-[var(--color-fg-muted)]">Filter:</label>
            <select
              value={filterCategory || ''}
              onChange={(e) => setFilterCategory(e.target.value || null)}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-3 py-2 text-sm outline-none focus:border-indigo-400"
            >
              <option value="">All Categories</option>
              {obsidianCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => setZoom(z => Math.max(0.3, z - 0.2))} className={buttonClass({ variant: 'ghost', size: 'icon' })} aria-label="Zoom out"><ZoomOut className="size-4" /></button>
            <span className="font-mono text-xs text-[var(--color-fg-muted)]">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className={buttonClass({ variant: 'ghost', size: 'icon' })} aria-label="Zoom in"><ZoomIn className="size-4" /></button>
            <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }} className={buttonClass({ variant: 'ghost', size: 'icon' })} aria-label="Reset view"><Target className="size-4" /></button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]"
          style={{ height: '600px' }}
          onWheel={handleWheel}
          onMouseDown={handlePan}
        >
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'center center' }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,7 L9,3.5 Z" fill="var(--color-border)" />
              </marker>
            </defs>
            
            {/* Links */}
            <g stroke="var(--color-border)" strokeWidth="1" opacity="0.4">
              {filteredLinks.map((link, i) => {
                const sourceNode = filteredNodes.find(n => n.id === link.source)
                const targetNode = filteredNodes.find(n => n.id === link.target)
                if (!sourceNode || !targetNode) return null
                return (
                  <line
                    key={i}
                    x1={sourceNode.x!}
                    y1={sourceNode.y!}
                    x2={targetNode.x!}
                    y2={targetNode.y!}
                    strokeDasharray="4,4"
                    markerEnd="url(#arrowhead)"
                  />
                )
              })}
            </g>

            {/* Nodes */}
            <g>
              {filteredNodes.map((node) => (
                <g
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={node.x!}
                    cy={node.y!}
                    r={Math.max(30, Math.min(80, node.count * 0.5))}
                    fill={`color-mix(in srgb, ${node.color} 18%, transparent)`}
                    stroke={node.color}
                    strokeWidth={selectedNode?.id === node.id ? 3 : 1.5}
                    strokeDasharray={selectedNode?.id === node.id ? '0' : '4,4'}
                    filter="drop-shadow(0 0 8px color-mix(in srgb, var(--color-bg) 50%, transparent))"
                  />
                  <text
                    x={node.x!}
                    y={node.y! - 5}
                    textAnchor="middle"
                    className="font-medium text-[var(--color-fg)]"
                    style={{ fontSize: '14px', pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {node.label}
                  </text>
                  <text
                    x={node.x!}
                    y={node.y! + 18}
                    textAnchor="middle"
                    className="font-mono text-[var(--color-fg-muted)]"
                    style={{ fontSize: '11px', pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {node.count} notes
                  </text>
                </g>
              ))}
            </g>
          </svg>

          {filteredNodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-[var(--color-fg-muted)]">
              No categories match your search.
            </div>
          )}
        </div>

        <p className="mt-4 font-mono text-[11px] text-[var(--color-fg-muted)]">
          {filteredNodes.length} of {obsidianCategories.length} categories shown · {obsidianTotalNotes} total notes
        </p>
      </Reveal>

      {selectedNode && (
        <Reveal delayClass="reveal-delay-2">
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedNode(null)}>
            <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h4 className="flex items-center gap-2 text-lg font-semibold">
                    <span className="flex size-10 items-center justify-center rounded-xl text-xl" style={{ background: `color-mix(in srgb, ${selectedNode.color} 18%, transparent)`, border: `1px solid ${selectedNode.color}44` }}>
                      {obsidianCategories.find(c => c.id === selectedNode.category)?.emoji || '📁'}
                    </span>
                    {selectedNode.label}
                  </h4>
                  <p className="mt-1 text-sm text-[var(--color-fg-muted)]">{selectedNode.count} notes</p>
                </div>
                <button onClick={() => setSelectedNode(null)} className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]" aria-label="Close">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <p className="text-[var(--color-fg-muted)]">Category: {selectedNode.category}</p>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => navigate('knowledge', selectedNode.id)} className={buttonClass({ variant: 'outline', size: 'sm' })}>
                    Browse Notes
                  </button>
                  <button onClick={() => navigate('dashboard', 'obsidian')} className={buttonClass({ variant: 'ghost', size: 'sm' })}>
                    Open in Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      )}
    </section>
  )
}