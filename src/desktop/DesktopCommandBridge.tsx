import { useContext, useMemo, useState, useEffect } from 'react'
import { CommandContext } from '@/components/CommandPalette'
import { useDesktop } from './DesktopContext'

/**
 * Desktop command bridge.
 *
 * Components that were written for the legacy CommandProvider (e.g. the
 * Terminal) consume `useCommand()`; this provides the same context shape
 * backed by the desktop environment's launcher and terminal application,
 * and installs NO conflicting global shortcut / overlay behavior.
 */
export function DesktopCommandBridge({ children }: { children: React.ReactNode }) {
  const { setView, openApp } = useDesktop()
  const [modKey, setModKey] = useState('Ctrl')

  useEffect(() => {
    setModKey(/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl')
  }, [])

  const value = useMemo(
    () => ({
      openPalette: () => setView({ type: 'launcher' }),
      openHelp: () => setView({ type: 'launcher' }),
      modKey,
      openTerminal: () => openApp('terminal'),
    }),
    [modKey, openApp, setView],
  )

  return <CommandContext.Provider value={value}>{children}</CommandContext.Provider>
}

/** Re-export the hook for tree-shaking convenience (matches old import path). */
export function useDesktopCommand() {
  const ctx = useContext(CommandContext)
  return ctx
}