import { lazy } from 'react'
import {
  Briefcase,
  Compass,
  FileCode2,
  GitBranch,
  Globe,
  LayoutDashboard,
  ListTodo,
  NotebookPen,
  Settings,
  TerminalSquare,
  User,
  Workflow,
} from 'lucide-react'
import type { ApplicationDef, AppId, WorkspaceDef, WorkspaceId } from './desktop.types'

/**
 * Application registry — the desktop's first-class citizens.
 * Applications wrap existing components; no data is duplicated.
 */

export const WORKSPACE_DEFS: WorkspaceDef[] = [
  {
    id: 'work',
    name: 'Work',
    number: 1,
    handle: '~/work',
    description: 'Professional projects and engineering deep dives',
    apps: ['portfolio', 'projects', 'experience', 'contact', 'terminal'],
  },
  {
    id: 'lab',
    name: 'Lab',
    number: 2,
    handle: '~/lab',
    description: 'Experiments and personal engineering',
    apps: ['lab', 'terminal', 'now'],
  },
  {
    id: 'knowledge',
    name: 'Knowledge',
    number: 3,
    handle: '~/knowledge',
    description: 'Obsidian knowledge graph and notes',
    apps: ['knowledge', 'terminal'],
  },
  {
    id: 'system',
    name: 'System',
    number: 4,
    handle: '~/system',
    description: 'Architecture, integrations, and settings',
    apps: ['architecture', 'github', 'system', 'settings', 'changelog', 'terminal'],
  },
]

export function workspaceDef(id: WorkspaceId): WorkspaceDef {
  return WORKSPACE_DEFS.find((w) => w.id === id) ?? WORKSPACE_DEFS[0]
}

/**
 * Applications. Heavy subsystems are lazy so the desktop boots light and
 * only pulls in Knowledge/Terminal/Dashboard/etc. when actually opened.
 */
export const APPLICATIONS: ApplicationDef[] = [
  {
    id: 'portfolio',
    name: 'Portfolio',
    icon: <User className="size-4" />,
    description: 'Who I am — profile, skills, experience, education',
    defaultWorkspace: 'work',
    shortcut: 'Super+1',
    route: 'portfolio',
    component: lazy(() => import('./apps/PortfolioApp')),
  },
  {
    id: 'projects',
    name: 'Projects',
    icon: <FileCode2 className="size-4" />,
    description: 'Projects catalog and engineering deep dives',
    defaultWorkspace: 'work',
    shortcut: 'Super+P',
    route: 'work',
    component: lazy(() => import('./apps/ProjectsApp')),
  },
  {
    id: 'experience',
    name: 'Experience',
    icon: <Briefcase className="size-4" />,
    description: 'Professional experience timeline',
    defaultWorkspace: 'work',
    route: 'experience',
    component: lazy(() => import('./apps/ExperienceApp')),
  },
  {
    id: 'lab',
    name: 'Lab',
    icon: <Compass className="size-4" />,
    description: 'Experiments and side projects',
    defaultWorkspace: 'lab',
    shortcut: 'Super+2',
    route: 'lab',
    component: lazy(() => import('./apps/LabApp')),
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: <TerminalSquare className="size-4" />,
    description: 'Interactive developer shell',
    defaultWorkspace: 'lab',
    shortcut: 'Super+Enter',
    component: lazy(() => import('./apps/TerminalApp')),
  },
  {
    id: 'knowledge',
    name: 'Knowledge',
    icon: <NotebookPen className="size-4" />,
    description: 'Obsidian knowledge graph and notes',
    defaultWorkspace: 'knowledge',
    shortcut: 'Super+3',
    route: 'knowledge',
    component: lazy(() => import('./apps/KnowledgeApp')),
  },
  {
    id: 'architecture',
    name: 'Architecture',
    icon: <Workflow className="size-4" />,
    description: 'System inspector — architecture diagrams',
    defaultWorkspace: 'system',
    route: 'architecture',
    component: lazy(() => import('./apps/ArchitectureApp')),
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: <GitBranch className="size-4" />,
    description: 'Repository and integration state',
    defaultWorkspace: 'system',
    route: 'github',
    component: lazy(() => import('./apps/GithubApp')),
  },
  {
    id: 'system',
    name: 'System',
    icon: <LayoutDashboard className="size-4" />,
    description: 'Environment, integrations, about',
    defaultWorkspace: 'system',
    shortcut: 'Super+4',
    route: 'system',
    component: lazy(() => import('./apps/SystemApp')),
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: <Settings className="size-4" />,
    description: 'Theme, workspace, shortcuts',
    defaultWorkspace: 'system',
    component: lazy(() => import('./apps/SettingsApp')),
  },
  {
    id: 'contact',
    name: 'Contact',
    icon: <Globe className="size-4" />,
    description: 'Email, phone, social links',
    defaultWorkspace: 'work',
    route: 'contact',
    component: lazy(() => import('./apps/ContactApp')),
  },
  {
    id: 'recruiter',
    name: 'Recruiter',
    icon: <User className="size-4" />,
    description: 'Simplified professional profile',
    defaultWorkspace: 'work',
    route: 'recruiter',
    component: lazy(() => import('./apps/RecruiterApp')),
  },
  {
    id: 'changelog',
    name: 'Changelog',
    icon: <ListTodo className="size-4" />,
    description: 'Version history',
    defaultWorkspace: 'system',
    route: 'changelog',
    component: lazy(() => import('./apps/ChangelogApp')),
  },
  {
    id: 'now',
    name: 'Now',
    icon: <ListTodo className="size-4" />,
    description: 'Currently building, learning, experimenting',
    defaultWorkspace: 'lab',
    route: 'now',
    component: lazy(() => import('./apps/NowApp')),
  },
]

const appIndex = new Map(APPLICATIONS.map((a) => [a.id, a]))

export function getApplication(id: AppId): ApplicationDef {
  const app = appIndex.get(id)
  if (!app) throw new Error(`Unknown application: ${id}`)
  return app
}

export const APPLICATION_IDS = APPLICATIONS.map((a) => a.id) as AppId[]
