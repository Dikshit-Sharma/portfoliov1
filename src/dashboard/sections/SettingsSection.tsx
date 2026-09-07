import { Copy, KeyRound, RefreshCw, ShieldCheck } from 'lucide-react'
import { Card } from '@/dashboard/components/charts'

function EnvRow({ name, description, example }: { name: string; description: string; example?: string }) {
  return (
    <li className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <code className="font-mono text-sm text-indigo-400">{name}</code>
        <button
          type="button"
          className="flex items-center gap-1 text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
          onClick={() => { navigator.clipboard?.writeText(name); alert(`Copied ${name}`) }}
        >
          <Copy className="size-3" /> copy
        </button>
      </div>
      <p className="mt-1 text-xs text-[var(--color-fg-muted)]">{description}</p>
      {example && <code className="mt-1 block text-[11px] text-[var(--color-fg-muted)]">{example}</code>}
    </li>
  )
}

export function SettingsSection() {
  return (
    <div className="space-y-6">
      <Card title="How protection & fresh data work">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4">
            <ShieldCheck className="size-5 text-emerald-400" />
            <h4 className="mt-2 font-semibold text-sm">Password gates</h4>
            <p className="mt-1 text-xs text-[var(--color-fg-muted)]">
              Journal and AMLI Vault are locked behind a password you set on Netlify. Verification runs server-side via
              the <code className="font-mono">/api/auth</code> function — no password is stored in the browser.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4">
            <KeyRound className="size-5 text-indigo-400" />
            <h4 className="mt-2 font-semibold text-sm">Journal encryption</h4>
            <p className="mt-1 text-xs text-[var(--color-fg-muted)]">
              Journal entries are AES-256-GCM encrypted in your browser with your password before being stored in
              localStorage. Raw text never touches the network.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4">
            <RefreshCw className="size-5 text-amber-400" />
            <h4 className="mt-2 font-semibold text-sm">Daily AMLI sync</h4>
            <p className="mt-1 text-xs text-[var(--color-fg-muted)]">
              A scheduled Netlify function <code className="font-mono">amli-sync</code> refreshes the AMLI_Vault snapshot
              every morning at 05:30 UTC and caches it for fast dashboard loads.
            </p>
          </div>
        </div>
      </Card>

      <Card title="Environment variables (set in Netlify → Site settings → Environment variables)">
        <ul className="grid gap-3 md:grid-cols-2">
          <EnvRow
            name="DASHBOARD_PASSWORD"
            description="Required. The single password that unlocks Journal and AMLI Vault sections."
            example="DASHBOARD_PASSWORD=your-secret"
          />
          <EnvRow
            name="GITHUB_TOKEN"
            description="Recommended. A fine-grained PAT with repo:read. Without it the GitHub section falls back to the public unauthenticated API (lower rate limit, no contribution heatmap)."
            example="GITHUB_TOKEN=github_pat_..."
          />
          <EnvRow
            name="GITHUB_USERNAME"
            description="Optional. Defaults to Dikshit-Sharma if unset."
            example="GITHUB_USERNAME=Dikshit-Sharma"
          />
          <EnvRow
            name="AMLI_BSA_URL"
            description="Optional. Defaults to https://amliaes.netlify.app/api/bsa."
          />
          <EnvRow
            name="AMLI_ARTIFACTS_URL"
            description="Optional. Used for stats and auto-extracted credentials. Defaults to https://amliaes.netlify.app/api/artifacts."
          />
          <EnvRow
            name="AMLI_API_KEY"
            description="Optional. Sent as X-API-Key to the AMLI service if the upstream requires it."
          />
        </ul>
      </Card>

      <Card title="Regenerating Obsidian categories">
        <p className="text-sm text-[var(--color-fg-muted)]">
          Run <code className="font-mono">npm run gen:obsidian</code> in the repo root on your machine. It scans{' '}
          <code className="font-mono">~/Entertainment/Obsidian/Void</code> (excluding the protected{' '}
          <code className="font-mono">AMLI_Vault</code>), then rewrites{' '}
          <code className="font-mono">src/data/obsidian.generated.ts</code>. Commit the change and redeploy to update the
          categories on the live site.
        </p>
      </Card>
    </div>
  )
}
