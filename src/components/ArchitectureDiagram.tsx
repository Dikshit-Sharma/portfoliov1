export function ArchitectureDiagram() {
  return (
    <div className="scrollbar-thin overflow-x-auto">
      <div className="min-w-[640px] space-y-4">
        <div className="flex justify-center">
          <ArchNode title="React Frontend" subtitle="React 19" className="w-56" accent />
        </div>
        <div className="mx-auto h-8 w-px bg-indigo-400/40" aria-hidden="true" />
        <div className="grid grid-cols-3 gap-3">
          <ArchNode title="Firebase Firestore" subtitle="Application data" />
          <ArchNode title="Netlify Functions" subtitle="Serverless" />
          <ArchNode title="Edge Extension" subtitle="RepoScope" />
        </div>
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div />
          <div className="space-y-2 rounded-lg border border-dashed border-[var(--color-border)] p-3 font-mono text-[11px] text-[var(--color-fg-muted)]">
            <p>GitLab API</p>
            <p>Groq AI</p>
            <p>SendGrid</p>
          </div>
          <div />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['AES', 'Client-side'],
            ['Credentials', 'Masked'],
            ['GitLab', 'API'],
            ['AI', 'Server-side proxy'],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2"
            >
              <p className="font-mono text-[10px] text-indigo-400">{label}</p>
              <p className="text-sm">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ArchNode({
  title,
  subtitle,
  className,
  accent,
}: {
  title: string
  subtitle: string
  className?: string
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-center ${className ?? ''} ${
        accent
          ? 'border-indigo-400/50 bg-indigo-500/10'
          : 'border-[var(--color-border)] bg-[var(--color-bg)]'
      }`}
    >
      <p className="text-sm font-medium">{title}</p>
      <p className="font-mono text-[11px] text-[var(--color-fg-muted)]">{subtitle}</p>
    </div>
  )
}
