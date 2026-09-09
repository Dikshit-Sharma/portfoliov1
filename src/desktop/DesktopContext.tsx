import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type {
  AppId,
  ApplicationDef,
  IntegrationModel,
  WindowState,
  WorkspaceId,
} from './desktop.types'
import { getApplication } from './ApplicationRegistry'
import { searchAll } from './Registry'
import type { RegistryResult } from './desktop.types'

/**
 * Desktop context — owns desktop-level state: workspaces, windows,
 * launcher, quick settings, notifications, and the unified registry.
 *
 * The mental model: desktop → workspace → window → application → content.
 * Routes deep-link into workspace+window+entity; workspace switch is a
 * state transition, NOT a route reload.
 */

export type DesktopView =
  | { type: 'desktop'; workspace: WorkspaceId }
  | { type: 'launcher' }
  | { type: 'quicksettings' }
  | { type: 'notifications' }
  | { type: 'recruiter' }

export interface DesktopState {
  workspaces: Record<WorkspaceId, WindowState[]>
  activeWorkspace: WorkspaceId
  focusedWindowId: string | null
  view: DesktopView
  integrations: Record<string, IntegrationModel>
  notifications: DesktopNotification[]
}

export interface DesktopNotification {
  id: string
  title: string
  body?: string
  kind: 'info' | 'success' | 'error' | 'warn'
  timestamp: number
  read: boolean
}

type DesktopAction =
  | { type: 'SET_WORKSPACE'; workspace: WorkspaceId }
  | { type: 'OPEN_APP'; appId: AppId; workspace?: WorkspaceId; payload?: WindowState['payload'] }
  | { type: 'CLOSE_WINDOW'; windowId: string }
  | { type: 'FOCUS_WINDOW'; windowId: string }
  | { type: 'MINIMIZE_WINDOW'; windowId: string }
  | { type: 'RESTORE_WINDOW'; windowId: string }
  | { type: 'MAXIMIZE_WINDOW'; windowId: string }
  | { type: 'NORMALIZE_WINDOW'; windowId: string }
  | { type: 'SET_WINDOW_PAYLOAD'; windowId: string; payload: WindowState['payload'] }
  | { type: 'SET_VIEW'; view: DesktopView }
  | { type: 'SET_INTEGRATIONS'; integrations: Record<string, IntegrationModel> }
  | { type: 'ADD_NOTIFICATION'; notification: DesktopNotification }
  | { type: 'MARK_NOTIFICATIONS_READ' }
  | { type: 'DISMISS_NOTIFICATION'; id: string }
  | { type: 'HYDRATE'; state: Pick<DesktopState, 'workspaces' | 'activeWorkspace'> }

let windowSeq = 0
function nextWindowId(): string {
  windowSeq += 1
  return `win-${Date.now().toString(36)}-${windowSeq}`
}

let zSeq = 10
function nextZ(): number {
  zSeq += 1
  return zSeq
}

const EMPTY_WS = (): WindowState[] => []

function bringToFront(windows: WindowState[], id: string): WindowState[] {
  return windows.map((w) => (w.id === id ? { ...w, focused: true } : { ...w, focused: false }))
}

