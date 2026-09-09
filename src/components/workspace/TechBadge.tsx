import { Badge } from '@/components/ui/badge'
import { useWorkspaceShell } from '@/components/workspace/WorkspaceShell'
import type { ReactNode } from 'react'

/**
 * A technology chip that opens the entity inspector when clicked — the fast
 * path to the "used in projects / experience / related knowledge" relationship
 * view from anywhere in the workspace.
 */
export function TechBadge({ tech, className }: { tech: string; className?: string }) {
  const { openInspector } = useWorkspaceShell()
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        openInspector('technology', tech)
      }}
      title={`Inspect ${tech}`}
      aria-label={`Inspect technology: ${tech}`}
      className="cursor-pointer"
    >
      <Badge className={`transition-colors hover:border-[var(--color-accent)]/60 hover:text-[var(--color-fg)] ${className ?? ''}`}>
        {tech}
      </Badge>
    </button>
  )
}

/** Non-interactive fallback (used in places where inspection is not desired). */
export function StaticBadge({ children, className }: { children: ReactNode; className?: string }) {
  return <Badge className={className}>{children}</Badge>
}