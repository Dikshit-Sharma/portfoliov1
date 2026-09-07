import type { ReactNode } from 'react'
import { useId } from 'react'

export function Card({ title, action, children, className = '' }: {
  title?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5 ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h3 className="font-mono text-[11px] tracking-[0.16em] text-indigo-400 uppercase">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function Stat({ label, value, sub, accent }: {
  label: string
  value: ReactNode
  sub?: string
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4">
      <p className="text-xs text-[var(--color-fg-muted)]">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tracking-tight ${accent || 'text-[var(--color-fg)]'}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-[var(--color-fg-muted)]">{sub}</p>}
    </div>
  )
}

export function BarChart({ data, color = 'var(--color-accent)' }: {
  data: { label: string; value: number }[]
  color?: string
}) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="flex h-40 items-end gap-1.5">
      {data.map((d) => (
        <div key={d.label} className="group flex flex-1 flex-col items-center gap-1">
          <span className="font-mono text-[10px] text-[var(--color-fg-muted)] opacity-0 transition-opacity group-hover:opacity-100">
            {d.value}
          </span>
          <div
            className="w-full rounded-t-md transition-opacity group-hover:opacity-80"
            style={{ height: `${(d.value / max) * 100}%`, background: color, minHeight: d.value > 0 ? 2 : 1, opacity: d.value > 0 ? 1 : 0.15 }}
            title={`${d.label}: ${d.value}`}
          />
          <span className="w-full truncate text-center font-mono text-[9px] text-[var(--color-fg-muted)]" title={d.label}>
            {d.label}
          </span>
        </div>
      ))}
    </div>
  )
}

export function LineChart({ data, color = 'var(--color-accent)' }: {
  data: { label: string; value: number }[]
  color?: string
}) {
  const gradId = useId()
  const max = Math.max(1, ...data.map((d) => d.value))
  const w = 600
  const h = 160
  const padX = 8
  const padY = 8
  const n = data.length
  if (n === 0) return <p className="py-8 text-center text-sm text-[var(--color-fg-muted)]">No data yet.</p>

  const pts = data.map((d, i) => {
    const x = n === 1 ? padX : padX + (i / (n - 1)) * (w - padX * 2)
    const y = h - padY - (d.value / max) * (h - padY * 2)
    return [x, y] as const
  })
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} L${(pts[pts.length - 1][0]).toFixed(1)},${h - padY} L${pts[0][0].toFixed(1)},${h - padY} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Line chart">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="var(--color-bg)" stroke={color} strokeWidth="2">
          <title>{`${data[i].label}: ${data[i].value}`}</title>
        </circle>
      ))}
      {/* X labels */}
      {data.map((d, i) => {
        const x = n === 1 ? padX : padX + (i / (n - 1)) * (w - padX * 2)
        const show = n <= 16 || i % Math.ceil(n / 16) === 0
        return show ? (
          <text key={i} x={x} y={h - 2} textAnchor="middle" className="fill-[var(--color-fg-muted)]" fontSize="9" fontFamily="monospace">
            {d.label}
          </text>
        ) : null
      })}
    </svg>
  )
}

const LEVEL_COLORS = ['transparent', '#2a3a5c', '#3b6fb0', '#4ba3ff', '#7cc4ff']

export function ContributionHeatmap({ weeks, title }: {
  weeks: { date: string; count: number; level: number }[][]
  title?: string
}) {
  if (!weeks || weeks.length === 0) {
    return <p className="py-8 text-center text-sm text-[var(--color-fg-muted)]">Contribution data unavailable.</p>
  }
  const total = weeks.flat().reduce((s, d) => s + d.count, 0)
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-[var(--color-fg)]">
          {total.toLocaleString()} contributions in the last ~6 months
        </span>
        {title && <span className="font-mono text-[11px] text-[var(--color-fg-muted)]">{title}</span>}
      </div>
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => (
              <div
                key={di}
                title={`${day.date}: ${day.count} contribution${day.count === 1 ? '' : 's'}`}
                className="size-[11px] rounded-[2px]"
                style={{ background: LEVEL_COLORS[day.level] || LEVEL_COLORS[0], border: day.level === 0 ? '1px solid var(--color-border)' : 'none' }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1 text-[10px] text-[var(--color-fg-muted)]">
        <span>Less</span>
        {LEVEL_COLORS.map((c, i) => (
          <span key={i} className="size-[10px] rounded-[2px] border border-[var(--color-border)]" style={{ background: c === 'transparent' ? 'transparent' : c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
