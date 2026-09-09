import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { EntityInspector } from '@/components/workspace/EntityInspector'
import type { EntityKind } from '@/lib/relations'

export interface InspectorTarget {
  kind: EntityKind
  id: string
}

type WorkspaceShellValue = {
  openInspector: (kind: EntityKind, id: string) => void
  closeInspector: () => void
}

const WorkspaceShellContext = createContext<WorkspaceShellValue | null>(null)

export function useWorkspaceShell() {
  const ctx = useContext(WorkspaceShellContext)
  if (!ctx) throw new Error('useWorkspaceShell must be used within WorkspaceShell')
  return ctx
}

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<InspectorTarget | null>(null)

  const openInspector = useCallback((kind: EntityKind, id: string) => {
    setTarget({ kind, id })
  }, [])

  const closeInspector = useCallback(() => setTarget(null), [])

  const value = useMemo(
    () => ({ openInspector, closeInspector }),
    [openInspector, closeInspector],
  )

  return (
    <WorkspaceShellContext.Provider value={value}>
      {children}
      <EntityInspector target={target} onClose={closeInspector} />
    </WorkspaceShellContext.Provider>
  )
}