function reducer(state: DesktopState, action: DesktopAction): DesktopState {
  switch (action.type) {
    case 'SET_WORKSPACE':
      if (action.workspace === state.activeWorkspace) return state
      return { ...state, activeWorkspace: action.workspace }

    case 'OPEN_APP': {
      const targetWs = action.workspace ?? state.activeWorkspace
      const ws = state.workspaces[targetWs] ?? EMPTY_WS()
      const existing = ws.find((w) => w.appId === action.appId)

      // If a window is minimized in this workspace, restore & focus it.
      const minimized = ws.find((w) => w.appId === action.appId && w.state === 'minimized')
      if (existing) {
        const updated = bringToFront(
          ws.map((w) =>
            w.id === existing.id
              ? {
                  ...w,
                  state: minimized ? 'normal' : w.state,
                  focused: true,
                  payload: action.payload ? { ...w.payload, ...action.payload } : w.payload,
                  zIndex: nextZ(),
                }
              : w,
          ),
          existing.id,
        )
        return { ...state, activeWorkspace: targetWs, workspaces: { ...state.workspaces, [targetWs]: updated } }
      }

      // Fresh window.
      const app = getApplication(action.appId)
      const win: WindowState = {
        id: nextWindowId(),
        appId: action.appId,
        workspaceId: targetWs,
        title: app.name,
        icon: undefined,
        route: app.route,
        state: 'normal',
        focused: true,
        zIndex: nextZ(),
        payload: action.payload,
        tile: 'full',
      }
      const newWs = [...ws.map((w) => ({ ...w, focused: false })), win]
      return { ...state, activeWorkspace: targetWs, focusedWindowId: win.id, workspaces: { ...state.workspaces, [targetWs]: newWs } }
    }

    case 'CLOSE_WINDOW': {
      const next = { ...state.workspaces }
      for (const key of Object.keys(next) as WorkspaceId[]) {
        if (next[key].some((w) => w.id === action.windowId)) {
          next[key] = next[key].filter((w) => w.id !== action.windowId)
        }
      }
      return { ...state, workspaces: next }
    }

    case 'FOCUS_WINDOW': {
      const ws = state.workspaces[state.activeWorkspace] ?? EMPTY_WS()
      return {
        ...state,
        focusedWindowId: action.windowId,
        workspaces: {
          ...state.workspaces,
          [state.activeWorkspace]: bringToFront(
            ws.map((w) => (w.id === action.windowId ? { ...w, zIndex: nextZ() } : w)),
            action.windowId,
          ),
        },
      }
    }

    case 'MINIMIZE_WINDOW': {
      const ws = state.workspaces[state.activeWorkspace] ?? EMPTY_WS()
      return {
        ...state,
        workspaces: {
          ...state.workspaces,
          [state.activeWorkspace]: ws.map((w) =>
            w.id === action.windowId ? { ...w, state: 'minimized', focused: false } : w,
          ),
        },
      }
    }

    case 'RESTORE_WINDOW': {
      const ws = state.workspaces[state.activeWorkspace] ?? EMPTY_WS()
      return {
        ...state,
        focusedWindowId: action.windowId,
        workspaces: {
          ...state.workspaces,
          [state.activeWorkspace]: bringToFront(
            ws.map((w) => (w.id === action.windowId ? { ...w, state: 'normal', zIndex: nextZ() } : w)),
            action.windowId,
          ),
        },
      }
    }

    case 'MAXIMIZE_WINDOW': {
      const ws = state.workspaces[state.activeWorkspace] ?? EMPTY_WS()
      return {
        ...state,
        workspaces: {
          ...state.workspaces,
          [state.activeWorkspace]: ws.map((w) =>
            w.id === action.windowId ? { ...w, state: 'maximized' } : w,
          ),
        },
      }
    }

    case 'NORMALIZE_WINDOW': {
      const ws = state.workspaces[state.activeWorkspace] ?? EMPTY_WS()
      return {
        ...state,
        workspaces: {
          ...state.workspaces,
          [state.activeWorkspace]: ws.map((w) =>
            w.id === action.windowId && w.state === 'maximized' ? { ...w, state: 'normal' } : w,
          ),
        },
      }
    }

    case 'SET_WINDOW_PAYLOAD': {
      const ws = state.workspaces[state.activeWorkspace] ?? EMPTY_WS()
      return {
        ...state,
        workspaces: {
          ...state.workspaces,
          [state.activeWorkspace]: ws.map((w) =>
            w.id === action.windowId ? { ...w, payload: { ...w.payload, ...action.payload } } : w,
          ),
        },
      }
    }

    case 'SET_VIEW':
      return { ...state, view: action.view }

    case 'SET_INTEGRATIONS':
      return { ...state, integrations: action.integrations }

    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.notification, ...state.notifications].slice(0, 30) }

    case 'MARK_NOTIFICATIONS_READ':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) }

    case 'DISMISS_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter((n) => n.id !== action.id) }

    case 'HYDRATE':
      return { ...state, workspaces: action.state.workspaces, activeWorkspace: action.state.activeWorkspace }

    default:
      return state
  }
}

