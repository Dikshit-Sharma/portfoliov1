import { RefreshCw, ShieldAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PasswordGate } from '@/dashboard/components/PasswordGate'
import { Card, Stat, BarChart, LineChart } from '@/dashboard/components/charts'
import { Button } from '@/components/ui/button'

interface AmliStats {
  total: number
  envCounts: Record<string, number>
  activity: { date: string; count: number }[]
  velocity: { month: string; env: string; count: number }[]
  topApis: { apiName: string; env: string; count: number }[]
  recent: { id: string; apiName: string; jiraTicket: string; env: string; timestamp: string }[]
  bsaCount: number
  credCountTotal?: number
  sampledAt?: string
  error?: string
}

export function AmliSection() {
  const [data, setData] = useState<AmliStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load(force = false) {
    setLoading(true)
    setError(null)
    try {
      const qs = force ? '?sync=1' : ''
      const res = await fetch(`/api/amli${qs}`)
      const json = await res.json().catch(() => null)
      if (!res.ok || !json || json.error) throw new Error(json?.error || `Error ${res.status}`)
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load AMLI data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function syncNow() {
    setSyncing(true)
    try {
      await load(true)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Public header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <ShieldAlert className="size-4 text-indigo-400" /> AMLI Vault — System Overview
            </h3>
            <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
              Aggregate graphs of the AMLI Enc/Dec system are public. Company details (recent artifacts, top APIs) are
              password protected below.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={syncNow} disabled={syncing}>
            <RefreshCw className={`size-3.5 ${syncing ? 'animate-spin' : ''}`} /> {syncing ? 'Syncing…' : 'Update now'}
          </Button>
        </div>
        {data?.sampledAt && (
          <p className="mt-2 font-mono text-[11px] text-[var(--color-fg-muted)]">
            Last sampled {new Date(data.sampledAt).toLocaleString()} · refreshes automatically every morning
          </p>
        )}
      </div>

      {loading && <p className="py-16 text-center text-sm text-[var(--color-fg-muted)]">Loading AMLI data…</p>}

      {error && !data && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8 text-center">
          <p className="text-sm text-red-400">{error}</p>
          <p className="mt-2 text-xs text-[var(--color-fg-muted)]">
            Configure <code className="font-mono">AMLI_ARTIFACTS_URL</code> / <code className="font-mono">AMLI_BSA_URL</code> /{' '}
            <code className="font-mono">AMLI_CREDENTIALS_URL</code> in Netlify, then redeploy.
          </p>
          <Button className="mt-4" variant="outline" size="sm" onClick={() => load()}>Retry</Button>
        </div>
      )}

      {data && !error && (
        <>
          {/* Public aggregate graphs */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="API artifacts" value={data.total.toLocaleString()} />
            <Stat label="BSA entries" value={data.bsaCount || 0} />
            <Stat label="Credentials" value={data.credCountTotal ?? 0} />
            <Stat
              label="Environments"
              value={Object.keys(data.envCounts || {}).length}
              sub={Object.entries(data.envCounts || {}).map(([k, v]) => `${k}: ${v}`).join(' · ')}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Activity by day">
              {(data.activity || []).length === 0
                ? <EmptyChart />
                : <LineChart data={(data.activity || []).map((a) => ({ label: a.date.slice(5), value: a.count }))} />}
            </Card>
            <Card title="Velocity by month / env">
              {(data.velocity || []).length === 0
                ? <EmptyChart />
                : <BarChart
                    data={(data.velocity || [])
                      .slice(-10)
                      .map((v) => ({ label: `${v.month.slice(5)} ${v.env}`, value: v.count }))}
                    color="var(--color-accent-2)"
                  />}
            </Card>
          </div>

          {/* Password protected details */}
          <PasswordGate
            gate="amli_auth"
            title="AMLI Vault Details"
            description="Company-related data (recent artifacts, top APIs). Password protected."
          >
            <Card title="Top APIs">
              {(data.topApis || []).length === 0 ? (
                <p className="text-sm text-[var(--color-fg-muted)]">No API data yet.</p>
              ) : (
                <ul className="space-y-2">
                  {data.topApis.slice(0, 10).map((api, i) => (
                    <li key={`${api.apiName}-${api.env}-${i}`} className="flex items-center gap-3 text-sm">
                      <span className="w-6 font-mono text-[var(--color-fg-muted)]">{i + 1}</span>
                      <span className="min-w-0 flex-1 truncate text-[var(--color-fg)]">{api.apiName}</span>
                      <span className="font-mono text-[11px] text-indigo-400">{api.env}</span>
                      <span className="font-mono text-[11px] text-[var(--color-fg-muted)]">×{api.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="Recent artifacts" className="mt-6">
              {(data.recent || []).length === 0 ? (
                <p className="text-sm text-[var(--color-fg-muted)]">No recent data.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {data.recent.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-[var(--color-bg-muted)] px-3 py-2">
                      <span className="font-mono text-[11px] text-indigo-400">{r.env}</span>
                      <span className="min-w-0 flex-1 truncate text-[var(--color-fg)]">{r.apiName}</span>
                      <span className="font-mono text-[11px] text-[var(--color-fg-muted)]">{r.jiraTicket}</span>
                      {r.timestamp && (
                        <span className="font-mono text-[11px] text-[var(--color-fg-muted)]">
                          {new Date(r.timestamp).toLocaleDateString()}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </PasswordGate>
        </>
      )}
    </div>
  )
}

function EmptyChart() {
  return (
    <p className="flex h-40 items-center justify-center text-sm text-[var(--color-fg-muted)]">
      No data yet.
    </p>
  )
}