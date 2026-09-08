export interface NowEntry {
  building: string[]
  learning: string[]
  experimenting: string[]
  reading?: string[]
  updated: string
}

export const nowData: NowEntry = {
  building: [
    'Portfolio v2 — Developer Workspace transformation',
    'Developer utilities & CLI tools',
    'AI-assisted coding workflows',
  ],
  learning: [
    'System Design — distributed systems patterns',
    'Cloud Architecture — AWS advanced services',
    'Rust — systems programming',
  ],
  experimenting: [
    'Linux — daily driver workflows',
    'AI coding assistants (Cursor, Copilot, local LLMs)',
    'Obsidian automation & knowledge graphs',
  ],
  reading: [
    'Mistborn — Brandon Sanderson',
    'Red Rising — Pierce Brown',
    'The Shining — Stephen King',
  ],
  updated: '2026-09',
}

export function getNowData(): NowEntry {
  return nowData
}