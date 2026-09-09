import { useTheme } from '@/components/ThemeProvider'
import { useDesktop } from '../DesktopContext'
import { SectionHeading } from '@/components/SectionHeading'
import { STATUS_SYMBOL } from '../desktop.types'
import { cn } from '@/lib/utils'

/**
 * Settings application — theme, workspace, shortcuts, privacy.
 * No fake hardware controls; only real environment state.
 */
export default function SettingsApp() {
  const { state, setView } = useDesktop()
  const { theme, setTheme } = useTheme()

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <SectionHeading
        kicker="system / settings"
        title="Settings"
        description="Theme, workspace behavior and shortcuts for this environment."
      />

      {/* Theme */}
      <section className="mb-8">
        <p className="mb-2 font-mono text-[10px] tracking-[0.16em] text-[var(--text-muted)] uppercase">
          Appearance
        </p>
        <div className="grid grid-cols-3 gap-1">
          {(['dark', 'light', 'system'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className={cn(
                'rounded-lg border px-3 py-2.5 text-sm text-left transition-colors',
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

      {/* Integration states — real */}
      <section className="mb-8">
        <p className="mb-2 font-mono text-[10px] tracking-[0.16em] text-[var(--text-muted)] uppercase">
          Integrations
        </p>
        <div className="space-y-2 rounded-xl border border-[var(--border)] p-4">
          {['github', 'knowledge', 'dashboard'].map((id) => {
            const model = state.integrations[id as keyof typeof state.integrations]
            return (
              <div key={id} className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-muted)] capitalize">{id}</span>
                <span className="font-mono text-[11px]">
                  {model ? (
                    <span className={cn(
                      model.status === 'ONLINE' && 'text-emerald-400',
                      model.status === 'CACHED' && 'text-amber-400',
                      model.status === 'LOCKED' && 'text-[var(--accent)]',
                      model.status === 'ERROR' && 'text-red-400',
                      model.status === 'UNAVAILABLE' && 'text-zinc-500',
                    )}>
                      {STATUS_SYMBOL[model.status]} {model.status}
                    </span>
                  ) : (
                    <span className="text-zinc-500">— UNAVAILABLE</span>
                  )}
                </span>
              </div>
            )
          })}
          <p className="border-t border-[var(--border)] pt-2 text-[11px] text-[var(--text-muted)]">
            Status reflects real wiring — never fabricated metrics.
          </p>
        </div>
      </section>

      {/* Shortcuts */}
      <section className="mb-8">
        <p className="mb-2 font-mono text-[10px] tracking-[0.16em] text-[var(--text-muted)] uppercase">
          Keyboard Shortcuts
        </p>
        <div className="rounded-xl border border-[var(--border)] p-4 font-mono text-[12px]">
          <Shortcut keys="Super / Ctrl + 1..4" label="Switch workspace" />
          <Shortcut keys="Super / Ctrl + Space" label="Open launcher" />
          <Shortcut keys="Super / Ctrl + Enter" label="Open terminal" />
          <Shortcut keys="Esc" label="Close overlay" />
          <p className="mt-3 border-t border-[var(--border)] pt-2 text-[11px] text-[var(--text-muted)]">
            Every shortcut has a visible clickable alternative.
          </p>
        </div>
      </section>

      {/* Privacy */}
      <section>
        <p className="mb-2 font-mono text-[10px] tracking-[0.16em] text-[var(--text-muted)] uppercase">
          Privacy
        </p>
        <div className="rounded-xl border border-[var(--border)] p-4 text-sm text-[var(--text-muted)]">
          <p>
            The dashboard, journal, AMLI data, and private Obsidian notes stay behind
            authentication and encryption. Only explicitly public content is served.
          </p>
          <button
            type="button"
            onClick={() => setView({ type: 'launcher' })}
            className="mt-3 font-mono text-xs text-[var(--accent)] hover:underline"
          >
            open launcher →
          </button>
        </div>
      </section>
    </div>
  )
}

function Shortcut({ keys, label }: { keys: string; label: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="text-[var(--text)]">{keys}</span>
    </div>
  )
}