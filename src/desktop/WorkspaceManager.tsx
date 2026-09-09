import { cn } from '@/lib/utils'
import { useIsMobile } from './responsive'
import type { AppProps, WindowState, WorkspaceId } from './desktop.types'
import { getApplication } from './ApplicationRegistry'
import { useDesktop } from './DesktopContext'
import { WindowChrome } from './Window'

/**
 * WorkspaceManager — renders the windows of a single workspace with
 * Hyprland-inspired tiling.
 *
 * Layout rules (deterministic, web-friendly):
 *   - 0 windows → empty state with hints
 *   - 1 window  → full viewport
 *   - 2 windows → side-by-side split
 *   - 3 windows → large left + two stacked right (or clockwise tiling)
 *   - 4+        → 2×2 grid
 *   - Minimized windows are hidden but retained
 *   - Maximized window fills the workspace viewport (ignores tile)
 *   - Click/tap on empty area focuses nothing (desktop stays)
 */
export function WorkspaceManager({ workspaceId }: { workspaceId: WorkspaceId }) {
  const { state, setWindowPayload, closeWindow, setView } = useDesktop()
  const mobile = useIsMobile()
  const windows = state.workspaces[workspaceId] ?? []

  const visible = windows.filter((w) => w.state !== 'minimized')
  const runnable = visible.filter((w) => w.state !== 'maximized')
  const maximized = visible.find((w) => w.state === 'maximized')

  if (maximized) {
    return (
      <div className="flex h-full w-full p-[var(--window-gap)]">
        <AppWindow window={maximized} setWindowPayload={setWindowPayload} onClose={() => closeWindow(maximized.id)} />
      </div>
    )
  }

  if (visible.length === 0) {
    return (
      <DesktopEmpty
        onLaunch={() => setView({ type: 'launcher' })}
        workspaceId={workspaceId}
      />
    )
  }

  function layoutClass(): string {
    const n = runnable.length
    if (mobile) return 'grid grid-cols-1 grid-rows-1'
    if (n === 1) return 'grid grid-cols-1 grid-rows-1'
    if (n === 2) return 'grid grid-cols-2 grid-rows-1'
    if (n === 3) return 'grid grid-cols-2 grid-rows-2'
    return 'grid grid-cols-2 grid-rows-2'
  }

  // On mobile, only show the focused window (or first) — stack behavior.
  const toRender = mobile ? runnable.slice(0, 1) : runnable

  return (
    <div className="flex h-full w-full">
      <div className={cn('grid h-full w-full gap-[var(--window-gap)] p-[var(--window-gap)]', layoutClass())}>
        {toRender.map((win) => (
          <div key={win.id} className="min-h-0 min-w-0">
            <AppWindow window={win} setWindowPayload={setWindowPayload} onClose={() => closeWindow(win.id)} />
          </div>
        ))}
      </div>
    </div>
  )
}

function AppWindow({
  window,
  setWindowPayload,
  onClose,
}: {
  window: WindowState
  setWindowPayload: (id: string, payload: WindowState['payload']) => void
  onClose: () => void
}) {
  const app = getApplication(window.appId)
  const AppComponent = app.component
  const appProps: AppProps = {
    windowId: window.id,
    payload: window.payload,
    setPayload: (patch) => setWindowPayload(window.id, patch),
    onClose,
  }

  return (
    <WindowChrome windowState={window} className="h-full w-full">
      <AppComponent {...appProps} />
    </WindowChrome>
  )
}

function DesktopEmpty({
  onLaunch,
  workspaceId,
}: {
  onLaunch: () => void
  workspaceId: WorkspaceId
}) {
  const handle = workspaceId === 'work' ? '~/work' : workspaceId === 'lab' ? '~/lab' : workspaceId === 'knowledge' ? '~/knowledge' : '~/system'
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="text-center font-mono text-[var(--text-muted)]">
        <p className="text-sm">{handle}</p>
        <p className="mt-1 text-xs opacity-70">no windows open</p>
        <button
          type="button"
          onClick={onLaunch}
          className="mt-4 rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text)] hover:border-[var(--border-active)] hover:bg-[var(--surface-hover)]"
        >
          Open launcher
        </button>
        <p className="mt-2 text-[10px] opacity-60">
          Super+Space or click the dock to launch an application
        </p>
      </div>
    </div>
  )
}
