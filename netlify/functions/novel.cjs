// Obsidian vault sync from GitHub (the whole vault is pushed to Dikshit-Sharma/novel).
//
//   GET /api/novel                 → the latest snapshot (blob-cached, refreshed daily)
//   GET /api/novel?sync=1          → force refresh now, then return fresh data
// Scheduled 05:30 UTC (netlify.toml) → refresh + persist to Netlify Blob store.
//
// Requires GITHUB_TOKEN (repo:read) since the vault repo is private.
const { getStore } = require('@netlify/blobs');

const STORE = 'obsidian-github';
const SNAPSHOT_KEY = 'vault-v1';
// The content cache holds raw note text keyed by (path -> sha/content) so the
// daily sync can skip re-downloading unchanged blobs. It is stored under a
// SEPARATE key and is NEVER included in the served snapshot, because the raw
// text includes private (non-`public: true`) notes that must not leave the server.
const CACHE_KEY = 'vault-cache-v1';
const FRESH_MS = 26 * 60 * 60 * 1000; // 26h

const DEFAULT_REPO = process.env.OBSIDIAN_REPO || 'Dikshit-Sharma/novel';
const IGNORED_TOP = new Set(['.obsidian', '.git', 'Attachments', 'AMLI_Vault']);
const GITHUB = 'https://api.github.com';

const ALLOWED_ORIGINS = ['https://dikshitsharma.netlify.app', 'https://portfoliov1.netlify.app', 'http://localhost:5173', 'http://localhost:8888'];

// Extract YAML frontmatter from markdown content.
function parseFrontmatter(content) {
  const lines = content.split(/\r?\n/);
  if (lines[0]?.trim() !== '---') return null;
  const end = lines.slice(1).findIndex((l) => l.trim() === '---');
  if (end < 0) return null;
  const fmLines = lines.slice(1, end + 1).join('\n');
  const fm = {};
  for (const line of fmLines.split(/\r?\n/)) {
    const m = line.match(/^\s*([^:]+?)\s*:\s*(.+)\s*$/);
    if (m) {
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (val === 'true' || val === 'false') val = val === 'true';
      fm[m[1].trim()] = val;
    }
  }
  return fm;
}

function isPublicNote(frontmatter) {
  if (!frontmatter) return false;
  return frontmatter.public === true || frontmatter.public === 'true';
}

