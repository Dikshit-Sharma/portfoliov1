#!/usr/bin/env node
/**
 * Generates dashboard data from the Obsidian vault at
 *   ~/Entertainment/Obsidian/Void
 *
 * Walks every top-level folder (except the password-protected AMLI_Vault) and maps each
 * folder to a category. Produces:
 *   - src/data/obsidian.generated.ts        manifest (small, imported by the app)
 *   - public/obsidian-data/<id>.json        full note content per category (loaded on demand)
 *
 * Run:  node scripts/obsidian-generator.mjs
 */
import { readdirSync, statSync, readFileSync, existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, extname } from 'node:path';
import { homedir } from 'node:os';

const VAULT = process.env.OBSIDIAN_VAULT || join(homedir(), 'Entertainment', 'Obsidian', 'Void');
const SRC_OUT = new URL('../src/data/obsidian.generated.ts', import.meta.url);
const DATA_DIR = new URL('../public/obsidian-data/', import.meta.url);

// Folders we never surface publicly (config + company data).
const IGNORE = new Set(['.git', '.obsidian', 'Attachments', 'AMLI_Vault']);

const CATEGORY_DEFAULTS = {
  Meldora_Novel_Vault: {
    id: 'meldora',
    label: 'Meldora Novel',
    emoji: '📖',
    color: '#a78bfa',
    description: 'Fantasy novel project — manuscript, characters, worldbuilding, power systems and plot.',
  },
  Cognizant: {
    id: 'cognizant',
    label: 'Cognizant',
    emoji: '💼',
    color: '#34d399',
    description: 'Employment snapshots and Jira ticket tracking.',
  },
  'PROJECT IDEAS': {
    id: 'project-ideas',
    label: 'Project Ideas',
    emoji: '💡',
    color: '#fbbf24',
    description: 'Future project planning and ideas.',
  },
};

function walk(folder, base) {
  const notes = [];
  let files = 0;
  let dirs = 0;
  let list;
  try { list = readdirSync(folder); } catch { return { notes: [], files: 0, dirs: 0 }; }
  for (const entry of list) {
    if (entry.startsWith('.')) continue;
    const full = join(folder, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      dirs++;
      const sub = walk(full, base);
      notes.push(...sub.notes);
      files += sub.files;
      dirs += sub.dirs;
    } else if (st.isFile() && extname(entry) === '.md') {
      files++;
      notes.push(describeNote(full, base));
    }
  }
  return { notes, files, dirs };
}

function describeNote(full, base) {
  const rel = full.slice(base.length + 1);
  let title = rel.replace(/\.md$/, '').split('/').pop() || rel;
  let heading = '';
  let excerpt = '';
  let content = '';
  try {
    const raw = readFileSync(full, 'utf8');
    content = raw;
    const lines = raw.split(/\r?\n/);
    for (const line of lines) {
      const h = line.match(/^#\s+(.+)/);
      if (h) { heading = h[1].trim(); break; }
    }
    // Extract first non-frontmatter, non-empty content line as excerpt.
    let body = lines;
    if (lines[0]?.trim() === '---') {
      const end = lines.slice(1).findIndex((l) => l.trim() === '---');
      body = end >= 0 ? lines.slice(end + 2) : [];
    }
    for (const line of body) {
      const t = line.trim();
      if (t && !t.startsWith('#') && !t.startsWith('>') && !t.startsWith('---')) {
        excerpt = t.replace(/[#*`|]/g, '').slice(0, 200);
        break;
      }
    }
  } catch { /* ignore */ }
  // Sanitize Obsidian wikilinks for display but keep raw content for export.
  return { title, path: rel, heading: heading || title, excerpt, content };
}

function build() {
  if (!existsSync(VAULT)) {
    console.error(`Vault not found at ${VAULT}. Set OBSIDIAN_VAULT to override.`);
    process.exit(1);
  }
  const entries = readdirSync(VAULT).filter((n) => !IGNORE.has(n)).sort();
  const categories = [];
  let totalNotes = 0;
  const now = new Date().toISOString();

  mkdirSync(DATA_DIR, { recursive: true });
  // Clear stale generated data.
  for (const f of readdirSync(DATA_DIR)) rmSync(join(DATA_DIR.pathname, f), { force: true });

  for (const folder of entries) {
    const full = join(VAULT, folder);
    const st = statSync(full);
    if (!st.isDirectory()) continue;
    const { notes, files, dirs } = walk(full, VAULT);
    const def = CATEGORY_DEFAULTS[folder] || {};
    const id = def.id || folder.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Sort notes: any README/Synopsis first, then by name.
    notes.sort((a, b) => {
      const aIsTop = /^(README|Synopsis|Dashboard)/i.test(a.title);
      const bIsTop = /^(README|Synopsis|Dashboard)/i.test(b.title);
      if (aIsTop && !bIsTop) return -1;
      if (bIsTop && !aIsTop) return 1;
      return a.title.localeCompare(b.title);
    });

    categories.push({
      id,
      label: def.label || folder,
      emoji: def.emoji || '📁',
      color: def.color || '#60a5fa',
      description: def.description || '',
      folder,
      noteCount: notes.length,
      fileCount: files,
      subfolderCount: dirs,
      dataUrl: `obsidian-data/${id}.json`,
    });
    totalNotes += notes.length;

    const dataFile = join(DATA_DIR.pathname, `${id}.json`);
    writeFileSync(
      dataFile,
      JSON.stringify({
        category: id,
        label: def.label || folder,
        generatedAt: now,
        notes: notes.map((n) => ({ title: n.title, path: n.path, heading: n.heading, content: n.content })),
      }),
    );
  }

  const header = `// AUTO-GENERATED by scripts/obsidian-generator.mjs — do not edit.
// Generated: ${now}
// Vault   : ${VAULT}

import type { ObsidianCategory } from '@/dashboard/lib/obsidian'

export const obsidianCategories: ObsidianCategory[] = `;

  const body = JSON.stringify(categories.map((c) => ({ ...c, generatedAt: now })), null, 2);
  const footer = `

export const obsidianGeneratedAt = ${JSON.stringify(now)}
export const obsidianTotalNotes = ${totalNotes}
`;

  writeFileSync(SRC_OUT, header + body + footer);
  console.log(`Wrote manifest: ${SRC_OUT.pathname || SRC_OUT}`);
  console.log(`Wrote ${categories.length} category data files under public/obsidian-data/`);
  console.log(`Categories: ${categories.length}, total notes: ${totalNotes}`);
}

build();