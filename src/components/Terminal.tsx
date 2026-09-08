import { useEffect, useRef, useState } from 'react'
import { X, ChevronUp } from 'lucide-react'
import { useCommand } from '@/components/CommandPalette'
import { projects } from '@/data/projects'
import { site, heroStack, skillGroups } from '@/data/site'
import { experience } from '@/data/experience'
import { labProjects } from '@/data/lab'
import { nowData } from '@/data/now'
import { changelog, getLatestVersion } from '@/data/changelog'
import { registry, searchRegistry } from '@/lib/registry'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type TerminalCommand = {
  name: string
  description: string
  usage?: string
  run: (args: string[]) => TerminalOutput
}

type TerminalOutput = {
  lines: (string | { type: 'badge'; text: string; color?: string } | { type: 'link'; text: string; href: string } | { type: 'header'; text: string } | { type: 'list'; items: string[] })[]
  error?: boolean
}

/** Non-verbose aliases that resolve to canonical commands. */
const COMMAND_ALIASES: Record<string, string> = {
  work: 'projects',
  proj: 'projects',
  exp: 'experience',
  tech: 'skills',
  ls: 'projects',
  contacts: 'contact',
  info: 'inspect',
}

export function Terminal({ onClose }: { onClose: () => void }) {
  const { modKey } = useCommand()
  const [output, setOutput] = useState<TerminalOutput>({
    lines: [
      { type: 'header', text: 'DIKSHIT@WORKSPACE' },
      { type: 'header', text: '────────────────────────────────────────' },
      '',
      'Type "help" for available commands.',
      'Type "inspect" for portfolio information.',
      '',
    ],
  })
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyPos, setHistoryPos] = useState(-1)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  const commands: Record<string, TerminalCommand> = {
    help: {
      name: 'help',
      description: 'Show available commands',
      run: () => ({
        lines: [
          { type: 'header', text: 'AVAILABLE COMMANDS' },
          '',
          { type: 'header', text: 'Navigation' },
          '  help           Show this help message',
          '  about          Show about information',
          '  projects       List all projects',
          '  experience     Show work experience',
          '  skills         List technical skills',
          '  stack          Show technology stack',
          '  lab            Show experimental projects',
          '  now            Show current focus',
          '  github         Open GitHub profile',
          '  resume         Download resume',
          '  contact        Show contact information',
          '  changelog      View version history',
          '',
          { type: 'header', text: 'Actions' },
          '  clear          Clear terminal',
          '  inspect        Show portfolio tech stack',
          '  neofetch       Show system info',
          '  sudo hire dikshit  Easter egg',
          '',
          { type: 'header', text: 'Aliases & Search' },
          '  work / proj    Same as projects',
          '  exp            Same as experience',
          '  tech           Same as skills',
          '  knowledge      List knowledge categories',
          '  search <query> Search projects, tech, experience, knowledge',
          '',
          { type: 'header', text: 'Shortcuts' },
          `  ${modKey}+K         Command palette`,
          '  T              Open terminal',
          '  ?              Show shortcuts',
          `  G+P/E/L/N/K/D/C  Navigate to pages`,
          '  R              Download resume',
        ],
      }),
    },
    about: {
      name: 'about',
      description: 'Show about information',
      run: () => ({
        lines: [
          { type: 'header', text: 'ABOUT' },
          '',
          `  ${site.fullName}`,
          `  ${site.title}`,
          '',
          site.tagline,
          '',
          'Focus: Backend engineering with Java/Spring, Cloud-native services on AWS,',
          'Microservices and REST APIs, Developer productivity tooling',
          '',
          'Outside of sprint work, I like building personal developer tools that take',
          'repetitive engineering workflows — documentation, credentials, encryption,',
          'tracking, analytics — and turn them into something faster to use.',
        ],
      }),
    },
    projects: {
      name: 'projects',
      description: 'List all projects',
      run: () => ({
        lines: [
          { type: 'header', text: `PROJECTS (${projects.length} total)` },
          '',
          ...projects.map((p, i) => [
            `  ${String(i + 1).padStart(2, '0')}  ${p.name}`,
            `       ${p.kicker}`,
            `       ${p.description}`,
            `       ${p.technologies.slice(0, 5).join(', ')}${p.technologies.length > 5 ? '...' : ''}`,
            '',
          ]).flat(),
        ],
      }),
    },
    experience: {
      name: 'experience',
      description: 'Show work experience',
      run: () => ({
        lines: [
          { type: 'header', text: 'EXPERIENCE' },
          '',
          ...experience.flatMap((entry) => [
            `  ${entry.title} — ${entry.company}`,
            `  ${entry.period}${entry.location ? ` · ${entry.location}` : ''}`,
            `  ${entry.description}`,
            '',
          ]),
        ],
      }),
    },
    skills: {
      name: 'skills',
      description: 'List technical skills',
      run: () => ({
        lines: [
          { type: 'header', text: 'TECHNICAL SKILLS' },
          '',
          ...skillGroups.map((group) => [
            `  ${group.label}:`,
            `  ${group.items.join(', ')}`,
            '',
          ]).flat(),
        ],
      }),
    },
    stack: {
      name: 'stack',
      description: 'Show technology stack',
      run: () => ({
        lines: [
          { type: 'header', text: 'PRIMARY STACK' },
          '',
          ...heroStack.map((tech) => `  ${tech}`),
          '',
          { type: 'header', text: 'AMLI TOOLS STACK' },
          '',
          ...['React 19', 'React Router 7', 'Vite', 'JavaScript', 'Firebase Firestore', 'Netlify Functions', 'Firebase Cloud Functions', 'GitLab API', 'Groq API', 'LLaMA 3.3 70B', 'SendGrid', 'Firebase Analytics', 'Sentry', 'Microsoft Edge Extension', 'Three.js'].map((tech) => `  ${tech}`),
        ],
      }),
    },
    lab: {
      name: 'lab',
      description: 'Show experimental projects',
      run: () => ({
        lines: [
          { type: 'header', text: 'EXPERIMENTAL LAB' },
          '',
          'Things I\'m building because they seemed interesting.',
          '',
          ...labProjects.map((p) => [
            `  ${p.name}  ${p.status.toUpperCase()}`,
            `  ${p.description}`,
            `  Stack: ${p.technologies.join(', ')}`,
            '',
          ]).flat(),
        ],
      }),
    },
    now: {
      name: 'now',
      description: 'Show current focus',
      run: () => ({
        lines: [
          { type: 'header', text: `NOW — ${nowData.updated}` },
          '',
          { type: 'header', text: 'CURRENTLY BUILDING' },
          ...nowData.building.map((item) => `  → ${item}`),
          '',
          { type: 'header', text: 'LEARNING' },
          ...nowData.learning.map((item) => `  → ${item}`),
          '',
          { type: 'header', text: 'EXPERIMENTING' },
          ...nowData.experimenting.map((item) => `  → ${item}`),
          '',
          { type: 'header', text: 'READING' },
          ...(nowData.reading || []).map((item) => `  → ${item}`),
          '',
        ],
      }),
    },
    github: {
      name: 'github',
      description: 'Open GitHub profile',
      run: () => {
        window.open(site.github, '_blank', 'noreferrer')
        return { lines: ['Opening GitHub...'] }
      },
    },
    linkedin: {
      name: 'linkedin',
      description: 'Open LinkedIn profile',
      run: () => {
        window.open(site.linkedin, '_blank', 'noreferrer')
        return { lines: ['Opening LinkedIn...'] }
      },
    },
    resume: {
      name: 'resume',
      description: 'Download resume',
      run: () => {
        window.open(site.resumePath, '_blank', 'noreferrer')
        return { lines: ['Downloading resume...'] }
      },
    },
    contact: {
      name: 'contact',
      description: 'Show contact information',
      usage: 'contact | email',
      run: () => ({
        lines: [
          { type: 'header', text: 'CONTACT' },
          '',
          `  Email: ${site.email}`,
          `  GitHub: ${site.github}`,
          `  LinkedIn: ${site.linkedin}`,
          '',
          '  Prefer email for opportunities and collaborations.',
          '',
        ],
      }),
    },
    changelog: {
      name: 'changelog',
      description: 'View version history',
      run: () => ({
        lines: [
          { type: 'header', text: 'CHANGELOG' },
          '',
          ...changelog.slice(0, 3).flatMap((entry) => [
            `  ${entry.version} — ${entry.date}`,
            ...entry.changes.added.map((c) => `  + ${c}`),
            ...entry.changes.changed.map((c) => `  ~ ${c}`),
            ...entry.changes.fixed.map((c) => `  # ${c}`),
            '',
          ]),
          '  ... and more. Use "changelog full" for complete history.',
        ],
      }),
    },
    knowledge: {
      name: 'knowledge',
      description: 'Show knowledge categories',
      run: () => ({
        lines: [
          { type: 'header', text: 'KNOWLEDGE' },
          '',
          ...registry
            .filter((entity) => entity.type === 'knowledge')
            .flatMap((entity) => [
              { type: 'link' as const, text: `  ${entity.label} — ${entity.description}`, href: `#${entity.path}` },
              '',
            ]),
          '  Tip: open the Knowledge page for the interactive graph.',
          '',
        ],
      }),
    },
    search: {
      name: 'search',
      description: 'Search projects, technologies, experience, knowledge',
      usage: 'search <query>',
      run: (args) => {
        const q = args.join(' ')
        if (!q) {
          return {
            lines: ['Usage: search <query>', 'Example: search spring', 'Example: search java'],
            error: true,
          }
        }
        const results = searchRegistry(q, 8)
        if (results.length === 0) {
          return { lines: [`No results for "${q}". Try "search java" or "search project".`] }
        }
        return {
          lines: [
            { type: 'header', text: `SEARCH · ${results.length} RESULT${results.length === 1 ? '' : 'S'}` },
            '',
            ...results.flatMap((r) => [
              { type: 'link' as const, text: `  ${r.label}`, href: `#${r.path}` },
              { type: 'link' as const, text: `       ${r.description}`, href: `#${r.path}` },
              '',
            ]),
          ],
        }
      },
    },
    clear: {
      name: 'clear',
      description: 'Clear terminal',
      run: () => ({ lines: [] }),
    },
    inspect: {
      name: 'inspect',
      description: 'Show portfolio tech stack',
      run: () => ({
        lines: [
          { type: 'header', text: 'THIS WEBSITE' },
          '',
          '  Frontend:     React 19 / TypeScript',
          '  Styling:      Tailwind CSS 4',
          '  Build:        Vite',
          '  Hosting:      Netlify',
          '  Fonts:        IBM Plex Sans / IBM Plex Mono',
          '  Icons:        Lucide React',
          '',
          '  Integrations:',
          '  GitHub API    Contribution data, repos, profile',
          '  Obsidian      Vault categories, notes, markdown export',
          '  AMLI Tools    Encrypted journal, artifacts, BSA, credentials',
          '  Netlify Blobs Cached dashboard snapshots',
          '  Netlify Funcs Serverless API endpoints',
          '',
          '  Architecture: SPA with hash routing, serverless functions, client-side encryption',
          '',
          '  Built with:   Linux + code + caffeine',
        ],
      }),
    },
    neofetch: {
      name: 'neofetch',
      description: 'Show system info',
      run: () => ({
        lines: [
          { type: 'header', text: 'DIKSHIT@WORKSPACE' },
          '  ────────────────────────────────────────',
          `  Role:       Software Engineer`,
          `  Stack:      Java / Spring Boot / AWS / React`,
          `  Cloud:      AWS (ECS, Lambda, RDS, DynamoDB, SQS, SNS)`,
          `  Projects:   ${projects.length} (${projects.filter(p => p.featured).length} featured)`,
          `  OS:         Linux (daily driver)`,
          `  Editor:     VS Code / IntelliJ IDEA`,
          `  Shell:      zsh`,
          `  Portfolio:  v${getLatestVersion().replace('v', '')}`,
          '',
        ],
      }),
    },
    sudo: {
      name: 'sudo',
      description: 'Execute command as superuser',
      run: (args) => {
        if (args[0] === 'hire' && args[1] === 'dikshit') {
          return {
            lines: [
              '',
              '[sudo] password for recruiter:',
              '',
              'Nice try.',
              '',
              'You already have sufficient privileges.',
              '',
              'Loading resume...',
              '',
              { type: 'link', text: '  [ VIEW RESUME ]', href: site.resumePath },
              { type: 'link', text: '  [ CONTACT ME ]', href: `mailto:${site.email}` },
              '',
            ],
          }
        }
        return {
          lines: [`sudo: ${args.join(' ')}: command not found`],
          error: true,
        }
      },
    },
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    const cmd = input.trim()
    setHistory((h) => [...h, cmd])
    setHistoryPos(-1)
    setInput('')

    const parts = cmd.split(/\s+/)
    const name = parts[0].toLowerCase()
    const args = parts.slice(1)

    const resolved = COMMAND_ALIASES[name] ?? name
    const command = commands[resolved]
    let result: TerminalOutput

    if (command) {
      result = command.run(args)
    } else {
      result = {
        lines: [`${name}: command not found`, 'Type "help" for available commands.'],
        error: true,
      }
    }

    setOutput((prev) => ({
      lines: [
        ...prev.lines,
        { type: 'header', text: `$ ${cmd}` },
        '',
        ...result.lines,
      ],
    }))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const newPos = historyPos === -1 ? history.length - 1 : Math.max(0, historyPos - 1)
      setHistoryPos(newPos)
      setInput(history[newPos])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyPos === -1) return
      const newPos = historyPos === history.length - 1 ? -1 : historyPos + 1
      setHistoryPos(newPos)
      setInput(newPos === -1 ? '' : history[newPos])
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const matches = Object.keys(commands).filter((c) => c.startsWith(input.toLowerCase()))
      if (matches.length === 1) {
        setInput(matches[0] + ' ')
      } else if (matches.length > 1) {
        setSuggestions(matches)
        setShowSuggestions(true)
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const renderOutput = (line: TerminalOutput['lines'][0]) => {
    if (typeof line === 'string') {
      return <div className="font-mono text-sm text-[var(--color-fg)]">{line}</div>
    }
    if (line.type === 'header') {
      return <div className="font-mono text-sm text-indigo-400">{line.text}</div>
    }
    if (line.type === 'badge') {
      return (
        <Badge style={{ color: line.color || 'var(--color-accent)', borderColor: `${line.color || 'var(--color-accent)'}55` }}>
          {line.text}
        </Badge>
      )
    }
    if (line.type === 'link') {
      const isExternal = line.href.startsWith('http')
      return (
        <a
          href={line.href}
          {...(isExternal ? { target: '_blank', rel: 'noreferrer' } : {})}
          className="font-mono text-sm text-indigo-400 hover:underline"
        >
          {line.text}
        </a>
      )
    }
    if (line.type === 'list') {
      return (
        <div className="ml-4 space-y-1">
          {line.items.map((item, i) => (
            <div key={i} className="font-mono text-sm text-[var(--color-fg-muted)]">{item}</div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div
      ref={terminalRef}
      className="fixed bottom-0 left-0 right-0 z-50 max-h-[70vh] border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.8)]"
      role="dialog"
      aria-label="Terminal"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-[#28c840]" aria-hidden="true" />
          <p className="ml-2 font-mono text-[11px] text-[var(--color-fg-muted)]">dikshit@workspace</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close terminal">
            <X className="size-4" />
          </Button>
        </div>
      </div>

      <div className="h-[calc(70vh_-_48px)] overflow-y-auto p-4 font-mono text-sm">
        {output.lines.map((line, i) => (
          <div key={i} className="mb-1">{renderOutput(line)}</div>
        ))}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute bottom-full left-4 right-4 mb-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-xl max-h-40 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setInput(s + ' '); setShowSuggestions(false); }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--color-bg-muted)]"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-[var(--color-border)] px-4 py-2">
        <span className="text-indigo-400 shrink-0">$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSuggestions(false); }}
          onKeyDown={handleKeyDown}
          placeholder="type a command…"
          className="flex-1 bg-transparent text-sm outline-none font-mono"
          autoComplete="off"
          spellCheck={false}
        />
        {showSuggestions && suggestions.length > 0 && (
          <ChevronUp className="size-4 text-[var(--color-fg-muted)]" />
        )}
      </form>
    </div>
  )
}