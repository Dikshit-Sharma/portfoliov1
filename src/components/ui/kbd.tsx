import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Kbd({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        'inline-flex min-w-5 items-center justify-center rounded border border-[var(--color-border)]',
        'bg-[var(--color-bg-muted)] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[var(--color-fg-muted)]',
        className,
      )}
      {...props}
    />
  )
}
