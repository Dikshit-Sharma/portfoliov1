import { lazy, Suspense, useEffect, useState } from 'react'
import { ThemeProvider } from '@/components/ThemeProvider'
import { DesktopEnvironment } from '@/desktop/DesktopEnvironment'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { usePageMeta } from '@/lib/seo'
import { useHashRoute, isDashboardRoute } from '@/lib/router'

// Heavy subsystem — loads only when the private route is visited.
const Dashboard = lazy(() => import('@/dashboard/Dashboard').then((m) => ({ default: m.Dashboard })))

function useOnDashboard() {
  const [isDashboard, setIsDashboard] = useState(() => isDashboardRoute())
  useEffect(() => {
    const onChange = () => setIsDashboard(isDashboardRoute())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return isDashboard
}

function PageLoader({ label }: { label: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="font-mono text-xs text-[var(--color-fg-muted)]">loading {label}…</p>
    </div>
  )
}

/**
 * Root application.
 *
 * The browser boots into the desktop environment:
 *
 *   DesktopEnvironment
 *     ├── wallpaper / background
 *     ├── global top bar (workspaces, tray, clock)
 *     ├── workspace manager (windows/tiling)
 *     └── dock / launcher / quick settings / notifications
 *
 * The dashboard (private control center) is the only non-desktop route
 * and is gated + lazy-loaded.
 */
export default function App() {
  const isDashboard = useOnDashboard()
  const { route, subRoute } = useHashRoute()
  usePageMeta(route, subRoute)

  if (isDashboard) {
    return (
      <ThemeProvider>
        <ErrorBoundary label="dashboard">
          <Suspense fallback={<PageLoader label="control center" />}>
            <Dashboard />
          </Suspense>
        </ErrorBoundary>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <DesktopEnvironment />
    </ThemeProvider>
  )
}