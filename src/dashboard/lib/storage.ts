/**
 * Journal storage: encrypted entries persisted to localStorage.
 *
 * An entry is stored as a metadata envelope (id, title, mood, date) plus an encrypted
 * payload ({ cipher, iv, salt }) holding the body. Only the owner password can decrypt.
 * The envelope's title/date/mood are available for graphs without decryption.
 */
import { encryptText, decryptText, type CryptoPayload } from '@/dashboard/lib/crypto'

const STORAGE_KEY = 'dashboard.journal.v1'

export interface JournalEntry {
  id: string
  title: string
  date: string // YYYY-MM-DD
  mood?: string
  createdAt: string
  updatedAt: string
  cipher: string
  iv: string
  salt: string
}

interface Store {
  entries: JournalEntry[]
}

function load(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { entries: [] }
    return JSON.parse(raw) as Store
  } catch {
    return { entries: [] }
  }
}

function save(store: Store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function listEntries(): JournalEntry[] {
  return load().entries.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function addEntry(
  password: string,
  input: { title: string; date: string; mood?: string; body: string },
): Promise<JournalEntry> {
  const payload: CryptoPayload = await encryptText(password, input.body)
  const now = new Date().toISOString()
  const entry: JournalEntry = {
    id: crypto.randomUUID(),
    title: input.title,
    date: input.date,
    mood: input.mood,
    createdAt: now,
    updatedAt: now,
    cipher: payload.cipher,
    iv: payload.iv,
    salt: payload.salt,
  }
  const store = load()
  store.entries.push(entry)
  save(store)
  return entry
}

export async function updateEntry(
  password: string,
  id: string,
  input: { title: string; date: string; mood?: string; body: string },
): Promise<JournalEntry> {
  const store = load()
  const idx = store.entries.findIndex((e) => e.id === id)
  if (idx === -1) throw new Error('Entry not found')
  const payload: CryptoPayload = await encryptText(password, input.body)
  store.entries[idx] = {
    ...store.entries[idx],
    title: input.title,
    date: input.date,
    mood: input.mood,
    updatedAt: new Date().toISOString(),
    cipher: payload.cipher,
    iv: payload.iv,
    salt: payload.salt,
  }
  save(store)
  return store.entries[idx]
}

export function deleteEntry(id: string) {
  const store = load()
  store.entries = store.entries.filter((e) => e.id !== id)
  save(store)
}

export async function getEntryBody(password: string, entry: JournalEntry): Promise<string> {
  return decryptText(password, { cipher: entry.cipher, iv: entry.iv, salt: entry.salt })
}

/** Aggregate entry counts per month for graphs. */
export function entriesByMonth(entries: JournalEntry[]): { month: string; count: number }[] {
  const map = new Map<string, number>()
  for (const e of entries) {
    const month = e.date.slice(0, 7)
    map.set(month, (map.get(month) || 0) + 1)
  }
  return [...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([month, count]) => ({ month, count }))
}
