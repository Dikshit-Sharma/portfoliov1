import { ChevronDown, Download, FileText, FolderOpen, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { Card, Stat } from '@/dashboard/components/charts'
import { obsidianCategories, obsidianTotalNotes, obsidianGeneratedAt } from '@/data/obsidian.generated'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { renderMarkdown } from '@/dashboard/lib/markdown'
import type { ObsidianNote } from '@/dashboard/lib/obsidian'

const LOADED: Record<string, ObsidianNote[]> = {}

async function fetchCategory(id: string, dataUrl: string): Promise<ObsidianNote[]> {
  if (LOADED[id]) return LOADED[id]
  const res = await fetch(dataUrl.startsWith('http') ? dataUrl : `${import.meta.env.BASE_URL}${dataUrl}`)
  if (!res.ok) throw new Error(`Failed to load ${id}`)
  const json = await res.json()
  LOADED[id] = json.notes || []
  return LOADED[id]
}

function downloadMarkdown(note: ObsidianNote) {
  const blob = new Blob([note.content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${note.title.replace(/[^\w.-]+/g, '_')}.md`
  a.click()
  URL.revokeObjectURL(url)
}

function exportCategoryAsMarkdown(label: string, notes: ObsidianNote[]) {
  const front = `# ${label} — Obsidian Export\n\n> Exported from the ${label} category on ${new Date().toLocaleDateString()} (${new Date().toLocaleTimeString()}).\n\n`
  const combined = notes.map((n) => `---\n# ${n.title}\n\n_Path: \`${n.path}\`_\n\n${n.content}`).join('\n\n---\n\n')
  const blob = new Blob([front + combined], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${label.toLowerCase().replace(/[^\w]+/g, '-')}-export.md`
  a.click()
  URL.revokeObjectURL(url)
}

export function ObsidianSection() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [notes, setNotes] = useState<ObsidianNote[] | null>(null)
  const [loadingCat, setLoadingCat] = useState<string | null>(null)
  const [openNote, setOpenNote] = useState<ObsidianNote | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function toggle(cat: (typeof obsidianCategories)[number]) {
    if (expanded === cat.id) {
      setExpanded(null)
      return
    }
    setExpanded(cat.id)
    setLoadingCat(cat.id)
    setError(null)
    try {
      setNotes(await fetchCategory(cat.id, cat.dataUrl))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load notes')
      setNotes(null)
    } finally {
      setLoadingCat(null)
    }
  }

  const stats = [
    { label: 'Categories', value: obsidianCategories.length },
    { label: 'Notes indexed', value: obsidianTotalNotes.toLocaleString() },
    { label: 'Vault', value: 'Void', sub: '(public categories)' },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
        <div>
          <h3 className="text-lg font-semibold">Obsidian Vault — Category Browser</h3>
          <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
            Notes from my Obsidian vault, grouped into categories. Click a category to browse, read and export its notes as
            Obsidian <code className="font-mono">.md</code> files.
          </p>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <Stat key={s.label} label={s.label} value={s.value} sub={s.sub} />
          ))}
        </div>
        <p className="mt-4 font-mono text-[11px] text-[var(--color-fg-muted)]">
          Generated {obsidianGeneratedAt ? new Date(obsidianGeneratedAt).toLocaleString() : '—'}
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-[var(--color-bg-muted)] p-3 text-xs text-red-400">{error}</p>
      )}

      {obsidianCategories.map((cat) => {
        const isOpen = expanded === cat.id
        const catNotes = isOpen ? notes : null
        return (
          <Card
            key={cat.id}
            className="p-0"
            title={
              <div className="flex w-full flex-wrap items-center gap-4 p-5">
                <span
                  className="flex size-12 items-center justify-center rounded-xl text-2xl"
                  style={{ background: `color-mix(in srgb, ${cat.color} 18%, transparent)`, border: `1px solid ${cat.color}44` }}
                >
                  {cat.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="flex flex-wrap items-center gap-2 font-semibold text-[var(--color-fg)]">
                    {cat.label}
                    <Badge style={{ color: cat.color, borderColor: `${cat.color}55` }}>{cat.noteCount} notes</Badge>
                  </h4>
                  {cat.description && (
                    <p className="mt-1 text-sm text-[var(--color-fg-muted)]">{cat.description}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => exportCategoryAsMarkdown(cat.label, (catNotes || []))}
                  disabled={!catNotes}
                  title={catNotes ? 'Export all notes as one .md file' : 'Expand the category first'}
                >
                  <Download className="size-3.5" /> Export .md
                </Button>
                <button
                  type="button"
                  className="flex size-8 items-center justify-center rounded-md text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
                  onClick={() => toggle(cat)}
                  aria-expanded={isOpen}
                  aria-label={isOpen ? 'Collapse' : 'Expand'}
                >
                  {loadingCat === cat.id ? <Loader2 className="size-4 animate-spin" /> : <ChevronDown className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
                </button>
              </div>
            }
          >
            {isOpen && (
              <div className="border-t border-[var(--color-border)] px-5 py-4">
                <p className="mb-3 flex items-center gap-2 text-xs text-[var(--color-fg-muted)]">
                  <FolderOpen className="size-3.5" />
                  {cat.subfolderCount} subfolder{cat.subfolderCount === 1 ? '' : 's'} ·
                  source folder <span className="font-mono">{cat.folder}</span>
                </p>
                {catNotes === null && loadingCat !== cat.id ? (
                  <p className="text-sm text-[var(--color-fg-muted)]">No notes to show.</p>
                ) : loadingCat === cat.id ? (
                  <p className="flex items-center gap-2 text-sm text-[var(--color-fg-muted)]">
                    <Loader2 className="size-4 animate-spin" /> Loading notes…
                  </p>
                ) : catNotes!.length === 0 ? (
                  <p className="text-sm text-[var(--color-fg-muted)]">No notes in this category.</p>
                ) : (
                  <>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {catNotes!.map((n) => (
                        <li key={n.path}>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-3 py-2 text-left text-sm transition-colors hover:border-indigo-400/50"
                            onClick={() => setOpenNote(n)}
                          >
                            <FileText className="size-3.5 shrink-0 text-[var(--color-fg-muted)]" />
                            <span className="truncate text-[var(--color-fg)]">{n.heading || n.title}</span>
                            <Download
                              className="ml-auto size-3.5 shrink-0 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
                              onClick={(e) => { e.stopPropagation(); downloadMarkdown(n) }}
                              aria-label={`Download ${n.title}`}
                            />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs text-[var(--color-fg-muted)]">
                      Click a note to read it. Click the download icon to get the original Obsidian <code className="font-mono">.md</code> file.
                    </p>
                  </>
                )}
              </div>
            )}
          </Card>
        )
      })}

      <div className="rounded-xl border border-dashed border-[var(--color-border)] p-5 text-sm text-[var(--color-fg-muted)]">
        <p className="mb-1 font-mono text-[11px] tracking-[0.16em] text-indigo-400 uppercase">What's here</p>
        <p>
          This page shows a public snapshot of the knowledge vault — category counts, note indexes, and full markdown
          for reading. Protected vault content is excluded.
        </p>
      </div>

      {openNote && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 py-10" onClick={() => setOpenNote(null)}>
          <div className="w-full max-w-3xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h4 className="truncate text-lg font-semibold">{openNote.heading}</h4>
                <p className="mt-0.5 truncate font-mono text-[11px] text-[var(--color-fg-muted)]">{openNote.path}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => downloadMarkdown(openNote)}>
                  <Download className="size-3.5" /> .md
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setOpenNote(null)} aria-label="Close">
                  <X className="size-4" />
                </Button>
              </div>
            </div>
            <div
              className="max-h-[70vh] overflow-y-auto text-[var(--color-fg)]"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(openNote.content) }}
            />
          </div>
        </div>
      )}
    </div>
  )
}