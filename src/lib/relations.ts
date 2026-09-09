/**
 * Relationship engine — the connective tissue between entities.
 *
 * Origin: projects → technologies → experience → impact → knowledge.
 *
 * Project     → technologies (stack)
 * Project     → experience  (where it was built)
 * Technology  → projects that use it
 * Technology  → experience roles that used it
 * Experience  → projects
 * Experience  → technologies
 * Impact      → experience context
 * Knowledge   → categories (obsidian), linked to subjects by keyword
 *
 * All data here is derived from the static workspace data files — nothing is
 * fabricated. Entities that have no connection simply return empty lists.
 */
import { projects, type Project } from '@/data/projects'
import { experience, type ExperienceEntry } from '@/data/experience'
import { impactMetrics, type ImpactMetric } from '@/data/impact'
import { obsidianCategories } from '@/data/obsidian.generated'
import type { ObsidianCategory } from '@/dashboard/lib/obsidian'

export type EntityKind = 'project' | 'technology' | 'experience' | 'impact' | 'knowledge'

export interface RelatedEntity {
  kind: EntityKind
  id: string
  name: string
  description?: string
  /** Hash route to navigate to the entity's primary surface. */
  path: string
}

export interface EntityRef {
  kind: EntityKind
  id: string
  name: string
  description: string
  path: string
}

const knowledgeRefs: Map<string, ObsidianCategory> = new Map(
  obsidianCategories.map((c) => [c.id, c]),
)

function slugId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item'
}

function projectRef(p: Project): EntityRef {
  return {
    kind: 'project',
    id: p.id,
    name: p.name,
    description: `${p.kicker} — ${p.description}`,
    path: `#/work/${p.id}`,
  }
}

function experienceRef(e: ExperienceEntry): EntityRef {
  return {
    kind: 'experience',
    id: e.id,
    name: `${e.title} · ${e.company}`,
    description: e.period,
    path: '#/experience',
  }
}

function impactRef(m: ImpactMetric): EntityRef {
  return {
    kind: 'impact',
    id: m.id,
    name: `${m.value} — ${m.label}`,
    description: m.context,
    path: '#/',
  }
}

function knowledgeRef(c: ObsidianCategory): EntityRef {
  return {
    kind: 'knowledge',
    id: c.id,
    name: c.label,
    description: c.description || `${c.noteCount} notes`,
    path: '#/knowledge',
  }
}

/** Projects that use a given technology (case/token aware). */
export function projectsUsingTechnology(name: string): Project[] {
  const needle = name.trim().toLowerCase()
  return projects.filter((p) => p.technologies.some((t) => t.toLowerCase().includes(needle)))
}

/** Experience roles that used a given technology. */
export function experienceUsingTechnology(name: string): ExperienceEntry[] {
  const needle = name.trim().toLowerCase()
  return experience.filter((e) =>
    e.technologies.some((t) => t.toLowerCase().includes(needle)),
  )
}

/** Entities related to a project. */
export function relationsForProject(id: string): RelatedEntity[] {
  const project = projects.find((p) => p.id === id)
  if (!project) return []

  const related: RelatedEntity[] = []

  for (const tech of project.technologies) {
    related.push({
      kind: 'technology',
      id: slugId(tech),
      name: tech,
      path: '#/work',
    })
  }

  const exp = experience.filter((e) => (e.projects ?? []).some((p) => p.toLowerCase() === project.name.toLowerCase()))
  for (const e of exp) {
    const r = experienceRef(e)
    related.push({
      kind: 'experience',
      id: e.id,
      name: r.name,
      description: r.description,
      path: r.path,
    })
  }

  const relatedImpacts = impactMetrics.filter((m) =>
    m.source.toLowerCase().includes(project.name.toLowerCase()) ||
    (exp.length > 0 && m.source.toLowerCase().includes(exp[0].company.toLowerCase())),
  )
  for (const m of relatedImpacts) {
    const r = impactRef(m)
    related.push({ kind: 'impact', id: m.id, name: r.name, description: r.description, path: r.path })
  }

  return related
}

