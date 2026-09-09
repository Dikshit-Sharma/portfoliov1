import { LayoutDashboard, Menu, Monitor, Moon, Sun, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCommand } from '@/components/CommandPalette'
import { GitHubIcon, LinkedInIcon } from '@/components/icons'
import { buttonClass } from '@/components/ui/button'
import { useTheme } from '@/components/ThemeProvider'
import { WORKSPACES, displayHandle, workspaceForRoute } from '@/lib/workspaces'
import { navigate, navigateDashboard, type PageRoute } from '@/lib/router'
import { getLatestVersion } from '@/data/changelog'
import { cn } from '@/lib/utils'

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000)
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

export function TopBar({ route }: { route: PageRoute }) {
  const { openPalette, modKey } = useCommand()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const now = useClock()
  const activeWorkspace = workspaceForRoute(route)

  const themeIcons = { dark: <Sun className="size-4" />, light: <Moon className="size-4" />, system: <Monitor className="size-4" /> }

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-11 max-w-[1400px] items-center gap-1 px-2 sm:px-3 font-mono text-[12px]">
          {/* Identity */}
          <button
            type="button"
            onClick={() => navigate('home')}
            className="flex items-center gap-2 px-2 py-1 font-semibold tracking-tight text-[var(--color-fg)] hover:text-[var(--color-accent)]"
            aria-label="Home"
          >
            <span className="grid size-5 place-items-center rounded-sm bg-[var(--color-accent)] text-[10px] font-bold text-black">
              D
            </span>
            <span className="hidden sm:inline">{displayHandle}</span>
          </button>

          <span className="mx-1 h-4 w-px bg-[var(--color-border)]" aria-hidden="true" />

          {/* Workspace switcher */}
          <nav aria-label="Workspaces" className="flex items-center gap-0.5">
            {WORKSPACES.map((ws) => {
              const active = ws.route === route
              return (
                <button
                  key={ws.route}
                  type="button"
                  onClick={() => { setMenuOpen(false); navigate(ws.route) }}
                  className={cn(
                    'flex items-center gap-1.5 rounded-sm px-2 py-1 transition-colors hover:text-[var(--color-fg)]',
                    active
                      ? 'bg-[var(--color-accent)]/15 text-[var(--color-fg)]'
                      : 'text-[var(--color-fg-muted)]',
                  )}
                  aria-current={active ? 'page' : undefined}
                  aria-label={`Workspace ${ws.number}: ${ws.label}`}
                  title={`Workspace ${ws.number}: ${ws.label}`}
                >
                  <span className="hidden text-[10px] text-[var(--color-fg-muted)] md:inline">
                    {ws.number}
                  </span>
                  <span className={cn('hidden sm:inline', active && 'text-[var(--color-fg)]')}>
                    {ws.label}
                  </span>
                  <span className="sm:hidden">{ws.label.charAt(0)}</span>
                </button>
              )
            })}
          </nav>

          <div className="flex-1" />

          {/* Context / status */}
          {activeWorkspace && (
            <span className="hidden text-[11px] text-[var(--color-fg-muted)] lg:inline">
              workspace {activeWorkspace.number} · {activeWorkspace.context}
            </span>
          )}

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={openPalette}
              className={cn(
                buttonClass({ variant: 'outline', size: 'sm' }),
                'hidden md:inline-flex items-center gap-1.5 font-mono text-[11px]',
              )}
              aria-keyshortcuts="Control+K Meta+K"
              aria-label={`Open command palette, ${modKey}+K`}
            >
              Commands
              <span className="text-[10px] text-[var(--color-fg-muted)]">Ctrl+K</span>
            </button>
            <a
              href="https://github.com/Dikshit-Sharma"
              target="_blank"
              rel="noreferrer"
              className={buttonClass({ variant: 'ghost', size: 'icon' })}
              aria-label="GitHub"
            >
              <GitHubIcon className="size-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/dikshit-sharma-9aba6a252"
              target="_blank"
              rel="noreferrer"
              className={buttonClass({ variant: 'ghost', size: 'icon' })}
              aria-label="LinkedIn"
            >
              <LinkedInIcon className="size-4" />
            </a>
            <button
              type="button"
              onClick={toggleTheme}
              className={buttonClass({ variant: 'ghost', size: 'icon' })}
              aria-label="Toggle theme"
            >
              {themeIcons[theme]}
            </button>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                navigateDashboard('overview')
              }}
              className={cn(
                buttonClass({ variant: 'ghost', size: 'icon' }),
                'hidden sm:inline-flex',
              )}
              aria-label="Dashboard"
            >
              <LayoutDashboard className="size-4" />
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className={cn(buttonClass({ variant: 'ghost', size: 'icon' }), 'lg:hidden')}
              aria-label="Open menu"
            >
              <Menu className="size-4" />
            </button>
          </div>

          <span className="mx-1 h-4 w-px bg-[var(--color-border)]" aria-hidden="true" />

          {/* Clock / version */}
          <div className="hidden items-center gap-2 text-[11px] text-[var(--color-fg-muted)] sm:flex">
            <span className="hidden md:inline">v{getLatestVersion().replace('v', '')}</span>
            <span className="hidden md:inline">{formatDate(now)}</span>
            <span className="font-medium text-[var(--color-fg)] tabular-nums">{formatClock(now)}</span>
          </div>
        </div>
      </header>

      {/* Mobile menu sheet */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[var(--color-bg)] lg:hidden">
          <div className="flex h-11 items-center justify-between border-b border-[var(--color-border)] px-3">
            <span className="font-mono text-sm font-semibold">{displayHandle}</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className={buttonClass({ variant: 'ghost', size: 'icon' })}
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <p className="px-5 pt-4 font-mono text-[10px] tracking-[0.16em] text-[var(--color-fg-muted)] uppercase">
              Workspaces
            </p>
            <ul className="px-3 py-2">
              {WORKSPACES.map((ws) => (
                <li key={ws.route}>
                  <button
                    type="button"
                    onClick={() => navigate(ws.route)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm',
                      ws.route === route && 'bg-[var(--color-accent)]/15 text-[var(--color-fg)]',
                    )}
                  >
                    <span className="font-mono text-[11px] text-[var(--color-fg-muted)]">{ws.number}</span>
                    <span className="flex-1">{ws.label}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="px-5 pt-4 font-mono text-[10px] tracking-[0.16em] text-[var(--color-fg-muted)] uppercase">
              Pages
            </p>
            <ul className="px-3 py-2 text-sm">
              {(
                [
                  { label: 'Now', route: 'now' },
                  { label: 'Experience', route: 'experience' },
                  { label: 'Recruiter Mode', route: 'recruiter' },
                  { label: 'Contact', route: 'contact' },
                  { label: 'Changelog', route: 'changelog' },
                ] as const
              ).map((p) => (
                <li key={p.route}>
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); navigate(p.route) }}
                    className="flex w-full rounded-md px-3 py-3 text-left hover:bg-[var(--color-bg-muted)]"
                  >
                    {p.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-[var(--color-border)] p-4">
            <button
              type="button"
              onClick={openPalette}
              className={cn(buttonClass({ variant: 'outline' }), 'font-mono')}
            >
              Commands
            </button>
            <button
              type="button"
              onClick={() => navigateDashboard('overview')}
              className={cn(buttonClass({ variant: 'outline' }), 'font-mono')}
            >
              <LayoutDashboard className="size-4" /> Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  )
}