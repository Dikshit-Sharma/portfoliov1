import { Lock, Unlock } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { storeDashboardAuthToken, clearDashboardAuthToken } from '@/dashboard/lib/auth-token'

export function PasswordGate({ gate, title, description, children }: {
  gate: string
  title: string
  description: string
  children: React.ReactNode
}) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(gate) === '1')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

async function unlock() {
    if (!password) return
    setChecking(true)
    setError(null)
    let valid = false
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json().catch(() => null)
      valid = Boolean(res.ok && data?.valid)
    } catch {
      valid = false
    }
    // Local dev fallback when the Netlify function isn't available.
    if (!valid) {
      const devPassword = import.meta.env.VITE_DEV_DASHBOARD_PASSWORD
      if (devPassword && password === devPassword) valid = true
    }
    if (valid) {
      sessionStorage.setItem(gate, '1')
      // Store sha256(password) so privileged /api calls can authenticate the
      // session server-side without the password leaving the browser.
      storeDashboardAuthToken(password)
      window.dispatchEvent(new CustomEvent('dashboard-auth-changed'))
      setAuthed(true)
    } else {
      setError('Incorrect password.')
    }
    setChecking(false)
  }

  function lock() {
    sessionStorage.removeItem(gate)
    clearDashboardAuthToken()
    window.dispatchEvent(new CustomEvent('dashboard-auth-changed'))
    setAuthed(false)
  }

  if (authed) {
    return (
      <>
        <div className="mb-4 flex items-center justify-end">
          <Button variant="ghost" size="sm" onClick={lock}>
            <Unlock className="size-3.5" /> Unlocked
          </Button>
        </div>
        {children}
      </>
    )
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[var(--color-bg-muted)]">
        <Lock className="size-5 text-indigo-400" />
      </div>
      <h3 className="mt-4 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-[var(--color-fg-muted)]">{description}</p>
      <div className="mt-6 space-y-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && unlock()}
          placeholder="Enter password"
          autoComplete="current-password"
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <Button className="w-full" onClick={unlock} disabled={!password || checking}>
          {checking ? 'Checking…' : 'Unlock'}
        </Button>
      </div>
    </div>
  )
}