/** Entities related to a technology. */
export function relationsForTechnology(name: string): RelatedEntity[] {
  const related: RelatedEntity[] = []

  for (const p of projectsUsingTechnology(name)) {
    const r = projectRef(p)
    related.push({ kind: 'project', id: p.id, name: r.name, description: r.description, path: r.path })
  }

  for (const e of experienceUsingTechnology(name)) {
    const r = experienceRef(e)
    related.push({ kind: 'experience', id: e.id, name: r.name, description: r.description, path: r.path })
  }

  const subject = name.trim().toLowerCase()
  for (const r of knowledgeRefs.values()) {
    if (
      r.label.toLowerCase().includes(subject) ||
      (r.description || '').toLowerCase().includes(subject)
    ) {
      related.push(knowledgeRef(r))
    }
  }

  return related
}

/** Experience entity relations. */
export function relationsForExperience(id: string): RelatedEntity[] {
  const entry = experience.find((e) => e.id === id)
  if (!entry) return []

  const related: RelatedEntity[] = []

  for (const projectName of entry.projects ?? []) {
    const project = projects.find((p) => p.name.toLowerCase() === projectName.toLowerCase())
    if (project) {
      const r = projectRef(project)
      related.push({ kind: 'project', id: project.id, name: r.name, description: r.description, path: r.path })
    }
  }

  for (const tech of entry.technologies) {
    related.push({ kind: 'technology', id: slugId(tech), name: tech, path: '#/work' })
  }

  for (const m of impactMetrics) {
    if (m.source.toLowerCase().includes(entry.company.toLowerCase())) {
      const r = impactRef(m)
      related.push({ kind: 'impact', id: m.id, name: r.name, description: r.description, path: r.path })
    }
  }

  return related
}

/**
 * Resolve the entity set for any entity type + id pair.
 * Returns the entity itself if found, plus its relations.
 */
export function inspectEntity(kind: EntityKind, id: string): { entity: EntityRef | null; relations: RelatedEntity[] } {
  switch (kind) {
    case 'project': {
      const project = projects.find((p) => p.id === id)
      return { entity: project ? projectRef(project) : null, relations: relationsForProject(id) }
    }
    case 'technology': {
      const name = id
      const related = relationsForTechnology(name)
      const description =
        related.filter((r) => r.kind === 'project').length > 0
          ? `Used in ${related.filter((r) => r.kind === 'project').map((r) => r.name).join(', ')}`
          : 'Technology'
      return {
        entity: { kind: 'technology', id: slugId(name), name, description, path: '#/work' },
        relations: related,
      }
    }
    case 'experience': {
      const entry = experience.find((e) => e.id === id)
      if (!entry) return { entity: null, relations: [] }
      return { entity: experienceRef(entry), relations: relationsForExperience(id) }
    }
    case 'impact': {
      const metric = impactMetrics.find((m) => m.id === id)
      if (!metric) return { entity: null, relations: [] }
      return { entity: impactRef(metric), relations: [] }
    }
    case 'knowledge': {
      const category = knowledgeRefs.get(id)
      if (!category) return { entity: null, relations: [] }
      const relations: RelatedEntity[] = []
      const subject = category.label.trim().toLowerCase()
      for (const p of projects) {
        if (p.technologies.some((t) => t.toLowerCase().includes(subject))) {
          const r = projectRef(p)
          relations.push({ kind: 'project', id: p.id, name: r.name, description: r.description, path: r.path })
        }
      }
      for (const tech of relatedTechNames(category)) {
        relations.push({ kind: 'technology', id: slugId(tech), name: tech, path: '#/work' })
      }
      return { entity: knowledgeRef(category), relations }
    }
    default:
      return { entity: null, relations: [] }
  }
}

function relatedTechNames(category: ObsidianCategory): string[] {
  const subject = category.label.trim().toLowerCase()
  const seen = new Set<string>()
  const out: string[] = []
  for (const p of projects) {
    for (const t of p.technologies) {
      const tl = t.toLowerCase()
      if (!seen.has(tl) && (tl.includes(subject) || subject.includes(tl))) {
        seen.add(tl)
        out.push(t)
      }
    }
  }
  return out
}

/** The top technology list (for skills-as-modules etc.). */
export function allTechnologies(): string[] {
  const set = new Set<string>()
  for (const p of projects) for (const t of p.technologies) set.add(t)
  for (const e of experience) for (const t of e.technologies) set.add(t)
  return [...set].sort((a, b) => a.localeCompare(b))
}