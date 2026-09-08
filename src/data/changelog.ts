export interface ChangelogEntry {
  version: string
  date: string
  changes: {
    added: string[]
    changed: string[]
    fixed: string[]
    removed: string[]
  }
}

export const changelog: ChangelogEntry[] = [
  {
    version: 'v2.0.0',
    date: 'Sep 2026',
    changes: {
      added: [
        'Developer Workspace concept with persistent navigation',
        'Command palette with fuzzy search (⌘K)',
        'Global keyboard shortcuts (G+P, G+E, T, R, ?)',
        'Interactive terminal component',
        'Projects case-study view with deep dives',
        'Interactive architecture explorer',
        'Technology/skill graph with evidence',
        'Impact/proof section with metrics',
        'Engineering timeline for experience',
        '/lab page for experimental work',
        '/now page for current focus',
        '/knowledge page with Obsidian graph',
        '/recruiter mode for quick scanning',
        'Recruiter mode (command palette / /recruiter)',
        'Terminal easter eggs: inspect, sudo hire dikshit',
        'Custom 404 page with terminal aesthetic',
        'Theme system: Dark, Light, System',
        'Changelog page',
        'Structured data architecture (projects, experience, lab, now)',
      ],
      changed: [
        'Hero upgraded to Live Developer Workspace',
        'Navbar simplified with new page links',
        'Projects section redesigned with case studies',
        'Skills section enhanced with technology connections',
        'Dashboard relabeled as Developer Control Center',
        'Command palette now searches projects, tech, pages, commands',
      ],
      fixed: [
        'Mobile navigation redesigned with floating command button',
        'Reduced motion support across all animations',
        'Accessibility improvements (ARIA, focus states, semantic HTML)',
        'Loading/error/empty states for all dynamic integrations',
      ],
      removed: [
        'Generic project cards as primary presentation',
        'Fake proficiency percentages in skills',
        'Matrix rain / excessive animations',
      ],
    },
  },
  {
    version: 'v1.1.0',
    date: 'Aug 2026',
    changes: {
      added: [
        'GitHub activity integration with contribution heatmap',
        'Obsidian vault browser with category navigation',
        'Encrypted journal with mood tracking',
        'AMLI Vault dashboard with password protection',
        'Netlify scheduled functions for daily syncs',
      ],
      changed: [
        'Dashboard tabs reorganized',
        'Theme system with IBM Plex fonts',
      ],
      fixed: [],
      removed: [],
    },
  },
  {
    version: 'v1.0.0',
    date: 'Jul 2026',
    changes: {
      added: [
        'Initial portfolio with Hero, About, Skills, Experience, Projects, Contact',
        'Dark/Light theme toggle',
        'Command palette (basic)',
        'AMLI Tools detail modal',
        'Architecture diagram component',
      ],
      changed: [],
      fixed: [],
      removed: [],
    },
  },
]

export function getChangelog(): ChangelogEntry[] {
  return changelog
}

export function getLatestVersion(): string {
  return changelog[0]?.version || 'v1.0.0'
}