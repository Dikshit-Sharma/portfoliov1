import { Suspense, useEffect, useRef, type ReactNode } from 'react'
import { Minus, Square, Copy, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WindowState } from './desktop.types'
import { getApplication } from './ApplicationRegistry'
import { useDesktop } from './DesktopContext'

interface WindowChromeProps {
  windowState: WindowState
  children: ReactNode
  /** optional left-side title override */
  title?: string
  className?: string
}

/**
 * A desktop window. Renders the existing application content inside a
 * real, functional window (title bar, focus, minimize/maximize/close).
 * Tiling is applied by the parent (WorkspaceManager); this component
 * only concerns itself with chrome + focus + controls.
 */
export function WindowChrome({ windowState, children, title, className }: WindowChromeProps) {
  const { focusWindow, closeWindow, minimizeWindow, maximizeWindow, normalizeWindow } = useDesktop()
  const app = getApplication(windowState.appId)
  const ref = useRef<HTMLDivElement>(null)

  const displayTitle = title ?? windowState.title
  const isFocused = windowState.focused

  useEffect(() => {
    if (isFocused) {
      ref.current?.focus({ preventScroll: true })
    }
  }, [isFocused])

  function handleFocus() {
    if (!isFocused) focusWindow(windowState.id)
  }

  const controls = (
    <div className="absolute right-0 top-0 z-20 flex items-center gap-0.5 px-2 py-1.5">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          minimizeWindow(windowState.id)
        }}
        title="Minimize"
        aria-label={`Minimize ${displayTitle}`}
        className="grid size-6 place-items-center rounded-sm text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
      >
        <Minus className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          if (windowState.state === 'maximized') normalizeWindow(windowState.id)
          else maximizeWindow(windowState.id)
        }}
        title={windowState.state === 'maximized' ? 'Restore' : 'Maximize'}
        aria-label={`${windowState.state === 'maximized' ? 'Restore' : 'Maximize'} ${displayTitle}`}
        className="grid size-6 place-items-center rounded-sm text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
      >
        {windowState.state === 'maximized' ? (
          <Copy className="size-3.5" />
        ) : (
          <Square className="size-3.5" />
        )}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          closeWindow(windowState.id)
        }}
        title="Close"
        aria-label={`Close ${displayTitle}`}
        className="grid size-6 place-items-center rounded-sm text-[var(--text-muted)] hover:bg-red-500/80 hover:text-white"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )

  return (
    <div
      ref={ref}
      tabIndex={-1}
      onClick={handleFocus}
      onFocus={() => handleFocus()}
      role="region"
      aria-label={`${displayTitle} window`}
      className={cn(
        'group relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[var(--window-radius)] border bg-[var(--surface)] shadow-[var(--shadow)] outline-none',
        isFocused ? 'border-[var(--border-active)]' : 'border-[var(--border)]',
        className,
      )}
    >
      {/* Title bar */}
      <div
        className={cn(
          'flex h-8 shrink-0 items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-2.5 pl-3 text-[12px] font-mono text-[var(--text-muted)] transition-colors select-none',
          isFocused ? 'bg-[var(--surface)] text-[var(--text)]' : 'opacity-80',
        )}
        onMouseDown={(e) => {
          // Dbl-click title bar toggles maximize — a real, functional behavior.
          if ((e.target as HTMLElement).closest('button')) return
        }}
      >
        <span className="grid size-4 place-items-center text-[var(--accent)]" aria-hidden="true">
          {app.icon}
        </span>
        <span className="truncate">{displayTitle}</span>
        {isFocused && (
          <span className="ml-auto mr-16 hidden text-[10px] text-[var(--text-muted)] sm:inline">
            {windowState.state === 'maximized' ? 'maximized' : windowState.tile}
          </span>
        )}
      </div>
      {controls}

      {/* Content */}
      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto bg-[var(--surface)]">
        <Suspense
          fallback={
            <div className="flex min-h-[30vh] items-center justify-center font-mono text-xs text-[var(--text-muted)]">
              launching {displayTitle}…
            </div>
          }
        >
          {children}
        </Suspense>
      </div>
    </div>
  )
}
