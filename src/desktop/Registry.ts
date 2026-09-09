import type { RegistryResult } from './desktop.types'
import { APPLICATIONS, WORKSPACE_DEFS } from './ApplicationRegistry'
import { navigate } from '@/lib/router'
import { registry as entityRegistry, type SearchEntity } from '@/lib/registry'
import { projects } from '@/data/projects'
import { experience } from '@/data/experience'
import { site } from '@/data/site'
import { systemMaps } from '@/data/architecture'

/**
 * Unified registry — the single source of truth for global search.
 * Combines:
 *   - applications (from the ApplicationRegistry)
 *   - workspaces
 *   - commands (theme, terminal, resume, connect…)
 *   - entities (projects, experience, technologies, knowledge, architecture)
 *
 * The launcher and the terminal both resolve against this one registry.
 */

function buildIndex(): RegistryResult[] {
  const results: RegistryResult[] = []

  // Workspaces
  for (const ws of WORKSPACE_DEFS) {
    results.push({
      kind: 'workspace',
      id: ws.id,
      label: ws.name,
      description: ws.description,
      hint: `workspace ${ws.number}`,
      workspace: ws.id,
    })
  }

  // Applications
  for (const app of APPLICATIONS) {
    if (app.private) continue
    results.push({
      kind: 'application',
      id: app.id,
      label: app.name,
      description: app.description,
      hint: app.shortcut,
      workspace: app.defaultWorkspace,
      payload: undefined,
    })
  }

  // Commands
  results.push(
    {
      kind: 'command',
      id: 'terminal',
      label: 'Open Terminal',
      description: 'Launch the interactive shell',
      hint: 'Super+Enter / t',
      workspace: 'lab',
    },
    {
      kind: 'command',
      id: 'resume',
      label: 'Download Resume',
      description: 'Open the PDF resume',
      hint: 'r',
      action: () => window.open(site.resumePath, '_blank', 'noreferrer'),
    },
    {
      kind: 'command',
      id: 'github-open',
      label: 'Open GitHub profile',
      description: 'External link',
      hint: 'gh',
      action: () => window.open(site.github, '_blank', 'noreferrer'),
    },
    {
      kind: 'command',
      id: 'linkedin',
      label: 'Open LinkedIn',
      description: 'External link',
      hint: 'in',
      action: () => window.open(site.linkedin, '_blank', 'noreferrer'),
    },
    {
      kind: 'command',
      id: 'email',
      label: 'Send Email',
      description: `mailto:${site.email}`,
      hint: 'mail',
      action: () => window.open(`mailto:${site.email}`),
    },
    {
      kind: 'command',
      id: 'recruiter',
      label: 'Recruiter Mode',
      description: 'Simplified professional profile',
      hint: 'recruiter',
      workspace: 'work',
    },
  )

  // Projects → target the projects application
  for (const p of projects) {
    results.push({
      kind: 'project',
      id: p.id,
      label: p.name,
      description: p.description,
      hint: p.kicker,
      workspace: 'work',
      payload: { projectId: p.id },
    })
  }

  // Experience
  for (const e of experience) {
    results.push({
      kind: 'experience',
      id: e.id,
      label: `${e.title} — ${e.company}`,
      description: e.period,
      hint: 'role',
      workspace: 'work',
      payload: { experienceId: e.id },
    })
  }

  // Technologies & knowledge entities from the existing entity registry
  const seen = new Set<string>()
  for (const entity of entityRegistry as SearchEntity[]) {
    if (entity.type === 'technology') {
      if (seen.has(entity.label)) continue
      seen.add(entity.label)
      results.push({
        kind: 'technology',
        id: entity.id,
        label: entity.label,
        description: entity.description,
        hint: 'tech',
        workspace: 'knowledge',
        payload: { entityId: entity.label },
      })
    } else if (entity.type === 'knowledge') {
      results.push({
        kind: 'knowledge',
        id: entity.id,
        label: entity.label,
        description: entity.description,
        hint: 'knowledge',
        workspace: 'knowledge',
        payload: { entityId: entity.label },
      })
    }
  }

  // Architecture maps
  for (const map of systemMaps) {
    results.push({
      kind: 'architecture',
      id: map.id,
      label: map.name,
      description: map.description,
      hint: 'architecture',
      workspace: 'system',
      payload: { mapId: map.id },
    })
  }

  return results
}

const index: RegistryResult[] = buildIndex()

function score(result: RegistryResult, q: string): number {
  const label = result.label.toLowerCase()
  const desc = (result.description ?? '').toLowerCase()
  if (label === q) return 100
  if (label.startsWith(q)) return 80
  if (label.includes(q)) return 60
  if (desc.includes(q)) return 40
  return 0
}

/** Search across the unified registry. Results are categorized by the caller. */
export function searchAll(query: string): RegistryResult[] {
  if (!query) return index.slice(0, 24)
  const q = query.toLowerCase()
  return index
    .map((r) => ({ r, s: score(r, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 40)
    .map((x) => x.r)
}

/** Filter results by category for the launcher / command palette. */
export function categorizeResults(results: RegistryResult[]): { category: string; results: RegistryResult[] }[] {
  const order: RegistryResult['kind'][] = ['application', 'workspace', 'project', 'knowledge', 'technology', 'experience', 'architecture', 'command', 'route']
  const label: Record<RegistryResult['kind'], string> = {
    application: 'Applications',
    workspace: 'Workspaces',
    command: 'Commands',
    project: 'Projects',
    experience: 'Experience',
    technology: 'Technologies',
    knowledge: 'Knowledge',
    architecture: 'Architecture',
    route: 'Routes',
  }
  const map = new Map<string, RegistryResult[]>()
  for (const r of results) {
    const key = label[r.kind]
    const arr = map.get(key) ?? []
    arr.push(r)
    map.set(key, arr)
  }
  return order
    .map((k) => ({ category: label[k], results: map.get(label[k]) ?? [] }))
    .filter((g) => g.results.length > 0)
}

/** Keep a navigate import alive for deep-link use. */
export function navigateRoute(route: string) {
  navigate(route as never)
}
