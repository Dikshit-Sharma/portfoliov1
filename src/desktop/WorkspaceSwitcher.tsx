import { useDesktop } from './DesktopContext'
import { WORKSPACE_DEFS } from './ApplicationRegistry'
import { cn } from '@/lib/utils'

/** Hyprland-style workspace switcher — shown in the top bar. */
export function WorkspaceSwitcher({ className }: { className?: string }) {
  const { state, setWorkspace, setView } = useDesktop()
  return (
    <nav aria-label="Workspaces" className={cn('flex items-center gap-0.5', className)}>
      {WORKSPACE_DEFS.map((ws) => {
        const active = state.activeWorkspace === ws.id
        const windowCount = state.workspaces[ws.id]?.length ?? 0
        return (
          <button
            key={ws.id}
            type="button"
            onClick={() => {
              setWorkspace(ws.id)
              setView({ type: 'desktop', workspace: ws.id })
            }}
            title={`Workspace ${ws.number}: ${ws.name}`}
            aria-label={`Workspace ${ws.number}: ${ws.name}`}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex h-6 items-center gap-1.5 rounded-sm px-2 font-mono text-[11px] transition-colors',
              active
                ? 'bg-[var(--accent-muted)]/15 text-[var(--text)]'
                : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]',
            )}
          >
            <span className="text-[10px] text-[var(--accent)]">{ws.number}</span>
            <span className="hidden sm:inline">{ws.name}</span>
            {windowCount > 0 && (
              <span className="grid size-3.5 place-items-center rounded-full bg-[var(--accent)]/20 text-[9px]">
                {windowCount}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
