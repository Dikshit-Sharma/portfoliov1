import { useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { Kbd } from '@/components/ui/kbd'
import { useDesktop } from './DesktopContext'
import { categorizeResults } from './Registry'
import { cn } from '@/lib/utils'

/** Global application launcher — evolved from the command palette. */
export function Launcher() {
  const { state, search, runResult, setView } = useDesktop()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  const results = useMemo(() => search(query), [query, search])
  const grouped = useMemo(() => categorizeResults(results), [results])
  const flat = useMemo(() => grouped.flatMap((g) => g.results), [grouped])

  useEffect(() => {
    setActive(0)
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  useEffect(() => {
    setActive(0)
  }, [query])

  useEffect(() => {
    const el = activeRef.current
    const scroller = listRef.current
    if (!el || !scroller) return
    const sTop = scroller.getBoundingClientRect().top
    const sBottom = scroller.getBoundingClientRect().bottom
    const eTop = el.getBoundingClientRect().top
    const eBottom = el.getBoundingClientRect().bottom
    if (eTop < sTop) scroller.scrollTop += eTop - sTop
    else if (eBottom > sBottom) scroller.scrollTop += eBottom - sBottom
  }, [active])

  function choose(result: (typeof flat)[number]) {
    runResult(result)
    setView({ type: 'desktop', workspace: state.activeWorkspace })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/55 px-4 pt-[10vh] backdrop-blur-[2px]"
      onClick={() => setView({ type: 'desktop', workspace: state.activeWorkspace })}
      role="dialog"
      aria-label="Application launcher"
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
          <Search className="size-4 text-[var(--accent)]" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActive((a) => Math.min(a + 1, Math.max(flat.length - 1, 0)))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActive((a) => Math.max(a - 1, 0))
              } else if (e.key === 'Enter' && flat[active]) {
                choose(flat[active])
              } else if (e.key === 'Escape') {
                setView({ type: 'desktop', workspace: state.activeWorkspace })
              }
            }}
            placeholder="Search applications, projects, commands, knowledge…"
            aria-label="Search"
            className="h-9 flex-1 bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
            autoComplete="off"
            spellCheck={false}
          />
          <span className="hidden text-xs text-[var(--text-muted)] sm:inline">esc</span>
        </div>

        {/* Results */}
        <div ref={listRef} className="scrollbar-thin max-h-[60vh] overflow-y-auto p-2">
          {flat.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-[var(--text-muted)]">
              no results for <span className="text-[var(--text)]">{query}</span>
            </p>
          ) : (
            grouped.map((group) => (
              <section key={group.category} className="mb-2">
                <p className="px-2 py-1 font-mono text-[10px] tracking-[0.16em] text-[var(--accent)] uppercase">
                  {group.category}
                </p>
                <div className="grid gap-0.5">
                  {group.results.map((result) => {
                    const index = flat.indexOf(result)
                    const isActive = index === active
                    return (
                      <button
                        key={`${group.category}-${result.id}-${index}`}
                        ref={isActive ? activeRef : undefined}
                        type="button"
                        onMouseEnter={() => setActive(index)}
                        onClick={() => choose(result)}
                        className={cn(
                          'flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm',
                          isActive && 'bg-[var(--accent-muted)]/15 text-[var(--text)]',
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block truncate">{result.label}</span>
                          {result.description && (
                            <span className="block truncate text-xs text-[var(--text-muted)]">
                              {result.description}
                            </span>
                          )}
                        </span>
                        {result.hint && (
                          <span className="shrink-0 font-mono text-[10px] text-[var(--text-muted)]">
                            {result.hint}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </section>
            ))
          )}
        </div>

        {/* Footer */}
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--border)] px-4 py-2 text-[10px] text-[var(--text-muted)]">
          <span><Kbd>↑</Kbd> <Kbd>↓</Kbd> navigate</span>
          <span><Kbd>↵</Kbd> open</span>
          <span><Kbd>esc</Kbd> close</span>
          <span className="ml-auto">search applications · commands · entities</span>
        </p>
      </div>
    </div>
  )
}
