import { useEffect, useRef } from 'react'
import type { AppId, WorkspaceId } from './desktop.types'
import type { DesktopView } from './DesktopContext'

/**
 * Desktop keyboard shortcut system — browser-safe.
 *
 *   Super + 1..4     switch workspace
 *   Super + Space    launcher
 *   Super + Enter    terminal
 *   Esc              close overlay
 *
 * "Super" is Win/Cmd. We never hijack standard browser shortcuts
 * (Cmd+T new tab, Cmd+L address bar, etc.). Every shortcut has a
 * visible clickable alternative.
 */
export function useDesktopShortcuts(opts: {
  setWorkspace: (w: WorkspaceId) => void
  openApp: (appId: AppId) => void
  setView: (v: DesktopView) => void
  getView: () => DesktopView
  getWorkspace: () => WorkspaceId
}) {
  const ref = useRef(opts)
  useEffect(() => {
    ref.current = opts
  }, [opts])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      const typing =
        !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)

      // Escape closes any overlay first (before typing logic).
      if (e.key === 'Escape') {
        const v = ref.current.getView()
        if (v.type !== 'desktop') {
          e.preventDefault()
          ref.current.setView({ type: 'desktop', workspace: ref.current.getWorkspace() })
        }
        return
      }

      // Never intercept key combos while the user is typing.
      if (typing) return

      const meta = e.metaKey || e.ctrlKey
      if (meta && !e.shiftKey && !e.altKey) {
        const key = e.key.toLowerCase()
        if (key === ' ') {
          e.preventDefault()
          ref.current.setView({ type: 'launcher' })
          return
        }
        if (['1', '2', '3', '4'].includes(key)) {
          e.preventDefault()
          const ws = (['work', 'lab', 'knowledge', 'system'] as WorkspaceId[])[Number(key) - 1]
          ref.current.setWorkspace(ws)
          ref.current.setView({ type: 'desktop', workspace: ws })
          return
        }
        if (key === 'enter' || key === 't') {
          e.preventDefault()
          ref.current.openApp('terminal')
          ref.current.setView({ type: 'desktop', workspace: 'lab' })
          return
        }
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
