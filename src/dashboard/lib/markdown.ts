/**
 * Lightweight markdown → HTML renderer for journal entries and Obsidian notes.
 * Handles headings, bold/italic, inline code, code blocks, links, lists,
 * blockquotes and horizontal rules. No external dependency.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function inline(text: string): string {
  let t = escapeHtml(text)

  // Images first: ![alt](src)
  t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt, src) => {
    return `<img src="${src}" alt="${alt}" loading="lazy" class="rounded-md border border-[var(--color-border)] my-2 max-w-full">`
  })
  // Links: [text](href)
  t = t.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_m, text, href) =>
      `<a href="${href}" target="_blank" rel="noreferrer" class="text-indigo-400 underline underline-offset-2">${text}</a>`,
  )
  // Inline code
  t = t.replace(/`([^`]+)`/g, (_m, code) => `<code class="rounded bg-[var(--color-bg-muted)] px-1 py-0.5 font-mono text-[0.9em]">${code}</code>`)
  // Bold
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  // Italic
  t = t.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
  return t
}

export function renderMarkdown(md: string): string {
  const lines = md.split(/\r?\n/)
  const out: string[] = []
  let inCode = false
  let inList: 'ul' | 'ol' | null = null
  let inQuote = false

  const closeList = () => {
    if (inList) { out.push(`</${inList}>`); inList = null }
  }
  const closeQuote = () => {
    if (inQuote) { out.push('</blockquote>'); inQuote = false }
  }

  for (const line of lines) {
    // Code fences
    if (line.trim().startsWith('```')) {
      if (inCode) { out.push('</code></pre>'); inCode = false }
      else { closeList(); closeQuote(); out.push('<pre class="overflow-x-auto rounded-lg bg-[var(--color-bg-muted)] p-3 my-2"><code>'); inCode = true }
      continue
    }
    if (inCode) {
      out.push(escapeHtml(line))
      continue
    }

    if (line.trim() === '') { closeList(); closeQuote(); continue }

    // Headings
    const h = line.match(/^(#{1,6})\s+(.+)/)
    if (h) {
      closeList(); closeQuote()
      const level = h[1].length
      out.push(`<h${level} class="mt-5 mb-2 font-semibold tracking-tight text-[var(--color-fg)]">${inline(h[2])}</h${level}>`)
      continue
    }
    // Horizontal rule
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      closeList(); closeQuote()
      out.push('<hr class="my-4 border-[var(--color-border)]">')
      continue
    }
    // Blockquote
    const q = line.match(/^>\s?(.*)/)
    if (q) {
      if (!inQuote) { closeList(); out.push('<blockquote class="my-2 border-l-2 border-indigo-400 pl-3 text-[var(--color-fg-muted)]">'); inQuote = true }
      out.push(`<p>${inline(q[1])}</p>`)
      continue
    } else if (inQuote) { closeQuote() }

    // Unordered list
    const ul = line.match(/^\s*[-*+]\s+(.+)/)
    if (ul) {
      if (inList !== 'ul') { closeList(); out.push('<ul class="my-2 list-disc space-y-1 pl-5">'); inList = 'ul' }
      out.push(`<li>${inline(ul[1])}</li>`)
      continue
    }
    // Ordered list
    const ol = line.match(/^\s*\d+[.)]\s+(.+)/)
    if (ol) {
      if (inList !== 'ol') { closeList(); out.push('<ol class="my-2 list-decimal space-y-1 pl-5">'); inList = 'ol' }
      out.push(`<li>${inline(ol[1])}</li>`)
      continue
    }

    closeList()
    out.push(`<p class="my-1.5">${inline(line)}</p>`)
  }

  closeList()
  closeQuote()
  if (inCode) out.push('</code></pre>')

  return out.join('\n')
}
