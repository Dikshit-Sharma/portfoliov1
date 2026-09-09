/**
 * Knowledge graph — derived from real published Obsidian data.
 *
 * Nodes are the public knowledge categories. Edges are REAL: a category is
 * connected to a technology when that technology name appears in a published
 * note heading or first content line of that category. No edges are invented;
 * a category with no mentions simply renders as an isolated node.
 *
 * The category JSON files are public assets (public/obsidian-data/*.json) and
 * are fetched lazily and cached — the graph never loads on initial bundle.
 */
import { obsidianCategories } from '@/data/obsidian.generated'
import { allTechnologies } from '@/lib/relations'

export interface GraphNode {
  id: string
  kind: 'category' | 'technology'
  label: string
  count?: number
  color?: string
}

export interface GraphEdge {
  source: string
  target: string
  value: number
}

interface CategoryData {
  notes: { title: string; heading?: string; content?: string }[]
}

const TECH_WEIGHT = 4
const MAX_TECH_NODES = 24

function fetchCategoryJson(id: string): Promise<CategoryData | null> {
  const cat = obsidianCategories.find((c) => c.id === id)
  if (!cat) return Promise.resolve(null)
  const url = `${import.meta.env.BASE_URL}${cat.dataUrl}`
  return fetch(url)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)
}

function techToId(tech: string): string {
  return `tech-${tech.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

/**
 * Build the graph from real data. `categories` stay nodes; technology nodes are
 * added only for technologies actually mentioned in a category's notes.
 */
export async function buildKnowledgeGraph(): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
  const nodes: GraphNode[] = obsidianCategories.map((c) => ({
    id: c.id,
    kind: 'category' as const,
    label: c.label,
    count: c.noteCount,
    color: c.color,
  }))

  const edges: GraphEdge[] = []
  const techMentions = new Map<string, Set<string>>() // techId -> categories

  // Preferred headings lines to scan: note heading + first non-title content line.
  await Promise.all(obsidianCategories.map(async (cat) => {
    const data = await fetchCategoryJson(cat.id)
    if (!data) return
    const techs = allTechnologies()

    // Index technology names by id, detect by token match.
    for (const note of data.notes) {
      const headingLine = (note.heading || note.title || '').toLowerCase()
      const contentLine = (note.content || '').split(/\r?\n/).find((l) => {
        const t = l.trim()
        return t && !t.startsWith('#') && !t.startsWith('>') && !t.startsWith('|') && !t.startsWith('---')
      }) || ''
      const haystack = `${headingLine} ${contentLine.toLowerCase()}`

      for (const tech of techs) {
        const name = tech.toLowerCase()
        if (haystack.includes(name)) {
          const techId = techToId(tech)
          if (!techMentions.has(techId)) techMentions.set(techId, new Set())
          techMentions.get(techId)!.add(cat.id)
        }
      }
    }
  }))

  // Add technology nodes ordered by how many categories mention them.
  const ranked = [...techMentions.entries()]
    .sort((a, b) => b[1].size - a[1].size)
    .slice(0, MAX_TECH_NODES)

  const techNodeById = new Map<string, GraphNode>()
  for (const [techId, cats] of ranked) {
    const label = techId.replace(/^tech-/, '').replace(/-/g, ' ')
    const node: GraphNode = { id: techId, kind: 'technology', label }
    techNodeById.set(techId, node)
    nodes.push(node)
    for (const catId of cats) {
      edges.push({ source: catId, target: techId, value: TECH_WEIGHT })
    }
  }

  return { nodes, edges }
}