/** Default desktop boot: Work workspace with the Portfolio window open. */
function initialWorkspaces(): Record<WorkspaceId, WindowState[]> {
  const win: WindowState = {
    id: nextWindowId(),
    appId: 'portfolio',
    workspaceId: 'work',
    title: getApplication('portfolio').name,
    route: 'portfolio',
    state: 'normal',
    focused: true,
    zIndex: nextZ(),
    tile: 'full',
  }
  return { work: [win], lab: [], knowledge: [], system: [] }
}

interface DesktopContextValue {
  state: DesktopState
  openApp: (appId: AppId, opts?: { workspace?: WorkspaceId; payload?: WindowState['payload'] }) => void
  closeWindow: (windowId: string) => void
  focusWindow: (windowId: string) => void
  minimizeWindow: (windowId: string) => void
  restoreWindow: (windowId: string) => void
  maximizeWindow: (windowId: string) => void
  normalizeWindow: (windowId: string) => void
  setWindowPayload: (windowId: string, payload: WindowState['payload']) => void
  setWorkspace: (workspace: WorkspaceId) => void
  setView: (view: DesktopView) => void
  notify: (n: { title: string; body?: string; kind?: DesktopNotification['kind'] }) => void
  markNotificationsRead: () => void
  dismissNotification: (id: string) => void
  setIntegrations: (integrations: Record<string, IntegrationModel>) => void
  /** unified registry: search apps, commands, and entities */
  search: (query: string) => RegistryResult[]
  runResult: (result: RegistryResult) => void
}

const DesktopContext = createContext<DesktopContextValue | null>(null)

export function useDesktop() {
  const ctx = useContext(DesktopContext)
  if (!ctx) throw new Error('useDesktop must be used within DesktopProvider')
  return ctx
}

const STORAGE_KEY = 'dikshit-os-desktop.v1'

function loadPersisted(): { workspaces?: Record<WorkspaceId, WindowState[]>; activeWorkspace?: WorkspaceId } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed
  } catch {
    return {}
  }
}

