export interface LabProject {
  id: string
  name: string
  description: string
  category: 'developer-tools' | 'ai' | 'linux' | 'automation' | 'experiments' | 'archived'
  status: 'building' | 'experiment' | 'stable' | 'archived'
  technologies: string[]
  links?: {
    live?: string
    source?: string
    demo?: string
  }
  started?: string
  updated?: string
}

export const labProjects: LabProject[] = [
  {
    id: 'wikipedia-obsidian',
    name: 'Wikipedia → Obsidian',
    description: 'Knowledge engine that transforms Wikipedia articles into structured Obsidian notes with backlinks, tags, and graph connections.',
    category: 'developer-tools',
    status: 'building',
    technologies: ['TypeScript', 'Node.js', 'Obsidian API', 'Wikipedia API'],
    links: {
      source: 'https://github.com/Dikshit-Sharma/wiki-to-obsidian',
    },
    started: '2026-01',
    updated: '2026-09',
  },
  {
    id: 'amli-tools',
    name: 'AMLI Tools',
    description: 'Developer productivity platform for AES encryption, API artifacts, credentials, BSA tracking, and GitLab analytics.',
    category: 'developer-tools',
    status: 'building',
    technologies: ['React 19', 'Firebase', 'Netlify Functions', 'Groq', 'Three.js'],
    links: {
      live: 'https://amliaes.netlify.app',
      source: 'https://github.com/Dikshit-Sharma/amli-tools',
    },
    started: '2025-08',
    updated: '2026-09',
  },
  {
    id: 'portfolio-v2',
    name: 'Portfolio v2',
    description: 'This developer workspace portfolio — built as a polished developer operating system with terminal, command palette, and knowledge graph.',
    category: 'developer-tools',
    status: 'building',
    technologies: ['React 19', 'TypeScript', 'Tailwind CSS', 'Vite', 'Netlify'],
    links: {
      source: 'https://github.com/Dikshit-Sharma/portfoliov1',
    },
    started: '2026-09',
    updated: '2026-09',
  },
  {
    id: 'repo-scope',
    name: 'RepoScope Edge Extension',
    description: 'Microsoft Edge extension for GitLab analytics — project overview, contributors, commit activity, CI status, 3D graph visualization.',
    category: 'developer-tools',
    status: 'stable',
    technologies: ['TypeScript', 'WebExtensions API', 'GitLab API', 'Three.js'],
    links: {
      live: 'https://microsoftedge.microsoft.com/addons/detail/reposcope/oaimoakbhmeehijoncpbijcdpinhndof',
    },
    started: '2025-10',
    updated: '2026-05',
  },
]

export function getLabProjects(category?: LabProject['category']): LabProject[] {
  if (!category) return labProjects
  return labProjects.filter((p) => p.category === category)
}

export function getLabProject(id: string): LabProject | undefined {
  return labProjects.find((p) => p.id === id)
}

export const labCategories = [
  { id: 'developer-tools', label: 'Developer Tools', emoji: '🔧' },
  { id: 'ai', label: 'AI', emoji: '🤖' },
  { id: 'linux', label: 'Linux', emoji: '🐧' },
  { id: 'automation', label: 'Automation', emoji: '⚙️' },
  { id: 'experiments', label: 'Experiments', emoji: '🧪' },
  { id: 'archived', label: 'Archived', emoji: '📦' },
] as const

export const labStatuses = {
  building: { label: 'BUILDING', color: 'text-amber-400', dot: 'bg-amber-400' },
  experiment: { label: 'EXPERIMENT', color: 'text-violet-400', dot: 'bg-violet-400' },
  stable: { label: 'STABLE', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  archived: { label: 'ARCHIVED', color: 'text-zinc-500', dot: 'bg-zinc-500' },
} as const