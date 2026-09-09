import { cn } from '@/lib/utils'
import { workspaceForRoute } from '@/lib/workspaces'
import type { PageRoute } from '@/lib/router'
import { projects } from '@/data/projects'
import { labProjects } from '@/data/lab'
import { experience } from '@/data/experience'
import { obsidianCategories, obsidianTotalNotes, obsidianGeneratedAt } from '@/data/obsidian.generated'
import { getLatestVersion } from '@/data/changelog'
import { useState } from 'react'

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime()
  const minutes = Math.max(0, Math.round((Date.now() - then) / 60000))
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 48) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

type StatusItem = {
  label: string
  symbol: string
  tone: 'ok' | 'stale' | 'off' | 'accent'
  detail?: string
}

function workspaceStatus(route: PageRoute): StatusItem[] {
  switch (route) {
    case 'work':
      return [
        { label: 'PROJECTS', symbol: '●', tone: 'ok', detail: `${projects.length} total` },
        { label: 'EXPERIENCE', symbol: '●', tone: 'ok', detail: `${experience.length} roles` },
        { label: 'VERSION', symbol: '●', tone: 'accent', detail: getLatestVersion() },
      ]
    case 'lab':
      return [
        { label: 'EXPERIMENTS', symbol: '●', tone: 'ok', detail: `${labProjects.length} active` },
        { label: 'STATUS', symbol: '●', tone: 'accent', detail: 'experiments' },
      ]
    case 'knowledge':
      return [
        {
          label: 'PUBLIC NOTES',
          symbol: '●',
          tone: 'ok',
          detail: `${obsidianTotalNotes} across ${obsidianCategories.length} categories`,
        },
        {
          label: 'PUBLISHED',
          symbol: '◐',
          tone: 'stale',
          detail: `snapshot ${timeAgo(obsidianGeneratedAt)}`,
        },
      ]
    case 'system':
      return [
        { label: 'SHELL', symbol: '●', tone: 'accent', detail: 'Portfolio OS' },
        { label: 'GRAPH', symbol: '●', tone: 'ok', detail: 'ready' },
        { label: 'CHANGELOG', symbol: '●', tone: 'accent', detail: getLatestVersion() },
      ]
    default:
      return [
        { label: 'SHELL', symbol: '●', tone: 'accent', detail: 'Portfolio OS' },
        { label: 'VERSION', symbol: '●', tone: 'accent', detail: getLatestVersion() },
      ]
  }
}

export function StatusBar({ route }: { route: PageRoute }) {
  const [visible] = useState(true)
  const ws = workspaceForRoute(route)
  const items = workspaceStatus(route)

  if (!visible) return null

  return (
    <footer
      className="border-t border-[var(--color-border)] bg-[var(--color-bg)]"
      aria-label="Workspace status"
    >
      <div className="mx-auto flex h-8 max-w-[1400px] items-center gap-4 overflow-x-auto px-2 font-mono text-[11px] text-[var(--color-fg-muted)] sm:px-3">
        {/* Workspace marker */}
        <span className="shrink-0 text-[var(--color-fg)]">
          {ws ? (
            <>
              workspace {ws.number} <span className="text-[var(--color-accent)]">/</span> {ws.label.toLowerCase()}
            </>
          ) : (
            'workspace / shell'
          )}
        </span>
        <span className="hidden h-3 w-px bg-[var(--color-border)] sm:block" aria-hidden="true" />

        {/* Contextual status */}
        {items.map((item, i) => (
          <span key={item.label} className={cn('flex shrink-0 items-center gap-1.5', i > 0 && '')}>
            <span
              className={cn(
                'text-[10px]',
                item.tone === 'ok' && 'text-emerald-400',
                item.tone === 'stale' && 'text-amber-400',
                item.tone === 'off' && 'text-zinc-500',
                item.tone === 'accent' && 'text-[var(--color-accent)]',
              )}
              aria-hidden="true"
            >
              {item.symbol}
            </span>
            <span className="tracking-wide uppercase">{item.label}</span>
            <span className="text-[var(--color-fg-muted)]">{item.detail}</span>
          </span>
        ))}

        <div className="flex-1" />

        <span className="hidden shrink-0 md:inline">Theme: personal · Shell: zsh-inspired</span>
      </div>
    </footer>
  )
}