function headers() {
  const h = { 'User-Agent': 'dashboard', Accept: 'application/vnd.github+json' };
  const token = process.env.GITHUB_TOKEN || '';
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

function corsFor(event) {
  const origin = (event.headers && event.headers.origin) || ''
  if (ALLOWED_ORIGINS.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  }
  return {}
}

function ok(event, data, status) {
  return {
    statusCode: status || 200,
    headers: { 'Content-Type': 'application/json', ...corsFor(event) },
    body: JSON.stringify(data),
  }
}

function err(event, status, msg) {
  return ok(event, { error: msg || 'Internal server error' }, status || 500)
}

async function readSnapshot() {
  try {
    const store = getStore(STORE);
    const snap = await store.getJSON(SNAPSHOT_KEY);
    if (!snap || !snap.sampledAt) return null;
    const age = Date.now() - new Date(snap.sampledAt).getTime();
    if (age > FRESH_MS) return null;
    return snap;
  } catch {
    return null;
  }
}

async function writeSnapshot(snap) {
  try {
    const store = getStore(STORE);
    await store.setJSON(SNAPSHOT_KEY, snap);
  } catch { /* best effort */ }
}

// Content cache (private note text) is kept separate from the public snapshot
// and is never returned to callers. We serialize it ourselves so the served
// snapshot object never carries raw vault content.
async function readCache() {
  try {
    const store = getStore(STORE);
    const cache = await store.getJSON(CACHE_KEY);
    return cache && typeof cache.files === 'object' ? cache.files : {};
  } catch {
    return {};
  }
}

async function writeCache(files) {
  try {
    const store = getStore(STORE);
    await store.setJSON(CACHE_KEY, { files });
  } catch { /* best effort */ }
}

// Clone-ish util: copyFileTree caches blobs by (path, sha) so unchanged files
// don't need to be re-downloaded on the daily sync.
async function resolveTree(repo) {
  const token = process.env.GITHUB_TOKEN || '';
  if (!token) {
    const e = new Error('GITHUB_TOKEN is required to read the private vault repo');
    e.code = 'NO_TOKEN';
    throw e;
  }

  const repoRes = await fetch(`${GITHUB}/repos/${repo}`, { headers: headers() });
  if (!repoRes.ok) {
    const e = new Error(`GitHub repo ${repo} is not accessible (${repoRes.status}). Is GITHUB_TOKEN set and the token granted access?`);
    e.code = 'REPO_NOT_FOUND';
    throw e;
  }
  const repoInfo = await repoRes.json();
  const branch = repoInfo.default_branch || 'main';

  const treeRes = await fetch(`${GITHUB}/repos/${repo}/git/trees/${branch}?recursive=1`, { headers: headers() });
  if (!treeRes.ok) throw new Error(`Failed to read repo tree (${treeRes.status})`);
  const treeData = await treeRes.json();

  return { branch, repoInfo, tree: treeData.tree || [] };
}

async function sync(repo) {
  const { branch, repoInfo, tree } = await resolveTree(repo);
  // Content dedupe reads the separate, never-served cache of raw note text.
  const previousCache = await readCache();

  // Flatten the tree into md blobs under a category.
  const categoryMap = new Map(); // folder -> { label, color, emoji, notes: [] }
  const files = {}; // path -> { sha, content } — cached text, kept server-side only
  const bySha = {}; // sha -> cached content (path-agnostic dedupe)

  const mdBlobs = tree.filter((t) => t.type === 'blob' && t.path.endsWith('.md'));
  const blobs = {};
  for (const t of tree) if (t.type === 'blob') blobs[t.path] = t;

  for (const t of mdBlobs) {
    // Root-level md files map to the repo name itself.
    const parts = t.path.split('/');
    const folder = parts.length > 1 ? parts[0] : repoInfo.name;
    if (IGNORED_TOP.has(folder)) continue;

    // Reuse cached content when the blob sha is unchanged.
    let content = previousCache[t.path] && previousCache[t.path].sha === t.sha
      ? previousCache[t.path].content
      : bySha[t.sha] && bySha[t.sha].sha === t.sha
        ? bySha[t.sha].content
        : null;

    if (content == null) {
      const rawRes = await fetch(`${GITHUB}/repos/${repo}/git/blobs/${t.sha}`, { headers: headers() });
      if (!rawRes.ok) continue; // skip unreadable file
      const raw = await rawRes.json();
      content = Buffer.from(raw.content, raw.encoding === 'base64' ? 'base64' : 'utf8').toString('utf8');
      if (raw.encoding === 'base64') bySha[t.sha] = { sha: t.sha, content };
    }
    files[t.path] = { sha: t.sha, content };
  }

  // Build categories sorted by folder, notes sorted by name for stability.
  // NOTE: content is derived from `files`, which is only ever persisted to the
  // server-side cache (writeCache). Private notes never enter the public snapshot.
  for (const t of mdBlobs) {
    const parts = t.path.split('/');
    const folder = parts.length > 1 ? parts[0] : repoInfo.name;
    if (IGNORED_TOP.has(folder) || !files[t.path]) continue;
    const file = files[t.path];

    // Skip notes that are not explicitly marked public: true
    const frontmatter = parseFrontmatter(file.content);
    if (!isPublicNote(frontmatter)) continue;

    const title = t.path.replace(/\.md$/, '').split('/').pop();
    let heading = title;
    let excerpt = '';
    const lines = file.content.split(/\r?\n/);
    for (const line of lines.slice(0, 30)) {
      const h = line.match(/^#\s+(.+)/);
      if (h) { heading = h[1].trim(); break; }
    }
    for (const line of lines.slice(0, 60)) {
      const x = line.trim();
      if (x && !x.startsWith('#') && !x.startsWith('>') && !x.startsWith('---') && !x.startsWith('|')) {
        excerpt = x.replace(/[#*`|]/g, '').slice(0, 160);
        break;
      }
    }
    if (!categoryMap.has(folder)) categoryMap.set(folder, { label: folder, notes: [] });
    categoryMap.get(folder).notes.push({ title, path: t.path, heading, excerpt, content: file.content });
  }

  const colors = ['#34d399', '#a78bfa', '#60a5fa', '#fbbf24', '#f472b6', '#34d399', '#22d3ee', '#f87171'];
  const emojis = ['💼', '📖', '📔', '💡', '📁', '🗂️', '🧪', '📌'];
  const categories = [...categoryMap.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([name, cat], i) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    label: name,
    emoji: emojis[i % emojis.length],
    color: colors[i % colors.length],
    notes: cat.notes,
  }));

  // Persist raw note text to the separate, never-served cache for next-time dedupe.
  await writeCache(files);

  // The served snapshot contains ONLY public, published data.
  const snapshot = {
    repo,
    branch,
    sampledAt: new Date().toISOString(),
    commit: repoInfo.pushed_at || null,
    totalNotes: categories.reduce((s, c) => s + c.notes.length, 0),
    categories,
  };
  await writeSnapshot(snapshot);
  return snapshot;
}

const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: { ...corsFor(event) }, body: '' };

  const headers = event.headers || {};
  const origin = headers.origin || '';

  // Real Netlify scheduled invocations carry a scheduled marker header; a plain
  // anonymous POST (no marker) must NOT be treated as a privileged scheduled run.
  const isScheduled =
    event.httpMethod === 'POST' &&
    (headers['x-nf-scheduled'] || headers['x-nf-event'] === 'scheduled');
  const force = event.httpMethod === 'GET' && event.queryStringParameters && event.queryStringParameters.sync === '1';
  const repo = DEFAULT_REPO;

  // Browser requests must come from an allowlisted origin.
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return err(event, 403, 'Origin not allowed');
  }

  try {
    // On-demand force-refresh is privileged: allow genuine scheduler runs or
    // allowlisted-origin requests (the dashboards's own "sync now" action).
    const authorizedWrite = isScheduled || Boolean(origin);

    if ((isScheduled || force) && authorizedWrite) {
      const snapshot = await sync(repo);
      return ok(event, { ok: true, sampledAt: snapshot.sampledAt, totalNotes: snapshot.totalNotes });
    }

    if (event.httpMethod === 'GET') {
      const cached = await readSnapshot();
      if (cached) return ok(event, { ...cached, fromCache: true });
      // No fresh snapshot: try a live sync so the first visit populates it.
      const snapshot = await sync(repo);
      return ok(event, snapshot);
    }
    return err(event, 405, 'Method not allowed');
  } catch {
    return err(event, 500, 'Sync failed');
  }
};

module.exports = { handler, sync };