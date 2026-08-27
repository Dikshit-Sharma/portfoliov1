import {
  createContext,
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
import { cn } from '@/lib/utils'

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

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
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
  const { toggleTheme } = useTheme()
  const [overlay, setOverlay] = useState<Overlay>('closed')
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const modKey = useModKey()

  const commands = useMemo<Command[]>(
    () => [
      { id: 'about', label: 'Go to About', group: 'Navigate', hint: 'about', run: () => scrollToId('about') },
      { id: 'skills', label: 'Go to Skills', group: 'Navigate', hint: 'skills', run: () => scrollToId('skills') },
      {
        id: 'experience',
        label: 'Go to Experience',
        group: 'Navigate',
        hint: 'work',
        run: () => scrollToId('experience'),
      },
      {
        id: 'projects',
        label: 'Go to Projects',
        group: 'Navigate',
        hint: 'build',
        run: () => scrollToId('projects'),
      },
      {
        id: 'education',
        label: 'Go to Education',
        group: 'Navigate',
        hint: 'school',
        run: () => scrollToId('education'),
      },
      {
        id: 'contact',
        label: 'Go to Contact',
        group: 'Navigate',
        hint: 'hello',
        run: () => scrollToId('contact'),
      },
      {
        id: 'amli',
        label: 'Open AMLI Tools details',
        group: 'Projects',
        hint: 'amli',
        run: onOpenAmli,
      },
      {
        id: 'amli-live',
        label: 'Open AMLI live app',
        group: 'Projects',
        hint: 'live',
        run: () => window.open(amliLinks.live, '_blank', 'noreferrer'),
      },
      {
        id: 'reposcope',
        label: 'Open RepoScope extension',
        group: 'Projects',
        hint: 'edge',
        run: () => window.open(amliLinks.extension, '_blank', 'noreferrer'),
      },
      {
        id: 'github',
        label: 'Open GitHub',
        group: 'Connect',
        hint: 'gh',
        run: () => window.open(site.github, '_blank', 'noreferrer'),
      },
      {
        id: 'linkedin',
        label: 'Open LinkedIn',
        group: 'Connect',
        hint: 'in',
        run: () => window.open(site.linkedin, '_blank', 'noreferrer'),
      },
      {
        id: 'email',
        label: 'Send Email',
        group: 'Connect',
        hint: 'mail',
        run: () => window.open(`mailto:${site.email}`),
      },
      {
        id: 'resume',
        label: 'Download Resume',
        group: 'Connect',
        hint: 'cv',
        run: () => window.open(site.resumePath, '_blank', 'noreferrer'),
      },
      {
        id: 'theme',
        label: 'Toggle theme',
        group: 'Site',
        hint: 'theme',
        run: toggleTheme,
      },
      {
        id: 'help',
        label: 'Show keyboard shortcuts',
        group: 'Site',
        hint: '?',
        run: () => setOverlay('help'),
      },
    ],
    [onOpenAmli, toggleTheme],
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

  useEffect(() => {
    document.body.style.overflow = overlay === 'closed' ? '' : 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [overlay])

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
            <ul className="scrollbar-thin max-h-80 overflow-y-auto p-2">
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
              </ul>
              <p className="pt-2 text-xs leading-relaxed">
                New here? Press {modKey}+K anytime to jump to a section, open AMLI Tools, or
                download the resume — no hunting through the page.
              </p>
            </div>
          </div>
        </div>
      ) : null}
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
