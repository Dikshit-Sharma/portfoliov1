import { ExternalLink, GitBranch, Star, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Card, Stat, BarChart, LineChart, ContributionHeatmap } from '@/dashboard/components/charts'
import { Button, buttonClass } from '@/components/ui/button'

interface GithubData {
  profile: {
    name: string
    login: string
    avatarUrl: string
    bio: string
    company: string
    location: string
    websiteUrl: string
  }
  repos: {
    name: string
    description: string
    url: string
    language: string
    languageColor: string
    stars: number
    forks: number
    pushedAt: string
    createdAt: string
  }[]
  contributions: {
    total: number
    weeks: { date: string; count: number; level: number }[][]
    days: { date: string; count: number; level: number }[]
  }
  asOf: string
  note?: string
}

export function GithubSection() {
  const [data, setData] = useState<GithubData | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/github')
      if (!res.ok) throw new Error(`GitHub endpoint error (${res.status})`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json)
    } catch (e) {
      // Local dev fallback: call the public GitHub API directly.
      try {
        const fallback = await loadPublicGithub()
        setData(fallback)
      } catch {
        setLoadError(e instanceof Error ? e.message : 'Failed to load GitHub data')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return <p className="py-16 text-center text-sm text-[var(--color-fg-muted)]">Loading GitHub activity…</p>
  }

  if (loadError || !data) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8 text-center">
        <p className="text-sm text-[var(--color-fg-muted)]">{loadError || 'No data'}</p>
        <p className="mt-2 text-xs text-[var(--color-fg-muted)]">
          Add a <code className="font-mono">GITHUB_TOKEN</code> Netlify env var and redeploy. The profile will still load
          without it in unauthenticated mode.
        </p>
        <Button className="mt-4" variant="outline" size="sm" onClick={load}>Retry</Button>
      </div>
    )
  }

  const { profile, repos, contributions } = data

  // Activity timeline from commit/push dates (approximated via days for demo fallback).
  const last180 = contributions.days || []
  const byMonth = last180
    .filter((d) => d.date)
    .slice(-182)
    .reduce<Record<string, number>>((acc, d) => {
      const m = d.date.slice(0, 7)
      acc[m] = (acc[m] || 0) + d.count
      return acc
    }, {})
  const monthly = Object.entries(byMonth).map(([label, value]) => ({ label, value }))

  const langCounts: Record<string, number> = {}
  repos.forEach((r) => {
    langCounts[r.language] = (langCounts[r.language] || 0) + 1
  })
  const topLangs = Object.entries(langCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
        {profile.avatarUrl && (
          <img src={profile.avatarUrl} alt={profile.name} className="size-14 rounded-full border border-[var(--color-border)]" />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold">{profile.name || profile.login}</h3>
          {profile.bio && <p className="mt-0.5 text-sm text-[var(--color-fg-muted)]">{profile.bio}</p>}
          {(profile.location || profile.company) && (
            <p className="mt-1 flex flex-wrap gap-2 text-xs text-[var(--color-fg-muted)]">
              {profile.location && <span>{profile.location}</span>}
              {profile.company && <span>at {profile.company}</span>}
            </p>
          )}
        </div>
        <a
          href={`https://github.com/${profile.login}`}
          target="_blank"
          rel="noreferrer"
          className={buttonClass({ variant: 'outline', size: 'sm' })}
        >
          <ExternalLink className="size-3.5" /> View GitHub
        </a>
      </div>

      {data.note && (
        <p className="rounded-lg bg-[var(--color-bg-muted)] p-3 text-xs text-amber-400">{data.note}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Contributions" value={contributions.total.toLocaleString()} sub="last ~6 months" />
        <Stat label="Public repos" value={repos.length} />
        <Stat
          label="Stars"
          value={repos.reduce((s, r) => s + r.stars, 0)}
        />
        <Stat label="Forks" value={repos.reduce((s, r) => s + r.forks, 0)} />
      </div>

      <Card title="Contribution heatmap">
        <ContributionHeatmap weeks={contributions.weeks} />
      </Card>

      {monthly.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Monthly activity">
            <LineChart data={monthly} />
          </Card>
          <Card title="Top languages">
            <BarChart data={topLangs.map(([label, value]) => ({ label, value }))} color="var(--color-accent-2)" />
          </Card>
        </div>
      )}

      <Card title="Repositories">
        {repos.length === 0 ? (
          <p className="text-sm text-[var(--color-fg-muted)]">Repository list unavailable in unauthenticated mode.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {repos.map((r) => (
              <li key={r.name}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4 transition-colors hover:border-indigo-400/50"
                >
                  <div className="flex items-center gap-2">
                    <GitBranch className="size-4 shrink-0 text-[var(--color-fg-muted)]" />
                    <span className="truncate font-medium text-[var(--color-fg)]">{r.name}</span>
                  </div>
                  {r.description && (
                    <p className="mt-2 line-clamp-2 text-xs text-[var(--color-fg-muted)]">{r.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-[var(--color-fg-muted)]">
                    <span className="flex items-center gap-1">
                      <span className="size-2 rounded-full" style={{ background: r.languageColor }} />
                      {r.language}
                    </span>
                    <span className="flex items-center gap-1"><Star className="size-3" />{r.stars}</span>
                    <span className="flex items-center gap-1"><Users className="size-3" />{r.forks}</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {data.asOf && (
        <p className="text-right font-mono text-[11px] text-[var(--color-fg-muted)]">
          Last refreshed {new Date(data.asOf).toLocaleString()}
        </p>
      )}
    </div>
  )
}

// Fallback for local dev / no-Netlify environments: fetch directly from api.github.com.
async function loadPublicGithub(): Promise<GithubData> {
  const login = 'Dikshit-Sharma'
  const [profileRes, reposRes, eventsRes] = await Promise.all([
    fetch(`https://api.github.com/users/${login}`, { headers: { Accept: 'application/vnd.github+json' } }),
    fetch(`https://api.github.com/users/${login}/repos?per_page=100&sort=updated`, { headers: { Accept: 'application/vnd.github+json' } }),
    fetch(`https://api.github.com/users/${login}/events/public?per_page=100`, { headers: { Accept: 'application/vnd.github+json' } }),
  ])
  const [profile, repos, events] = await Promise.all([profileRes.json(), reposRes.json(), eventsRes.json()])
  const byDate: Record<string, number> = {}
  ;(events || []).forEach((ev: { created_at?: string }) => {
    const date = (ev.created_at || '').slice(0, 10)
    if (date) byDate[date] = (byDate[date] || 0) + 1
  })
  const days = Object.entries(byDate).map(([date, count]) => ({ date, count, level: 0 }))
  const last180 = days.slice(-182)
  return {
    profile: {
      name: profile.name || login,
      login: profile.login || login,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      company: profile.company,
      location: profile.location,
      websiteUrl: profile.blog,
    },
    repos: (repos || []).map((r: { name: string; description: string; html_url: string; language: string; stargazers_count: number; forks_count: number; pushed_at: string; created_at: string; fork: boolean }) => ({
      name: r.name,
      description: r.description,
      url: r.html_url,
      language: r.language || 'Unknown',
      languageColor: '#8b949e',
      stars: r.stargazers_count,
      forks: r.forks_count,
      pushedAt: r.pushed_at,
      createdAt: r.created_at,
    })),
    contributions: {
      total: last180.reduce((s, d) => s + d.count, 0),
      weeks: [],
      days: last180,
    },
    asOf: new Date().toISOString(),
    note: 'Local mode — contribution heatmap needs the Netlify + GITHUB_TOKEN setup.',
  }
}
