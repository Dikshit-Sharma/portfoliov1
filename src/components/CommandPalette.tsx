import {
  createContext,
  lazy,
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useTheme } from '@/components/ThemeProvider'
import { Kbd } from '@/components/ui/kbd'
import { amliLinks, site } from '@/data/site'
import { projects } from '@/data/projects'
import { registry } from '@/lib/registry'
import { navigate, navigateDashboard } from '@/lib/router'
import { cn } from '@/lib/utils'

const Terminal = lazy(() => import('@/components/Terminal').then((m) => ({ default: m.Terminal })))

type Overlay = 'closed' | 'palette' | 'help'

type Command = {
  id: string
  label: string
  group: string
  hint: string
  run: () => void
}

type CommandContextValue = {
  openPalette: () => void
  openHelp: () => void
  modKey: string
  openTerminal: () => void
}

const CommandContext = createContext<CommandContextValue | null>(null)

export function useCommand() {
  const ctx = useContext(CommandContext)
  if (!ctx) throw new Error('useCommand must be used within CommandProvider')
  return ctx
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

function useModKey() {
  const [modKey, setModKey] = useState('Ctrl')
  useEffect(() => {
    setModKey(/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl')
  }, [])
  return modKey
}

export function CommandProvider({
  children,
  onOpenAmli,
}: {
  children: ReactNode
  onOpenAmli: () => void
}) {
  const { setTheme } = useTheme()
  const [overlay, setOverlay] = useState<Overlay>('closed')
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)
  const modKey = useModKey()
  const [terminalOpen, setTerminalOpen] = useState(false)

  const commands = useMemo<Command[]>(
    () => [
      { id: 'ws-work', label: 'Workspace 1: Work', group: 'Workspaces', hint: 'projects', run: () => navigate('work') },
      { id: 'ws-lab', label: 'Workspace 2: Lab', group: 'Workspaces', hint: 'experiments', run: () => navigate('lab') },
      { id: 'ws-knowledge', label: 'Workspace 3: Knowledge', group: 'Workspaces', hint: 'notes', run: () => navigate('knowledge') },
      { id: 'ws-system', label: 'Workspace 4: System', group: 'Workspaces', hint: 'architecture', run: () => navigate('system') },
      { id: 'work', label: 'Go to Work', group: 'Navigate', hint: 'G P', run: () => navigate('work') },
      { id: 'lab', label: 'Go to Lab', group: 'Navigate', hint: 'G L', run: () => navigate('lab') },
      { id: 'experience', label: 'Go to Experience', group: 'Navigate', hint: 'G E', run: () => navigate('experience') },
      { id: 'knowledge', label: 'Go to Knowledge', group: 'Navigate', hint: 'G K', run: () => navigate('knowledge') },
      { id: 'system', label: 'Go to System', group: 'Navigate', hint: 'G S', run: () => navigate('system') },
      { id: 'now', label: 'Go to Now', group: 'Navigate', hint: 'G N', run: () => navigate('now') },
      { id: 'contact', label: 'Go to Contact', group: 'Navigate', hint: 'G C', run: () => navigate('contact') },
      { id: 'recruiter', label: 'Open Recruiter Mode', group: 'Navigate', hint: 'recruiter', run: () => navigate('recruiter') },
      { id: 'dashboard', label: 'Open Dashboard', group: 'Navigate', hint: 'G D', run: () => navigateDashboard('overview') },
      { id: 'changelog', label: 'View Changelog', group: 'Navigate', hint: 'changelog', run: () => navigate('changelog') },
      { id: 'amli', label: 'Open AMLI Tools details', group: 'Projects', hint: 'amli', run: onOpenAmli },
      { id: 'amli-live', label: 'Open AMLI live app', group: 'Projects', hint: 'live', run: () => window.open(amliLinks.live, '_blank', 'noreferrer') },
      { id: 'reposcope', label: 'Open RepoScope extension', group: 'Projects', hint: 'edge', run: () => window.open(amliLinks.extension, '_blank', 'noreferrer') },
      ...projects.map((project): Command => ({
        id: `project-${project.id}`,
        label: `Open project: ${project.name}`,
        group: 'Deep Dive',
        hint: project.kicker,
        run: () => navigate('work', project.id),
      })),
      ...registry
        .filter((entity) => entity.type === 'experience')
        .map((entity): Command => ({
          id: entity.id,
          label: entity.label,
          group: 'Experience',
          hint: 'role',
          run: () => navigate('experience'),
        })),
      ...registry
        .filter((entity) => entity.type === 'technology')
        .map((entity): Command => ({
          id: entity.id,
          label: `Technology: ${entity.label}`,
          group: 'Technologies',
          hint: 'tech',
          run: () => {
            window.location.hash = entity.path
          },
        })),
      { id: 'terminal', label: 'Open Terminal', group: 'Actions', hint: 'T', run: () => setTerminalOpen(true) },
      { id: 'github', label: 'Open GitHub', group: 'Connect', hint: 'gh', run: () => window.open(site.github, '_blank', 'noreferrer') },
      { id: 'linkedin', label: 'Open LinkedIn', group: 'Connect', hint: 'in', run: () => window.open(site.linkedin, '_blank', 'noreferrer') },
      { id: 'email', label: 'Send Email', group: 'Connect', hint: 'mail', run: () => window.open(`mailto:${site.email}`) },
      { id: 'resume', label: 'Download Resume', group: 'Connect', hint: 'cv', run: () => window.open(site.resumePath, '_blank', 'noreferrer') },
      { id: 'theme-dark', label: 'Theme: Dark', group: 'Theme', hint: 'theme dark', run: () => setTheme('dark') },
      { id: 'theme-light', label: 'Theme: Light', group: 'Theme', hint: 'theme light', run: () => setTheme('light') },
      { id: 'theme-system', label: 'Theme: System', group: 'Theme', hint: 'theme system', run: () => setTheme('system') },
      { id: 'recruiter-mode', label: 'Recruiter Mode', group: 'Site', hint: 'recruiter', run: () => navigate('recruiter') },
      { id: 'help', label: 'Show keyboard shortcuts', group: 'Site', hint: '?', run: () => setOverlay('help') },
    ],
    [onOpenAmli, setTheme],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter(
      (command) =>
        command.label.toLowerCase().includes(q) ||
        command.group.toLowerCase().includes(q) ||
        command.hint.toLowerCase().includes(q),
    )
  }, [commands, query])

  const grouped = useMemo(() => {
    const map = new Map<string, Command[]>()
    for (const command of filtered) {
      const list = map.get(command.group) ?? []
      list.push(command)
      map.set(command.group, list)
    }
    return [...map.entries()]
  }, [filtered])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOverlay((current) => (current === 'palette' ? 'closed' : 'palette'))
        return
      }
      if (event.key === 'Escape') {
        setOverlay('closed')
        setTerminalOpen(false)
        return
      }
      if (event.key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        if (isTypingTarget(event.target)) return
        event.preventDefault()
        setOverlay((current) => (current === 'help' ? 'closed' : 'help'))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Global shortcuts: ? help, T terminal, R resume, G <key> navigation leader
  useEffect(() => {
    let pendingG = false
    let gTimer: number | undefined

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return
      if (event.ctrlKey || event.metaKey || event.altKey) return

      const key = event.key.toLowerCase()

      // T — open terminal
      if (key === 't') {
        event.preventDefault()
        setTerminalOpen(true)
        return
      }
      // R — open resume
      if (key === 'r') {
        event.preventDefault()
        window.open(site.resumePath, '_blank', 'noreferrer')
        return
      }
      // G — arm the navigation leader (press G then P / E / L / N / K / D / C)
      if (key === 'g') {
        event.preventDefault()
        pendingG = true
        gTimer = window.setTimeout(() => {
          pendingG = false
        }, 1600)
        return
      }
      if (pendingG) {
        pendingG = false
        if (gTimer) window.clearTimeout(gTimer)
        const destinations: Record<string, () => void> = {
          p: () => navigate('work'),
          e: () => navigate('experience'),
          l: () => navigate('lab'),
          n: () => navigate('now'),
          k: () => navigate('knowledge'),
          s: () => navigate('system'),
          d: () => navigateDashboard('overview'),
          c: () => navigate('contact'),
        }
        const handler = destinations[key]
        if (handler) {
          event.preventDefault()
          handler()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      if (gTimer) window.clearTimeout(gTimer)
    }
  }, [])

  useEffect(() => {
    if (overlay === 'palette') {
      setQuery('')
      setActive(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [overlay])

  useEffect(() => {
    setActive(0)
  }, [query])

  // Keep the active command visible while navigating with arrow keys.
  useEffect(() => {
    if (overlay !== 'palette') return
    const el = activeRef.current
    const scroller = listRef.current
    if (!el || !scroller) return
    const scrollerRect = scroller.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    if (elRect.top < scrollerRect.top) {
      scroller.scrollTop += elRect.top - scrollerRect.top
    } else if (elRect.bottom > scrollerRect.bottom) {
      scroller.scrollTop += elRect.bottom - scrollerRect.bottom
    }
  }, [active, query, overlay])

  useEffect(() => {
    document.body.style.overflow = overlay === 'closed' && !terminalOpen ? '' : 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [overlay, terminalOpen])

  const run = (command: Command) => {
    const stayOpen = command.id === 'help'
    if (!stayOpen) setOverlay('closed')
    command.run()
  }

  const value = useMemo(
    () => ({
      openPalette: () => setOverlay('palette'),
      openHelp: () => setOverlay('help'),
      modKey,
      openTerminal: () => setTerminalOpen(true),
    }),
    [modKey],
  )

  return (
    <CommandContext.Provider value={value}>
      {children}
      {overlay === 'palette' ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/55 px-4 pt-[12vh] backdrop-blur-[2px]"
          onClick={() => setOverlay('closed')}
        >
          <div
            role="dialog"
            aria-label="Command palette"
            className="w-full max-w-xl overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] font-mono shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-3 py-2">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" aria-hidden="true" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" aria-hidden="true" />
              <span className="size-2.5 rounded-full bg-[#28c840]" aria-hidden="true" />
              <p className="ml-2 text-[11px] text-[var(--color-fg-muted)]">dikshit@dev — command</p>
            </div>
            <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-3 py-2">
              <span className="text-indigo-400">$</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault()
                    setActive((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)))
                  }
                  if (event.key === 'ArrowUp') {
                    event.preventDefault()
                    setActive((i) => Math.max(i - 1, 0))
                  }
                  if (event.key === 'Enter' && filtered[active]) run(filtered[active])
                }}
                placeholder="type a command…"
                className="h-9 w-full bg-transparent text-sm outline-none"
                aria-label="Filter commands"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <ul ref={listRef} className="scrollbar-thin max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <li className="px-3 py-6 text-sm text-[var(--color-fg-muted)]">
                  command not found: {query}
                </li>
              ) : (
                grouped.map(([group, items]) => (
                  <li key={group} className="mb-2">
                    <p className="px-2 py-1 text-[10px] tracking-[0.16em] text-indigo-400 uppercase">
                      {group}
                    </p>
                    <ul>
                      {items.map((command) => {
                        const index = filtered.indexOf(command)
                        return (
                          <li key={command.id}>
                            <button
                              type="button"
                              ref={index === active ? activeRef : undefined}
                              onMouseEnter={() => setActive(index)}
                              onClick={() => run(command)}
                              className={cn(
                                'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm',
                                index === active && 'bg-indigo-500/15 text-[var(--color-fg)]',
                              )}
                            >
                              <span>{command.label}</span>
                              <span className="text-[10px] text-[var(--color-fg-muted)]">
                                {command.hint}
                              </span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </li>
                ))
              )}
            </ul>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--color-border)] px-3 py-2 text-[10px] text-[var(--color-fg-muted)]">
              <span>
                <Kbd>↑</Kbd> <Kbd>↓</Kbd> move
              </span>
              <span>
                <Kbd>↵</Kbd> run
              </span>
              <span>
                <Kbd>esc</Kbd> close
              </span>
              <span>
                <Kbd>?</Kbd> shortcuts
              </span>
            </p>
          </div>
        </div>
      ) : null}
      {overlay === 'help' ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/55 px-4 pt-[12vh] backdrop-blur-[2px]"
          onClick={() => setOverlay('closed')}
        >
          <div
            role="dialog"
            aria-labelledby="shortcut-help-title"
            className="w-full max-w-md overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] font-mono shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-3 py-2">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" aria-hidden="true" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" aria-hidden="true" />
              <span className="size-2.5 rounded-full bg-[#28c840]" aria-hidden="true" />
              <p id="shortcut-help-title" className="ml-2 text-[11px] text-[var(--color-fg-muted)]">
                man shortcuts
              </p>
            </div>
            <div className="space-y-3 p-5 text-sm">
              <p className="text-indigo-400">$ help</p>
              <ul className="space-y-2 text-[var(--color-fg-muted)]">
                <li className="flex items-center justify-between gap-4">
                  <span>Open command palette</span>
                  <span className="flex gap-1">
                    <Kbd>{modKey}</Kbd>
                    <Kbd>K</Kbd>
                  </span>
                </li>
                <li className="flex items-center justify-between gap-4">
                  <span>Show this help</span>
                  <Kbd>?</Kbd>
                </li>
                <li className="flex items-center justify-between gap-4">
                  <span>Close overlay</span>
                  <Kbd>esc</Kbd>
                </li>
                <li className="flex items-center justify-between gap-4">
                  <span>Open Terminal</span>
                  <Kbd>T</Kbd>
                </li>
                <li className="flex items-center justify-between gap-4">
                  <span>Projects (Work)</span>
                  <span className="flex gap-1">
                    <Kbd>G</Kbd>
                    <Kbd>P</Kbd>
                  </span>
                </li>
                <li className="flex items-center justify-between gap-4">
                  <span>Experience</span>
                  <span className="flex gap-1">
                    <Kbd>G</Kbd>
                    <Kbd>E</Kbd>
                  </span>
                </li>
                <li className="flex items-center justify-between gap-4">
                  <span>Lab</span>
                  <span className="flex gap-1">
                    <Kbd>G</Kbd>
                    <Kbd>L</Kbd>
                  </span>
                </li>
                <li className="flex items-center justify-between gap-4">
                  <span>Knowledge</span>
                  <span className="flex gap-1">
                    <Kbd>G</Kbd>
                    <Kbd>K</Kbd>
                  </span>
                </li>
                <li className="flex items-center justify-between gap-4">
                  <span>System</span>
                  <span className="flex gap-1">
                    <Kbd>G</Kbd>
                    <Kbd>S</Kbd>
                  </span>
                </li>
                <li className="flex items-center justify-between gap-4">
                  <span>Now</span>
                  <span className="flex gap-1">
                    <Kbd>G</Kbd>
                    <Kbd>N</Kbd>
                  </span>
                </li>
                <li className="flex items-center justify-between gap-4">
                  <span>Dashboard</span>
                  <span className="flex gap-1">
                    <Kbd>G</Kbd>
                    <Kbd>D</Kbd>
                  </span>
                </li>
                <li className="flex items-center justify-between gap-4">
                  <span>Contact</span>
                  <span className="flex gap-1">
                    <Kbd>G</Kbd>
                    <Kbd>C</Kbd>
                  </span>
                </li>
                <li className="flex items-center justify-between gap-4">
                  <span>Download Resume</span>
                  <Kbd>R</Kbd>
                </li>
              </ul>
              <p className="pt-2 text-xs leading-relaxed">
                New here? Press {modKey}+K anytime to jump to a section, open AMLI Tools, or
                download the resume — no hunting through the page.
              </p>
            </div>
          </div>
        </div>
      ) : null}
      {terminalOpen && (
        <Suspense fallback={null}>
          <Terminal onClose={() => setTerminalOpen(false)} />
        </Suspense>
      )}
      <ShortcutHint />
    </CommandContext.Provider>
  )
}

function ShortcutHint() {
  const { openPalette, modKey } = useCommand()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem('hint-ctrlk') === 'dismissed') return
    } catch {
      /* ignore */
    }
    const timer = window.setTimeout(() => setVisible(true), 900)
    return () => window.clearTimeout(timer)
  }, [])

  if (!visible) return null

  const dismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem('hint-ctrlk', 'dismissed')
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="fixed right-4 bottom-4 z-40 max-w-[min(100%-2rem,20rem)] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3 shadow-xl sm:right-6 sm:bottom-6">
      <p className="font-mono text-xs leading-relaxed text-[var(--color-fg-muted)]">
        Keyboard first.{' '}
        <button
          type="button"
          onClick={() => {
            dismiss()
            openPalette()
          }}
          className="text-[var(--color-fg)] underline-offset-2 hover:underline"
        >
          Press {modKey}+K
        </button>{' '}
        for the command palette, or <Kbd>?</Kbd> for shortcuts.
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="mt-2 font-mono text-[10px] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
      >
        dismiss
      </button>
    </div>
  )
}