import { useEffect, useState } from 'react'
import { Menu, Sun, Moon, Monitor, X } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { useDesktop } from './DesktopContext'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'
import { displayHandle } from '@/lib/workspaces'
import { cn } from '@/lib/utils'
import { STATUS_SYMBOL } from './desktop.types'
import { getLatestVersion } from '@/data/changelog'
import { site } from '@/data/site'

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])
  return now
}

function formatClock(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(date: Date) {
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

const themeIcons = {
  dark: <Sun className="size-4" />,
  light: <Moon className="size-4" />,
  system: <Monitor className="size-4" />,
}

/**
 * Global system top bar — Waybar-inspired.
 *
 * Left:  identity | workspace switcher
 * Center: (extended workspace context / active app title — desktop only)
 * Right: integrations | theme | clock | launcher / settings / notifications
 */
export function SystemTopBar() {
  const { state, setView, setWorkspace, openApp } = useDesktop()
  const { theme } = useTheme()
  const now = useClock()
  const [mobileMenu, setMobileMenu] = useState(false)

  // Lock body scroll when mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = mobileMenu ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenu])

  const integrations = [
    { id: 'github', status: state.integrations.github?.status ?? 'UNAVAILABLE' },
    { id: 'knowledge', status: state.integrations.knowledge?.status ?? 'UNAVAILABLE' },
  ] as const

  return (
    <>
      <header
        className="pointer-events-auto sticky top-0 z-40 flex h-[var(--bar-height)] w-full items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)]/90 px-2 font-mono text-[12px] backdrop-blur-[var(--blur)] sm:px-3"
        role="banner"
      >
        {/* Identity */}
        <button
          type="button"
          onClick={() => {
            setWorkspace('work')
            setView({ type: 'desktop', workspace: 'work' })
          }}
          className="flex items-center gap-2 px-2 py-1 font-semibold tracking-tight text-[var(--text)] hover:text-[var(--accent)]"
          aria-label="Home — workspace 1"
        >
          <span className="grid size-5 place-items-center rounded-sm bg-[var(--accent)] text-[10px] font-bold text-black">
            D
          </span>
          <span className="hidden sm:inline">{displayHandle}</span>
        </button>

        <span className="mx-1 h-4 w-px bg-[var(--border)]" aria-hidden="true" />

        <WorkspaceSwitcher />

        <div className="flex-1" />

        {/* Status context */}
        {state.view.type === 'desktop' && (
          <span className="hidden text-[11px] text-[var(--text-muted)] lg:inline">
            workspace {state.activeWorkspace}
          </span>
        )}

        {/* Integration indicators (truthful, real state) */}
        <div className="hidden items-center gap-3 md:flex" aria-label="Integration status">
          {integrations.map(({ id, status }) => {
            const isOnline = status === 'ONLINE'
            const isCached = status === 'CACHED'
            return (
              <span
                key={id}
                className={cn(
                  'text-[10px] tracking-wide',
                  isOnline && 'text-emerald-400',
                  isCached && 'text-amber-400',
                  status === 'ERROR' && 'text-red-400',
                  status === 'LOCKED' && 'text-[var(--accent)]',
                  status === 'UNAVAILABLE' && 'text-zinc-500',
                )}
                title={`${id}: ${status}`}
              >
                {id} {STATUS_SYMBOL[status as keyof typeof STATUS_SYMBOL] ?? '—'}
              </span>
            )
          })}
        </div>

        <span className="mx-1 hidden h-4 w-px bg-[var(--border)] sm:block" aria-hidden="true" />

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          {/* Launcher trigger */}
          <button
            type="button"
            onClick={() => setView({ type: 'launcher' })}
            className="grid h-7 w-7 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
            aria-label="Open launcher"
          >
            <span className="text-sm">⌕</span>
          </button>

          {/* Quick settings */}
          <button
            type="button"
            onClick={() => setView({ type: 'quicksettings' })}
            className="grid h-7 w-7 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
            aria-label="Quick settings"
          >
            {themeIcons[theme]}
          </button>

          {/* External links */}
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            className="grid h-7 w-7 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
            aria-label="GitHub"
          >
            <span className="text-xs font-semibold">gh</span>
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noreferrer"
            className="grid h-7 w-7 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
            aria-label="LinkedIn"
          >
            <span className="text-xs font-semibold">in</span>
          </a>

          {/* Mobile menu */}
          <button
            type="button"
            onClick={() => setMobileMenu(true)}
            className="grid h-7 w-7 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-hover)] lg:hidden"
            aria-label="Open mobile menu"
          >
            <Menu className="size-4" />
          </button>
        </div>

        <span className="mx-1 hidden h-4 w-px bg-[var(--border)] sm:block" aria-hidden="true" />

        {/* Clock */}
        <div className="hidden items-center gap-2 text-[11px] text-[var(--text-muted)] sm:flex">
          <span className="hidden md:inline">v{getLatestVersion().replace('v', '')}</span>
          <span className="hidden md:inline">{formatDate(now)}</span>
          <span className="font-medium text-[var(--text)] tabular-nums">{formatClock(now)}</span>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenu && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[var(--bg)] lg:hidden">
          <div className="flex h-[var(--bar-height)] items-center justify-between border-b border-[var(--border)] px-3">
            <span className="font-mono text-sm font-semibold">{displayHandle}</span>
            <button
              type="button"
              onClick={() => setMobileMenu(false)}
              className="grid size-8 place-items-center rounded-md text-[var(--text-muted)] hover:text-[var(--text)]"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <p className="mb-3 font-mono text-[10px] tracking-[0.16em] text-[var(--text-muted)] uppercase">
              Workspaces
            </p>
            {(['work', 'lab', 'knowledge', 'system'] as const).map((ws) => (
              <button
                key={ws}
                type="button"
                onClick={() => {
                  setMobileMenu(false)
                  setWorkspace(ws)
                  setView({ type: 'desktop', workspace: ws })
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm',
                  state.activeWorkspace === ws && 'bg-[var(--accent-muted)]/15 text-[var(--text)]',
                )}
              >
                <span className="font-mono text-[11px] text-[var(--text-muted)]">
                  {ws === 'work' ? '1' : ws === 'lab' ? '2' : ws === 'knowledge' ? '3' : '4'}
                </span>
                <span className="flex-1">{ws.charAt(0).toUpperCase() + ws.slice(1)}</span>
              </button>
            ))}

            <p className="mb-3 mt-6 font-mono text-[10px] tracking-[0.16em] text-[var(--text-muted)] uppercase">
              Apps
            </p>
            {['portfolio', 'projects', 'lab', 'terminal', 'knowledge', 'architecture', 'github', 'system', 'contact', 'changelog'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setMobileMenu(false)
                  openApp(id as never)
                  setView({ type: 'desktop', workspace: state.activeWorkspace })
                }}
                className="flex w-full rounded-md px-3 py-3 text-left text-sm hover:bg-[var(--surface-hover)]"
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}

            <div className="grid grid-cols-2 gap-2 pt-6">
              <button
                type="button"
                onClick={() => { setMobileMenu(false); setView({ type: 'launcher' }) }}
                className="rounded-md border border-[var(--border)] px-3 py-2 text-center font-mono text-xs hover:bg-[var(--surface-hover)]"
              >
                Launcher
              </button>
              <button
                type="button"
                onClick={() => { setMobileMenu(false); setView({ type: 'quicksettings' }) }}
                className="rounded-md border border-[var(--border)] px-3 py-2 text-center font-mono text-xs hover:bg-[var(--surface-hover)]"
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
