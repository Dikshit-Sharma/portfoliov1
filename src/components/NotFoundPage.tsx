import { buttonClass } from '@/components/ui/button'
import { navigate } from '@/lib/router'
import { Home, Search, Terminal } from 'lucide-react'

export function NotFoundPage() {
  const suggestions: { path: 'home' | 'work' | 'lab' | 'now' | 'knowledge' | 'recruiter' | 'contact'; label: string }[] = [
    { path: 'home', label: 'Home' },
    { path: 'work', label: 'Work' },
    { path: 'lab', label: 'Lab' },
    { path: 'now', label: 'Now' },
    { path: 'knowledge', label: 'Knowledge' },
    { path: 'recruiter', label: 'Recruiter Mode' },
    { path: 'contact', label: 'Contact' },
  ]

  return (
    <section className="mx-auto max-w-md px-4 py-20 sm:px-6 text-center">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8">
        <div className="mb-6 font-mono text-sm text-[var(--color-fg-muted)]">
          <p>$ cd /{window.location.hash.replace(/^#\/?/, '') || 'unknown'}</p>
          <p className="text-red-400">bash: no such file or directory</p>
        </div>
        <h1 className="text-2xl font-semibold mb-2">404 — Page Not Found</h1>
        <p className="text-[var(--color-fg-muted)] mb-6">The route you're looking for doesn't exist in this workspace.</p>
        
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => navigate('home')}
            className={buttonClass({ size: 'lg' })}
          >
            <Home className="size-4" /> Back to Home
          </button>
          <button
            onClick={() => window.location.hash = '#/dashboard/overview'}
            className={buttonClass({ variant: 'outline', size: 'lg' })}
          >
            <Terminal className="size-4" /> Dashboard
          </button>
        </div>

        <div className="border-t border-[var(--color-border)] pt-6">
          <p className="font-mono text-[11px] tracking-[0.16em] text-indigo-400 uppercase mb-3">Maybe you meant:</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {suggestions.map((s) => (
              <button
                key={s.path}
                onClick={() => navigate(s.path)}
                className="text-left px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-muted)] hover:border-indigo-400/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Search className="size-3.5 text-[var(--color-fg-muted)]" />
                  <span className="font-medium text-[var(--color-fg)]">{s.label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-xs text-[var(--color-fg-muted)]">
          Or press <kbd className="px-1.5 py-0.5 bg-[var(--color-bg-muted)] rounded">{typeof window !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'}</kbd>+<kbd className="px-1.5 py-0.5 bg-[var(--color-bg-muted)] rounded">K</kbd> for the command palette.
        </p>
      </div>
    </section>
  )
}