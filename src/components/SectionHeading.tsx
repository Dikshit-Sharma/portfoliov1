export function SectionHeading({
  kicker,
  title,
  description,
}: {
  kicker: string
  title: string
  description?: string
}) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="mb-3 font-mono text-xs tracking-[0.18em] text-indigo-400 uppercase">{kicker}</p>
      <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-fg)] sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-[var(--color-fg-muted)] leading-relaxed">{description}</p>
      ) : null}
    </div>
  )
}
