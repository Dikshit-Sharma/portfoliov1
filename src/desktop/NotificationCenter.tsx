import { useDesktop } from './DesktopContext'
import { cn } from '@/lib/utils'

/** Notification center — only shows real application events. */
export function NotificationCenter() {
  const { state, setView, dismissNotification } = useDesktop()

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 px-4 pt-[calc(var(--bar-height)+0.5rem)] backdrop-blur-[1px]"
      onClick={() => setView({ type: 'desktop', workspace: state.activeWorkspace })}
      role="dialog"
      aria-label="Notifications"
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <p className="font-mono text-xs text-[var(--text)]">notifications</p>
          <button
            type="button"
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
            onClick={() => setView({ type: 'desktop', workspace: state.activeWorkspace })}
          >
            esc
          </button>
        </div>

        <div className="scrollbar-thin max-h-[70vh] overflow-y-auto p-2">
          {state.notifications.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-[var(--text-muted)]">
              no notifications
            </p>
          ) : (
            state.notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  'flex items-start justify-between gap-3 rounded-lg border border-[var(--border)] px-3 py-3',
                  !n.read && 'border-[var(--border-active)] bg-[var(--accent-muted)]/5',
                )}
              >
                <div>
                  <p className="text-sm text-[var(--text)]">{n.title}</p>
                  {n.body && <p className="mt-0.5 text-xs text-[var(--text-muted)]">{n.body}</p>}
                  <p className="mt-1 font-mono text-[10px] text-[var(--text-muted)]">
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => dismissNotification(n.id)}
                  aria-label="Dismiss"
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                  x
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
