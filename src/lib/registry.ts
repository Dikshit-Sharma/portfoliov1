import { projects } from '@/data/projects'
import { experience } from '@/data/experience'
import { labProjects } from '@/data/lab'
import { skillGroups, heroStack } from '@/data/site'
import { obsidianCategories } from '@/data/obsidian.generated'
import type { PageRoute } from '@/lib/router'

/**
 * Global entity registry — the single source of truth for searchable
 * workspace entities. Powers the command palette, terminal `search`,
 * and any future global search.
 *
 * Every entity is:
 *   - searchable (keywords + aliases + substring match)
 *   - navigable (`path` is a hash route)
 *   - typed (route / project / lab / technology / experience / knowledge)
 */

export type EntityType =
  | 'route'
  | 'project'
  | 'lab'
  | 'technology'
  | 'experience'
  | 'knowledge'

export interface SearchEntity {
  id: string
  type: EntityType
  label: string
  description: string
  /** Alternate names people might type */
  aliases: string[]
  /** Hash route to navigate to when selected */
  path: string
  category: EntityType
}

type RawEntity = Omit<SearchEntity, 'category'>

const routes: RawEntity[] = [
  { id: 'route-home', type: 'route', label: 'Home', description: 'Developer workspace — hero, impact, skills, experience', aliases: ['main', 'index', 'top'], path: '#/' },
  { id: 'route-work', type: 'route', label: 'Work', description: 'Projects, case studies and deep dives', aliases: ['projects', 'portfolio', 'project'], path: '#/work' },
  { id: 'route-lab', type: 'route', label: 'Lab', description: 'Experiments and personal engineering', aliases: ['experiments', 'experimental'], path: '#/lab' },
  { id: 'route-experience', type: 'route', label: 'Experience', description: 'Engineering timeline and roles', aliases: ['career', 'jobs', 'work history'], path: '#/experience' },
  { id: 'route-knowledge', type: 'route', label: 'Knowledge', description: 'Obsidian knowledge graph and notes', aliases: ['obsidian', 'notes', 'vault'], path: '#/knowledge' },
  { id: 'route-now', type: 'route', label: 'Now', description: 'What I am currently building and learning', aliases: ['current', 'focus'], path: '#/now' },
  { id: 'route-recruiter', type: 'route', label: 'Recruiter Mode', description: '30-second reading: role, stack, impact', aliases: ['recruiter', 'hiring', 'resume'], path: '#/recruiter' },
  { id: 'route-contact', type: 'route', label: 'Contact', description: 'Email, location, ways to reach me', aliases: ['email', 'reach'], path: '#/contact' },
  { id: 'route-changelog', type: 'route', label: 'Changelog', description: 'Version history of this workspace', aliases: ['versions', 'releases'], path: '#/changelog' },
  { id: 'route-dashboard', type: 'route', label: 'Dashboard', description: 'Developer control center — GitHub, Obsidian, journal, AMLI', aliases: ['control center', 'admin'], path: '#/dashboard' },
]

const projectEntities: RawEntity[] = projects.map((p) => ({
  id: `project-${p.id}`,
  type: 'project',
  label: p.name,
  description: `${p.kicker} — ${p.description}`,
  aliases: [...(p.capabilities ?? []), ...p.technologies],
  path: `#/work/${p.id}`,
}))

const labEntities: RawEntity[] = labProjects.map((p) => ({
  id: `lab-${p.id}`,
  type: 'lab',
  label: p.name,
  description: `${p.status} — ${p.description}`,
  aliases: [...(p.technologies ?? []), p.category],
  path: `#/lab/${p.id}`,
}))

const experienceEntities: RawEntity[] = experience.map((e) => ({
  id: `experience-${e.id}`,
  type: 'experience',
  label: `${e.title} — ${e.company}`,
  description: `${e.period}${e.description ? ` · ${e.description}` : ''}`,
  aliases: [...(e.technologies ?? []), ...(e.projects ?? []), e.company, e.title],
  path: '#/experience',
}))