export function DesktopProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const persisted = loadPersisted()
    if (persisted.workspaces && persisted.activeWorkspace) {
      const ws = persisted.activeWorkspace
      const initial: DesktopState = {
        workspaces: persisted.workspaces,
        activeWorkspace: ws,
        focusedWindowId: null,
        view: { type: 'desktop', workspace: ws },
        integrations: {},
        notifications: [],
      }
      return initial
    }
    const initial: DesktopState = {
      workspaces: initialWorkspaces(),
      activeWorkspace: 'work',
      focusedWindowId: null,
      view: { type: 'desktop', workspace: 'work' },
      integrations: {},
      notifications: [],
    }
    return initial
  })

  // Persist client-only state (workspace + open windows). Never stores private data.
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ workspaces: state.workspaces, activeWorkspace: state.activeWorkspace }),
      )
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  }, [state.workspaces, state.activeWorkspace])

  const openApp = useCallback(
    (appId: AppId, opts?: { workspace?: WorkspaceId; payload?: WindowState['payload'] }) => {
      dispatch({ type: 'OPEN_APP', appId, workspace: opts?.workspace, payload: opts?.payload })
      setHash(hashForApp(appId, opts?.payload))
    },
    [],
  )

  const closeWindow = useCallback((windowId: string) => dispatch({ type: 'CLOSE_WINDOW', windowId }), [])
  const focusWindow = useCallback((windowId: string) => dispatch({ type: 'FOCUS_WINDOW', windowId }), [])
  const minimizeWindow = useCallback((windowId: string) => dispatch({ type: 'MINIMIZE_WINDOW', windowId }), [])
  const restoreWindow = useCallback((windowId: string) => dispatch({ type: 'RESTORE_WINDOW', windowId }), [])
  const maximizeWindow = useCallback((windowId: string) => dispatch({ type: 'MAXIMIZE_WINDOW', windowId }), [])
  const normalizeWindow = useCallback((windowId: string) => dispatch({ type: 'NORMALIZE_WINDOW', windowId }), [])
  const setWindowPayload = useCallback(
    (windowId: string, payload: WindowState['payload']) => dispatch({ type: 'SET_WINDOW_PAYLOAD', windowId, payload }),
    [],
  )
  const setWorkspace = useCallback((workspace: WorkspaceId) => {
    dispatch({ type: 'SET_WORKSPACE', workspace })
    const current = window.location.hash.replace(/^#\/?/, '')
    // Don't clobber a sub-route deep link unless it already belongs to a different workspace.
    const owners: Record<WorkspaceId, string[]> = {
      work: ['work', 'portfolio', 'experience', 'contact'],
      lab: ['lab', 'now'],
      knowledge: ['knowledge'],
      system: ['system', 'architecture', 'github', 'settings', 'changelog'],
    }
    const currentOwner = owners[workspace]?.includes(current.split('/')[0]) ? workspace : undefined
    if (!currentOwner) setHash(`#/${workspace}`)
  }, [])
  const setView = useCallback((view: DesktopView) => dispatch({ type: 'SET_VIEW', view }), [])

  const notify = useCallback(
    (n: { title: string; body?: string; kind?: DesktopNotification['kind'] }) => {
      dispatch({
        type: 'ADD_NOTIFICATION',
        notification: {
          id: `notif-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          title: n.title,
          body: n.body,
          kind: n.kind ?? 'info',
          timestamp: Date.now(),
          read: false,
        },
      })
    },
    [],
  )

  const markNotificationsRead = useCallback(() => dispatch({ type: 'MARK_NOTIFICATIONS_READ' }), [])
  const dismissNotification = useCallback((id: string) => dispatch({ type: 'DISMISS_NOTIFICATION', id }), [])
  const setIntegrations = useCallback(
    (integrations: Record<string, IntegrationModel>) => dispatch({ type: 'SET_INTEGRATIONS', integrations }),
    [],
  )

  const search = useCallback((query: string) => searchAll(query.trim()), [])

  const runResult = useCallback(
    (result: RegistryResult) => {
      if (result.action) {
        result.action()
        return
      }
      if (result.kind === 'workspace' && result.workspace) {
        setWorkspace(result.workspace)
        setHash(`#/${result.workspace}`)
        setView({ type: 'desktop', workspace: result.workspace })
        return
      }
      if (result.kind === 'command' && result.id === 'recruiter') {
        setHash('#/recruiter')
        setView({ type: 'recruiter' })
        return
      }
      if (result.kind === 'application' || result.kind === 'command') {
        const appId = result.id as AppId
        openApp(appId, { workspace: result.workspace, payload: result.payload })
        setView({ type: 'desktop', workspace: result.workspace ?? state.activeWorkspace })
        return
      }
      // entity results (project / experience / technology / knowledge / architecture / route)
      if (result.workspace) {
        const appIdForKind = resultAppForKind(result.kind)
        if (appIdForKind) {
          openApp(appIdForKind, { workspace: result.workspace, payload: result.payload })
          setView({ type: 'desktop', workspace: result.workspace })
        }
      }
    },
    [openApp, setWorkspace, setView, state.activeWorkspace],
  )

  const value = useMemo<DesktopContextValue>(
    () => ({
      state,
      openApp,
      closeWindow,
      focusWindow,
      minimizeWindow,
      restoreWindow,
      maximizeWindow,
      normalizeWindow,
      setWindowPayload,
      setWorkspace,
      setView,
      notify,
      markNotificationsRead,
      dismissNotification,
      setIntegrations,
      search,
      runResult,
    }),
    [
      state,
      openApp,
      closeWindow,
      focusWindow,
      minimizeWindow,
      restoreWindow,
      maximizeWindow,
      normalizeWindow,
      setWindowPayload,
      setWorkspace,
      setView,
      notify,
      markNotificationsRead,
      dismissNotification,
      setIntegrations,
      search,
      runResult,
    ],
  )

  // Rebind route→workspace + deep-link app/entity on mount and on hashchange.
  useEffect(() => {
    const routeTargets: Record<string, { appId?: AppId; ws?: WorkspaceId }> = {
      work: { appId: 'projects', ws: 'work' },
      lab: { appId: 'lab', ws: 'lab' },
      knowledge: { appId: 'knowledge', ws: 'knowledge' },
      architecture: { appId: 'architecture', ws: 'system' },
      github: { appId: 'github', ws: 'system' },
      system: { appId: 'system', ws: 'system' },
      experience: { appId: 'experience', ws: 'work' },
      contact: { appId: 'contact', ws: 'work' },
      changelog: { appId: 'changelog', ws: 'system' },
      now: { appId: 'now', ws: 'lab' },
      portfolio: { appId: 'portfolio', ws: 'work' },
      settings: { appId: 'settings', ws: 'system' },
    }

    const sync = () => {
      const hash = window.location.hash.replace(/^#\/?/, '')
      const [first, sub] = hash.split('/')

      // Dashboard lives outside the desktop.
      if (first === 'dashboard') return

      // Recruiter is a desktop preset.
      if (first === 'recruiter') {
        dispatch({ type: 'SET_VIEW', view: { type: 'recruiter' } })
        return
      }

      // Home / empty → boot the default Work desktop with the portfolio window.
      if (!hash || first === 'home') {
        dispatch({ type: 'SET_WORKSPACE', workspace: 'work' })
        dispatch({ type: 'OPEN_APP', appId: 'portfolio', workspace: 'work' })
        dispatch({ type: 'SET_VIEW', view: { type: 'desktop', workspace: 'work' } })
        return
      }

      const target = routeTargets[first]
      const ws = target?.ws
      if (!ws) return

      let payload: WindowState['payload'] = undefined
      if (sub) {
        if (first === 'work' || first === 'lab') payload = { projectId: sub }
        else if (first === 'knowledge') payload = { entityId: sub }
        else if (first === 'architecture') payload = { mapId: sub }
      }

      if (target.appId) {
        dispatch({ type: 'SET_WORKSPACE', workspace: ws })
        dispatch({ type: 'OPEN_APP', appId: target.appId, workspace: ws, payload })
        dispatch({ type: 'SET_VIEW', view: { type: 'desktop', workspace: ws } })
      }
    }

    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  return <DesktopContext.Provider value={value}>{children}</DesktopContext.Provider>
}

function resultAppForKind(kind: RegistryResult['kind']): AppId | null {
  switch (kind) {
    case 'project':
      return 'projects'
    case 'experience':
      return 'experience'
    case 'technology':
    case 'knowledge':
      return 'knowledge'
    case 'architecture':
      return 'architecture'
    case 'route':
      return 'portfolio'
    default:
      return null
  }
}

/** Deep-link hash for an application + payload (shareable URL state). */
function hashForApp(appId: AppId, payload?: WindowState['payload']): string {
  switch (appId) {
    case 'projects':
      return payload?.projectId ? `#/work/${String(payload.projectId).replace(/[^a-z0-9-]/gi, '-')}` : '#/work'
    case 'lab':
      return payload?.projectId ? `#/lab/${String(payload.projectId).replace(/[^a-z0-9-]/gi, '-')}` : '#/lab'
    case 'knowledge':
      return payload?.entityId ? `#/knowledge/${String(payload.entityId).replace(/[^a-z0-9-]/gi, '-').toLowerCase()}` : '#/knowledge'
    case 'architecture':
      return payload?.mapId ? `#/architecture/${String(payload.mapId).replace(/[^a-z0-9-]/gi, '-')}` : '#/architecture'
    case 'github': return '#/github'
    case 'system': return '#/system'
    case 'experience': return '#/experience'
    case 'contact': return '#/contact'
    case 'changelog': return '#/changelog'
    case 'now': return '#/now'
    case 'portfolio': return '#/portfolio'
    case 'settings': return '#/settings'
    case 'recruiter': return '#/recruiter'
    case 'terminal': return '#/terminal'
    default: return '#/'
  }
}

function setHash(hash: string) {
  if (window.location.hash !== hash) {
    // history.replaceState avoids re-triggering hashchange we just caused.
    window.history.replaceState(null, '', hash)
  }
}

/* Keep a reference to ApplicationDef for type convenience elsewhere. */
export type { ApplicationDef }
