import { useTheme } from '@/components/ThemeProvider'
import { useDesktop } from './DesktopContext'
import { STATUS_SYMBOL } from './desktop.types'
import { cn } from '@/lib/utils'

/**
 * Quick settings overlay — theme, accent, motion, workspace, and REAL
 * integration states. No fake hardware controls.
 */
export function QuickSettings() {
  const { state, setView } = useDesktop()
  const { theme, setTheme, resolvedTheme } = useTheme()

  const integrations = ['github', 'knowledge', 'dashboard'] as const

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 px-4 pt-[calc(var(--bar-height)+0.5rem)] backdrop-blur-[1px]"
      onClick={() => setView({ type: 'desktop', workspace: state.activeWorkspace })}
      role="dialog"
      aria-label="Quick settings"
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <p className="font-mono text-xs text-[var(--text)]">quick settings</p>
          <button
            type="button"
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
            onClick={() => setView({ type: 'desktop', workspace: state.activeWorkspace })}
          >
            esc
          </button>
        </div>

        <div className="space-y-5 p-4">
          {/* Theme */}
          <section>
            <p className="mb-2 font-mono text-[10px] tracking-[0.16em] text-[var(--text-muted)] uppercase">
              Theme
            </p>
            <div className="grid grid-cols-3 gap-1">
              {(['dark', 'light', 'system'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-xs transition-colors',
                    theme === t
                      ? 'border-[var(--border-active)] bg-[var(--accent-muted)]/15 text-[var(--text)]'
                      : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-hover)]',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>

          {/* Integrations — truthful state */}
          <section>
            <p className="mb-2 font-mono text-[10px] tracking-[0.16em] text-[var(--text-muted)] uppercase">
              Integrations
            </p>
            <ul className="space-y-2">
              {integrations.map((id) => {
                const model = state.integrations[id]
                return (
                  <li key={id} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-muted)] capitalize">{id}</span>
                    {model ? (
                      <span
                        className={cn(
                          'flex items-center gap-1.5 font-mono text-[11px]',
                          model.status === 'ONLINE' && 'text-emerald-400',
                          model.status === 'CACHED' && 'text-amber-400',
                          model.status === 'LOCKED' && 'text-[var(--accent)]',
                          model.status === 'ERROR' && 'text-red-400',
                          model.status === 'UNAVAILABLE' && 'text-zinc-500',
                        )}
                      >
                        {STATUS_SYMBOL[model.status]} {model.status}
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-[var(--text-muted)]">—</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>

          {/* About */}
          <p className="border-t border-[var(--border)] pt-3 text-[11px] text-[var(--text-muted)]">
            Dikshit OS · {resolvedTheme} mode · status reflects real wiring
          </p>
        </div>
      </div>
    </div>
  )
}