/** Unique technology set, derived from projects + experience + skills. */
function collectTechnologies(): RawEntity[] {
  const techSet = new Set<string>()
  for (const p of projects) for (const t of p.technologies) techSet.add(t)
  for (const e of experience) for (const t of e.technologies) techSet.add(t)
  for (const s of skillGroups) for (const t of s.items) techSet.add(t)
  for (const t of heroStack) techSet.add(t)
  return [...techSet].sort((a, b) => a.localeCompare(b)).map((tech) => ({
    id: `technology-${slugify(tech)}`,
    type: 'technology',
    label: tech,
    description: technologyContext(tech),
    aliases: [tech.toLowerCase(), tech.replace(/\s+/g, '')],
    path: technologyRoute(tech),
  }))
}

const knowledgeEntities: RawEntity[] = obsidianCategories.map((c) => ({
  id: `knowledge-${c.id}`,
  type: 'knowledge',
  label: c.label,
  description: c.description || `${c.noteCount} notes`,
  aliases: [c.label, c.folder],
  path: '#/knowledge',
}))

export const registry: SearchEntity[] = [
  ...routes,
  ...projectEntities,
  ...labEntities,
  ...experienceEntities,
  ...collectTechnologies(),
  ...knowledgeEntities,
].map((e) => ({ ...e, category: e.type }))

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item'
}

/** One-line, evidence-based context for a technology. */
function technologyContext(tech: string): string {
  const inProjects = projects.filter((p) => p.technologies.includes(tech)).map((p) => p.name)
  const inExperience = experience.filter((e) => e.technologies.includes(tech)).map((e) => e.company)
  const parts: string[] = []
  if (inProjects.length) parts.push(`Used in ${inProjects.join(', ')}`)
  if (inExperience.length) parts.push(`Experience: ${inExperience.join(', ')}`)
  return parts.join(' · ') || 'Technology'
}

function technologyRoute(tech: string): string {
  // No per-technology page yet; route to the best evidence surface.
  const hasProject = projects.some((p) => p.technologies.some((t) => t.toLowerCase() === tech.toLowerCase()))
  const hasKnowledge = obsidianCategories.some((c) => c.label.toLowerCase() === tech.toLowerCase())
  if (hasProject) return '#/work'
  if (hasKnowledge) return '#/knowledge'
  return '#/work'
}

/**
 * Search the registry.
 * Simple relevance scoring: alias/token matches rank higher than substring matches.
 */
export function searchRegistry(query: string, limit = 12): SearchEntity[] {
  const q = query.trim().toLowerCase()
  if (!q) return registry.slice(0, limit)

  const scored: { entity: SearchEntity; score: number }[] = []

  for (const entity of registry) {
    const label = entity.label.toLowerCase()
    const desc = entity.description.toLowerCase()
    const aliases = entity.aliases.map((a) => a.toLowerCase())

    let score = 0
    if (label === q) score = 100
    else if (aliases.includes(q)) score = 80
    else if (label.startsWith(q)) score = 60
    else if (label.includes(q)) score = 40
    else if (aliases.some((a) => a === q)) score = 70
    else if (aliases.some((a) => a.includes(q))) score = 30
    else if (desc.includes(q)) score = 20
    else if (entity.type === 'technology' && q.length >= 2 && label.split(/\s+/).some((w) => w.startsWith(q))) score = 25

    if (score > 0) scored.push({ entity, score })
  }

  return scored
    .sort((a, b) => b.score - a.score || a.entity.label.localeCompare(b.entity.label))
    .slice(0, limit)
    .map((s) => s.entity)
}

export function getRegistry(): SearchEntity[] {
  return registry
}

/** Routes that exist for cross-checking (data validation). */
export const validRoutes: ReadonlySet<PageRoute> = new Set<PageRoute>([
  'home', 'work', 'lab', 'now', 'knowledge', 'recruiter', 'contact', 'experience', 'changelog', 'dashboard', '404',
])