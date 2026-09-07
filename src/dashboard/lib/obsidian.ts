export interface ObsidianNoteRef {
  title: string
  path: string
  heading: string
}

export interface ObsidianNote extends ObsidianNoteRef {
  content: string
}

export interface ObsidianCategory {
  id: string
  label: string
  emoji: string
  color: string
  description: string
  folder: string
  noteCount: number
  fileCount: number
  subfolderCount: number
  /** Notes are not inlined in the manifest; the app fetches this JSON on demand. */
  dataUrl: string
  generatedAt?: string
}
