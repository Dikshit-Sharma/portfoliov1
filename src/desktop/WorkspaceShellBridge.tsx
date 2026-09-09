import { createContext, useContext, useMemo } from 'react'
import { useDesktop } from './DesktopContext'
import type { EntityKind } from '@/lib/relations'

/**
 * Legacy WorkspaceShell compatibility bridge.
 *
 * Components that consume `useWorkspaceShell()` (e.g. TechBadge, EntityInspector)
 * get the same API but backed by the desktop context's window inspector.
 */
export interface InspectorTarget {
  kind: EntityKind
  id: string
}

const WorkspaceShellContext = createContext<{
  openInspector: (kind: EntityKind, id: string) => void
  closeInspector: () => void
} | null>(null)

export function useWorkspaceShell() {
  const ctx = useContext(WorkspaceShellContext)
  if (!ctx) throw new Error('useWorkspaceShell must be used within WorkspaceShell')
  return ctx
}

export function WorkspaceShellBridge({ children }: { children: React.ReactNode }) {
  const { openApp, setView, state } = useDesktop()

  const openInspector = (kind: EntityKind, id: string) => {
    const appId = kind === 'project' ? 'projects'
      : kind === 'experience' ? 'experience'
      : kind === 'technology' ? 'knowledge'
      : kind === 'knowledge' ? 'knowledge'
      : kind === 'impact' ? 'knowledge'
      : 'projects'

    const payload = kind === 'technology' ? { entityId: id }
      : kind === 'knowledge' ? { entityId: id }
      : kind === 'project' ? { projectId: id }
      : kind === 'experience' ? { experienceId: id }
      : undefined

    openApp(appId, { payload })
    setView({ type: 'desktop', workspace: state.activeWorkspace })
  }

  const closeInspector = () => {}

  const value = useMemo(() => ({ openInspector, closeInspector }), [openApp, setView, state.activeWorkspace])

  return <WorkspaceShellContext.Provider value={value}>{children}</WorkspaceShellContext.Provider>
}