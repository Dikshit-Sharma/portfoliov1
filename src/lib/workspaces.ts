import type { PageRoute } from '@/lib/router'

/**
 * OS workspace model.
 *
 * The site is presented as a personal developer OS with four primary
 * workspaces plus a set of auxiliary views. Workspaces drive the top bar
 * (Waybar-style) workspace switcher, keyboard navigation, the status bar,
 * and shortcuts. Auxiliary views (Now, Contact, Recruiter, Dashboard, etc.)
 * exist outside the numbered workspaces but share the same shell.
 */
export interface WorkspaceRouteEntity {
  route: PageRoute
  label: string
  number?: number
  description: string
  /** Content type the workspace surfaces (used by the context status bar). */
  context: string
}

export const WORKSPACES: WorkspaceRouteEntity[] = [
  {
    route: 'work',
    label: 'Work',
    number: 1,
    description: 'Professional projects and engineering deep dives',
    context: 'Projects · Experience',
  },
  {
    route: 'lab',
    label: 'Lab',
    number: 2,
    description: 'Experiments and personal engineering',
    context: 'Experiments',
  },
  {
    route: 'knowledge',
    label: 'Knowledge',
    number: 3,
    description: 'Obsidian knowledge graph and notes',
    context: 'Notes · Graph',
  },
  {
    route: 'system',
    label: 'System',
    number: 4,
    description: 'About, architecture, changelog, integrations',
    context: 'System status',
  },
]

/** Map a route to a workspace (if any). */
export function workspaceForRoute(route: PageRoute): WorkspaceRouteEntity | undefined {
  return WORKSPACES.find((w) => w.route === route)
}

export const OS_IDENTITY = {
  username: 'dksh',
  host: 'workspace',
  /** Shown where a short host handle is needed. */
  handle: 'dksh@workspace',
  os: 'Portfolio OS',
  wm: 'Hyprland-inspired',
  shell: 'zsh',
  editor: 'Neovim-inspired',
} as const

export const displayHandle = `${OS_IDENTITY.username}@${OS_IDENTITY.host}`

/**
 * Integration state — mirrors real availability. We never fabricate metrics;
 * an integration is ONLINE only when a live request succeeded, CACHED when we
 * served stale-but-real data, ERROR when a request failed, and UNAVAILABLE when
 * there is no data source configured.
 */
export type IntegrationStatus =
  | 'ONLINE'
  | 'CACHED'
  | 'LOADING'
  | 'ERROR'
  | 'LOCKED'
  | 'UNAVAILABLE'

export interface IntegrationModel {
  id: string
  label: string
  status: IntegrationStatus
  /** ISO timestamp of the last successful data pull, if any. */
  lastUpdated?: string
  detail?: string
}

export const STATUS_SYMBOL: Record<IntegrationStatus, string> = {
  ONLINE: '●',
  CACHED: '◐',
  LOADING: '◌',
  ERROR: '×',
  LOCKED: '🔒',
  UNAVAILABLE: '—',
}