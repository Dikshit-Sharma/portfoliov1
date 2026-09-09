import { ErrorBoundary } from '@/components/ErrorBoundary'
import { DesktopBackground } from './DesktopBackground'
import { DesktopProvider, useDesktop } from './DesktopContext'
import { DesktopCommandBridge } from './DesktopCommandBridge'
import { WorkspaceShellBridge } from './WorkspaceShellBridge'
import { SystemTopBar } from './SystemTopBar'
import { WorkspaceManager } from './WorkspaceManager'
import { Dock } from './Dock'
import { Launcher } from './Launcher'
import { QuickSettings } from './QuickSettings'
import { NotificationCenter } from './NotificationCenter'
import { useDesktopShortcuts } from './keyboard'
import { RecruiterDesktop } from './RecruiterDesktop'
import type { AppId } from './desktop.types'

function DesktopStage() {
  const { state, openApp, setWorkspace, setView } = useDesktop()

  useDesktopShortcuts({
    setWorkspace,
    openApp: (appId: AppId) => openApp(appId),
    setView,
    getView: () => state.view,
    getWorkspace: () => state.activeWorkspace,
  })

  const inRecruiter = state.view.type === 'recruiter'

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[var(--desktop-bg)]">
      {/* Layer 1: wallpaper */}
      <DesktopBackground />

      {/* Layer 2: global shell (top bar) */}
      <div className="pointer-events-none relative z-30">
        <SystemTopBar />
      </div>

      {/* Layer 3: workspace (desktop content) */}
      <main
        id="main"
        className="relative z-10 min-h-0 flex-1"
        aria-label="Desktop workspace"
      >
        {inRecruiter ? (
          <RecruiterDesktop />
        ) : (
          <WorkspaceManager key={state.activeWorkspace} workspaceId={state.activeWorkspace} />
        )}
      </main>

      {/* Layer 4: dock / system surface */}
      <div className="pointer-events-none relative z-30 flex justify-center pb-2">
        {!inRecruiter && <Dock />}
      </div>

      {/* Layer 5: overlays */}
      {state.view.type === 'launcher' && <Launcher />}
      {state.view.type === 'quicksettings' && <QuickSettings />}
      {state.view.type === 'notifications' && <NotificationCenter />}
    </div>
  )
}

/**
 * DesktopEnvironment — the browser boots into the desktop, not a page.
 */
export function DesktopEnvironment() {
  return (
    <ErrorBoundary label="desktop">
      <DesktopProvider>
        {/* Command bridge maps legacy `useCommand()` consumers to desktop actions. */}
        <DesktopCommandBridge>
          {/* Workspace shell bridge provides `useWorkspaceShell()` for TechBadge/EntityInspector. */}
          <WorkspaceShellBridge>
            <DesktopStage />
          </WorkspaceShellBridge>
        </DesktopCommandBridge>
      </DesktopProvider>
    </ErrorBoundary>
  )
}
