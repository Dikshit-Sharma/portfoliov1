import { lazy } from 'react'
import type { AppProps } from '../desktop.types'

const LazyTerminal = lazy(() => import('@/components/Terminal').then((m) => ({ default: m.Terminal })))

/**
 * Terminal application — the interactive developer shell as a window.
 * The terminal is embedded (fills the window) and has its own exit affordance.
 */
export default function TerminalApp({ onClose }: AppProps) {
  return (
    <div className="flex h-full flex-col">
      <LazyTerminal onClose={() => onClose?.()} embedded />
    </div>
  )
}