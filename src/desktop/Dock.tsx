import { useDesktop } from './DesktopContext'
import { APPLICATION_IDS } from './ApplicationRegistry'
import { cn } from '@/lib/utils'

/**
 * Application dock — shows the running applications of the active
 * workspace plus a launcher + notification triggers. Also shows running
 * apps from other workspaces if they are focused (kept minimal).
 */
export function Dock() {
  const { state, openApp, setView, markNotificationsRead } = useDesktop()
  const activeWs = state.activeWorkspace
  const running = state.workspaces[activeWs] ?? []

  const unread = state.notifications.filter((n) => !n.read).length

  return (
    <div
      role="toolbar"
      aria-label="Application dock"
      className="pointer-events-auto flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)]/90 px-2 py-1.5 shadow-[var(--shadow)] backdrop-blur-[var(--blur)]"
    >
      {APPLICATION_IDS.filter((id) => ['portfolio', 'projects', 'lab', 'terminal', 'knowledge', 'architecture', 'github', 'system'].includes(id)).map((id) => {
        const win = running.find((w) => w.appId === id)
        const isFocused = win?.focused
        return (
          <button
            key={id}
            type="button"
            title={id === 'portfolio' ? 'Portfolio' : id.charAt(0).toUpperCase() + id.slice(1)}
            aria-label={`Open ${id}`}
            aria-pressed={!!isFocused}
            onClick={() => {
              if (win && !win.focused) {
                // already running — focus it
                openApp(id)
              } else {
                openApp(id)
              }
            }}
            className={cn(
              'relative grid size-9 place-items-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text)]',
              isFocused && 'bg-[var(--accent-muted)]/15 text-[var(--accent)]',
            )}
          >
            {/* app icon glyph */}
            <AppGlyph id={id} />
            {/* running indicator */}
            {win && (
              <span
                className={cn(
                  'absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full',
                  isFocused ? 'bg-[var(--accent)]' : 'bg-[var(--text-muted)]',
                )}
                aria-hidden="true"
              />
            )}
          </button>
        )
      })}

      <span className="mx-1 h-5 w-px bg-[var(--border)]" aria-hidden="true" />

      {/* Launcher */}
      <button
        type="button"
        title="Launch applications"
        aria-label="Open launcher"
        onClick={() => setView({ type: 'launcher' })}
        className="grid size-9 place-items-center rounded-lg font-mono text-sm text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
      >
        <span className="text-[var(--accent)]">⌕</span>
      </button>

      {/* Notifications */}
      <button
        type="button"
        title="Notifications"
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
        onClick={() => {
          markNotificationsRead()
          setView({ type: 'notifications' })
        }}
        className="relative grid size-9 place-items-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
      >
        <span aria-hidden="true">🔔</span>
        {unread > 0 && (
          <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-[var(--accent)] text-[9px] font-bold text-black">
            {unread}
          </span>
        )}
      </button>
    </div>
  )
}

function AppGlyph({ id }: { id: string }) {
  // Small deterministic monogram glyphs — no heavy icon deps.
  const glyph: Record<string, string> = {
    portfolio: 'P',
    projects: 'W',
    lab: 'L',
    terminal: '›_',
    knowledge: 'K',
    architecture: '◇',
    github: 'gh',
    system: '⌂',
  }
  return <span className="text-sm font-mono">{glyph[id] ?? id.charAt(0).toUpperCase()}</span>
}
