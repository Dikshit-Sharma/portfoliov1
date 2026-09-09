import type { ComponentType, LazyExoticComponent, ReactNode } from 'react'

/**
 * Desktop environment types.
 *
 * The app behaves like a personal desktop environment:
 *   desktop → workspace → window → application → content.
 * Routes become a way to represent and deep-link application state.
 */

/** A workspace is a persistent container of windows (Hyprland workspaces). */
export type WorkspaceId = 'work' | 'lab' | 'knowledge' | 'system'

export interface WorkspaceDef {
  id: WorkspaceId
  name: string
  number: number
  /** Short monospace handle shown in the top bar / status (e.g. "~/work"). */
  handle: string
  description: string
  /** Applications that are conceptually home here (used by launcher/registry). */
  apps?: AppId[]
}

/** Application identifiers (first-class citizens). */
export type AppId =
  | 'portfolio'
  | 'projects'
  | 'experience'
  | 'lab'
  | 'terminal'
  | 'knowledge'
  | 'architecture'
  | 'github'
  | 'system'
  | 'contact'
  | 'recruiter'
  | 'changelog'
  | 'now'
  | 'settings'

export type WindowStateKind = 'normal' | 'maximized' | 'minimized'

/** A window instance inside a workspace. */
export interface WindowState {
  id: string
  appId: AppId
  workspaceId: WorkspaceId
  title: string
  icon?: string
  /** deep link (hash) this window represents, if any */
  route?: string
  state: WindowStateKind
  focused: boolean
  zIndex: number
  /** per-app persistent payload (e.g. selected project / knowledge node) */
  payload?: Record<string, string | number | boolean | null | undefined>
  /** layout slot assigned by the window manager (tiling) */
  tile?: 'full' | 'left' | 'right' | 'top' | 'bottom' | 'floating'
}

/** Application definition. */
export interface ApplicationDef {
  id: AppId
  name: string
  icon?: ReactNode
  description: string
  /** Which workspace this app opens into by default (when not already running). */
  defaultWorkspace: WorkspaceId
  /** Keyboard-accessible shortcut hint (e.g. "Super+Enter"). */
  shortcut?: string
  /** When the app's deep link route is visited, this app is focused/opened. */
  route?: string
  /** Whether this app is considered part of the private surface (never on public desktop). */
  private?: boolean
  /** Lazily-loaded component. */
  component: LazyExoticComponent<ComponentType<AppProps>>
}

/**
 * Props passed to every application component.
 * Applications are content — the desktop shell provides the chrome.
 */
export interface AppProps {
  /** unique window id this instance is rendered under */
  windowId: string
  /** current app-specific payload state (mutable via setPayload) */
  payload?: WindowState['payload']
  /** update the app payload (persisted with the window) */
  setPayload: (patch: Record<string, string | number | boolean | null | undefined>) => void
  /** navigate the desktop (opens/focuses apps, changes workspace). */
  openApp?: (appId: AppId, opts?: { workspace?: WorkspaceId; payload?: WindowState['payload'] }) => void
  /** close this window. */
  onClose?: () => void
}

/** Central registry combining applications, commands and entities. */
export type RegistryResultKind =
  | 'application'
  | 'workspace'
  | 'command'
  | 'project'
  | 'experience'
  | 'technology'
  | 'knowledge'
  | 'architecture'
  | 'route'

export interface RegistryResult {
  kind: RegistryResultKind
  id: string
  label: string
  description?: string
  hint?: string
  /** workspace this result lives in */
  workspace?: WorkspaceId
  /** payload to open (typically a project id / entity id) */
  payload?: WindowState['payload']
  /** inline action (not app-bound), e.g. open URL */
  action?: () => void
}

/** Global integration state — truthful, never fabricated. */
export type IntegrationId = 'github' | 'knowledge' | 'dashboard' | 'network'

export const STATUS_SYMBOL = {
  ONLINE: '●',
  CACHED: '◐',
  LOADING: '◌',
  ERROR: '×',
  LOCKED: '🔒',
  UNAVAILABLE: '—',
} as const

export type IntegrationStatus = keyof typeof STATUS_SYMBOL

export interface IntegrationModel {
  id: IntegrationId
  label: string
  status: IntegrationStatus
  lastUpdated?: string
  detail?: string
}
