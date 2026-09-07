import { CalendarDays, Edit3, Plus, Trash2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PasswordGate } from '@/dashboard/components/PasswordGate'
import { Card, BarChart, Stat } from '@/dashboard/components/charts'
import { Button } from '@/components/ui/button'
import {
  listEntries,
  addEntry,
  updateEntry,
  deleteEntry,
  getEntryBody,
  entriesByMonth,
  type JournalEntry,
} from '@/dashboard/lib/storage'
import { renderMarkdown } from '@/dashboard/lib/markdown'

const MOODS = ['😀', '🙂', '😐', '😕', '😴', '🔥', '🤔']

export function JournalSection() {
  const [entries, setEntries] = useState<JournalEntry[]>(() => listEntries())
  const [editing, setEditing] = useState<JournalEntry | null>(null)
  const [authoring, setAuthoring] = useState(false)
  const [reading, setReading] = useState<{ entry: JournalEntry; body: string } | null>(null)
  const [needsPassword, setNeedsPassword] = useState<JournalEntry | null>(null)
  const [readPassword, setReadPassword] = useState('')

  function refresh() {
    setEntries(listEntries())
  }

  const byMonth = useMemo(() => entriesByMonth(entries).map((m) => ({ label: m.month, value: m.count })), [entries])
  const byMood = useMemo(() => {
    const map = new Map<string, number>()
    entries.forEach((e) => {
      const m = e.mood || '🙂'
      map.set(m, (map.get(m) || 0) + 1)
    })
    return [...map.entries()].map(([label, value]) => ({ label, value }))
  }, [entries])

  const monthNow = new Date().toISOString().slice(0, 7)
  const entriesThisMonth = entries.filter((e) => e.date.startsWith(monthNow)).length

  async function onOpen(entry: JournalEntry) {
    setNeedsPassword(entry)
    setReadPassword('')
  }

  async function confirmRead(entry: JournalEntry) {
    try {
      const body = await getEntryBody(readPassword, entry)
      setReading({ entry, body })
      setNeedsPassword(null)
    } catch {
      alert('Could not decrypt. The journal password is likely wrong.')
    }
  }

  function onDelete(id: string) {
    if (!confirm('Delete this entry?')) return
    deleteEntry(id)
    refresh()
    setReading(null)
  }

  return (
    <div className="space-y-6">
      {/* Public graphs: shown to everyone */}
      <section>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Journal / Diary</h3>
          <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
            Private notes, encrypted with your password. Entry statistics below are public; the notes themselves are locked.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Total entries" value={entries.length} />
          <Stat label="This month" value={entriesThisMonth} />
          <Stat label="Moods logged" value={new Set(entries.map((e) => e.mood).filter(Boolean)).size} sub="unique moods" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card title="Entries per month">
            {byMonth.length === 0
              ? <EmptyChart />
              : <BarChart data={byMonth} />}
          </Card>
          <Card title="Mood distribution">
            {byMood.length === 0
              ? <EmptyChart />
              : <BarChart data={byMood} color="var(--color-accent-2)" />}
          </Card>
        </div>
      </section>

      {/* Private part: content is password protected */}
      <PasswordGate
        gate="journal_auth"
        title="Private Journal"
        description="This diary is encrypted with your password. Only you can read or write entries."
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="font-semibold">Manage entries</h4>
          <Button onClick={() => { setAuthoring(true); setEditing(null) }}>
            <Plus className="size-4" /> New entry
          </Button>
        </div>

        {(authoring || editing) && (
          <EntryForm
            key={editing?.id || 'new'}
            entry={editing}
            onCancel={() => { setAuthoring(false); setEditing(null) }}
            onDone={() => {
              setAuthoring(false)
              setEditing(null)
              refresh()
            }}
          />
        )}

        <div className="mt-4">
          {entries.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-fg-muted)]">
              No entries yet. Write your first journal entry.
            </p>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {entries.map((e) => (
                <li
                  key={e.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4 transition-colors hover:border-indigo-400/50"
                  onClick={() => onOpen(e)}
                >
                  <span className="text-xl">{e.mood || '📓'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[var(--color-fg)]">{e.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--color-fg-muted)]">
                      <CalendarDays className="size-3" /> {e.date}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={(ev) => { ev.stopPropagation(); onDelete(e.id) }} aria-label="Delete">
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PasswordGate>

      {needsPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setNeedsPassword(null)}>
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-lg font-semibold">View entry</h4>
            <p className="mt-1 text-sm text-[var(--color-fg-muted)]">{needsPassword.title}</p>
            <input
              type="password"
              value={readPassword}
              onChange={(e) => setReadPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirmRead(needsPassword)}
              placeholder="Enter your journal password"
              className="mt-4 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
            <div className="mt-4 flex gap-2">
              <Button className="flex-1" onClick={() => confirmRead(needsPassword)}>Decrypt</Button>
              <Button variant="outline" onClick={() => { setEditing(needsPassword); setNeedsPassword(null) }}>
                <Edit3 className="size-4" /> Edit
              </Button>
            </div>
          </div>
        </div>
      )}

      {reading && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 py-10" onClick={() => setReading(null)}>
          <div className="w-full max-w-2xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h4 className="flex items-center gap-2 text-lg font-semibold">
                  <span>{reading.entry.mood || '📓'}</span> {reading.entry.title}
                </h4>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--color-fg-muted)]">
                  <CalendarDays className="size-3" /> {reading.entry.date}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setReading(null)} aria-label="Close">
                <X className="size-4" />
              </Button>
            </div>
            <div
              className="prose prose-sm max-w-none text-[var(--color-fg)]"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(reading.body) }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyChart() {
  return (
    <p className="flex h-40 items-center justify-center text-sm text-[var(--color-fg-muted)]">
      No data yet — unlock the journal and add an entry.
    </p>
  )
}

function EntryForm({ entry, onCancel, onDone }: {
  entry: JournalEntry | null
  onCancel: () => void
  onDone: (e: JournalEntry) => void
}) {
  const [title, setTitle] = useState(entry?.title || '')
  const [mood, setMood] = useState(entry?.mood || '🙂')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')

  const date = entry?.date || new Date().toISOString().slice(0, 10)

  async function save() {
    if (!password) { setError('Enter your journal password to save.'); return }
    if (!title.trim()) { setError('Give the entry a title.'); return }
    if (!body.trim()) { setError('Write something before saving.'); return }
    setLoading(true)
    setError(null)
    try {
      const saved = entry
        ? await updateEntry(password, entry.id, { title, date, mood, body })
        : await addEntry(password, { title, date, mood, body })
      onDone(saved)
    } catch {
      setError('Could not encrypt. Use the same password you use to unlock the journal (min 8 chars).')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="flex items-center gap-2 font-semibold">
          <Edit3 className="size-4 text-indigo-400" />
          {entry ? 'Edit entry' : 'New entry'} · {date}
        </h4>
        <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Close">
          <X className="size-4" />
        </Button>
      </div>
      <div className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Entry title"
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
        <div className="flex flex-wrap items-center gap-2">
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m)}
              className={`size-9 rounded-lg border text-lg transition-colors ${mood === m ? 'border-indigo-400 bg-[var(--color-bg-muted)]' : 'border-[var(--color-border)] hover:border-[var(--color-fg-muted)]'}`}
              aria-label={`Mood ${m}`}
            >
              {m}
            </button>
          ))}
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={'Write your thoughts… (markdown supported)\n\n## Today\n…'}
          rows={8}
          className="w-full resize-y rounded-md border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-3 py-2 font-mono text-sm outline-none focus:border-indigo-400"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your journal password (required to encrypt/save)"
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={save} disabled={loading}>{loading ? 'Saving…' : 'Save entry'}</Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </div>
  )
}