import { cn } from '@/lib/utils'

/**
 * True desktop background layer — a real wallpaper, not a hero banner.
 * Dark neutral base, subtle depth, very restrained gradients.
 * It must never compete with content.
 */
export function DesktopBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background:
          'radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--color-accent) 7%, transparent), transparent 60%),' +
          'radial-gradient(80% 60% at 85% 110%, color-mix(in srgb, var(--color-accent-2) 5%, transparent), transparent 60%),' +
          'var(--desktop-bg)',
      }}
    >
      {/* Retained depth: a faint grid very far behind content (Hyprland-ish, not neon). */}
      <div className="absolute inset-0 opacity-[0.04] noise" />
      {/* Soft vignette to focus content. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(140% 90% at 50% 40%, transparent 55%, color-mix(in srgb, #000 18%, transparent) 100%)',
        }}
      />
    </div>
  )
}

/* Re-usable desktop surface primitives (panes, toolbars, status lines). */
export function Pane({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        'rounded-[var(--window-radius)] border border-[var(--border)] bg-[var(--surface)] backdrop-blur-[var(--blur)]',
        className,
      )}
    />
  )
}

export function Toolbar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        'flex items-center gap-2 border-b border-[var(--border)] px-3 py-1.5',
        className,
      )}
    />
  )
}

export function StatusLine({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        'flex items-center gap-3 border-t border-[var(--border)] px-3 py-1 font-mono text-[11px] text-[var(--text-muted)]',
        className,
      )}
    />
  )
}
