import { useEffect, useState } from 'react'

export type DashboardTab =
  | 'overview'
  | 'github'
  | 'journal'
  | 'obsidian'
  | 'knowledge'
  | 'activity'
  | 'lab'
  | 'amli'
  | 'settings'

const TABS: DashboardTab[] = ['overview', 'github', 'journal', 'obsidian', 'knowledge', 'activity', 'lab', 'amli', 'settings']

function parseHash(): DashboardTab {
  const raw = window.location.hash.replace(/^#\/?/, '')
  const parts = raw.split('/')
  // Support both "#/dashboard/<tab>" and bare "#/<tab>".
  const tabName = parts[0] === 'dashboard' ? parts[1] || 'overview' : parts[0] || 'overview'
  const [first] = tabName.split('?')
  return (TABS as string[]).includes(first) ? (first as DashboardTab) : 'overview'
}

export function useHashTab() {
  const [tab, setTab] = useState<DashboardTab>(() => parseHash())

  useEffect(() => {
    const onChange = () => {
      setTab(parseHash())
      // Reset scroll to top when switching tabs.
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return tab
}

export function navigate(tab: DashboardTab) {
  window.location.hash = tab === 'overview' ? '#/dashboard' : `#/dashboard/${tab}`
}

/** True when the current route lives inside the dashboard. */
export function isDashboardRoute() {
  return window.location.hash.startsWith('#/dashboard')
}
