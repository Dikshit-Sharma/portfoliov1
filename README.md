# Dikshit — Developer Workspace

> A personalized developer operating system inspired by my Arch Linux + Hyprland environment.
> The portfolio is the content; the workspace is the product.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Dikshit-Sharma/portfoliov1)

## Workspaces

| Workspace | Key | Route | Focus |
|-----------|-----|-------|-------|
| **1  Work** | `Super+1` / `G P` | `/#/work` | Professional projects & deep dives |
| **2  Lab** | `Super+2` / `G L` | `/#/lab` | Experiments & personal engineering |
| **3  Knowledge** | `Super+3` / `G K` | `/#/knowledge` | Obsidian notes, knowledge graph |
| **4  System** | `Super+4` / `G S` | `/#/system` | Architecture, integrations, changelog |

Auxiliary views: `Now` (`G N`), `Experience` (`G E`), `Recruiter Mode`, `Contact` (`G C`), `Changelog`, `Dashboard` (`G D`).

## Quick Start

```bash
npm install
npm run dev
```

Open the dev server (default `http://localhost:5173`).

### Recruiter Mode

`/#/recruiter` — a focused, fast-scanning professional profile window. No terminal, no graph, no dashboard. Just role, stack, experience, impact, projects, resume, contact.

### Dashboard (Private)

`/#/dashboard` — password-gated Developer Control Center: GitHub activity, encrypted journal, Obsidian browser, AMLI Vault work data. Set `DASHBOARD_PASSWORD` in Netlify.

## Keyboard Interface

| Key | Action |
|-----|--------|
| `Ctrl+K` / `⌘K` | Command palette (fuzzy search: projects, tech, pages, commands) |
| `T` | Open terminal |
| `?` | Shortcuts help |
| `G` then `P/E/L/N/K/S/D/C` | Navigate to Workspace / Page |
| `R` | Download resume |
| `Super+1..4` | Switch workspace (desktop) |

## Architecture

```text
Browser (React 19 SPA)
    │
    ▼
Netlify Edge (static assets + SPA redirects)
    │
    ├── /api/auth      → password verification (rate-limited, timing-safe)
    ├── /api/github    → GitHub profile/repos/contributions (GraphQL with token, REST fallback)
    ├── /api/amli      → AMLI stats (cached, auth-gated details)
    ├── /api/amli-sync → scheduled daily refresh (05:30 UTC)
    └── /api/novel     → Obsidian vault sync (public: true only)
```

## Data Model

- **Projects** (`src/data/projects.ts`) — case studies with deep dives
- **Experience** (`src/data/experience.ts`) — roles, bullets, stack
- **Impact** (`src/data/impact.ts`) — metrics with source + context
- **Lab** (`src/data/lab.ts`) — experimental work
- **Now** (`src/data/now.ts`) — current focus
- **Changelog** (`src/data/changelog.ts`) — version history
- **Obsidian** — generated manifest + public JSON bundles (`public/obsidian-data/`)

### Relationship Engine

All entities are cross-linked (project ↔ technology ↔ experience ↔ impact ↔ knowledge). The `registry` powers the command palette and terminal search; `inspectEntity()` surfaces connections in the Entity Inspector (right panel).

## Obsidian Publishing

```bash
npm run gen:obsidian
```

Scans `~/Entertainment/Obsidian/Void` (excludes `AMLI_Vault`, `.obsidian`, `.git`), extracts notes with `public: true` frontmatter, writes:

- `src/data/obsidian.generated.ts` — category manifest
- `public/obsidian-data/<category>.json` — full note content (lazy-loaded)

**Private notes never leave the server.** The generator enforces the `public: true` gate; a build fails if a private note would be included.

## Security

| Layer | Mechanism |
|-------|-----------|
| **Auth** | Server-side `DASHBOARD_PASSWORD` via `/api/auth` (5 tries / 15 min, timing-safe, non-spoofable IP) |
| **Journal** | Client-side AES-256-GCM (PBKDF2 150k) in localStorage — password never leaves browser |
| **AMLI details** | Protected by `X-Dashboard-Auth` header (sha256 of password) — not served without auth |
| **Obsidian** | Only `public: true` notes are published; `novel.cjs` stores raw content in a separate, never-served cache |
| **Functions** | CORS allowlist only, no error leakage, rate limits, SSRF-safe fixed URLs |

## Netlify Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DASHBOARD_PASSWORD` | ✅ | Unlocks journal + AMLI details |
| `GITHUB_TOKEN` | Recommended | GitHub heatmap, higher rate limits |
| `GITHUB_USERNAME` | No | Default `Dikshit-Sharma` |
| `AMLI_ARTIFACTS_URL` | Optional | Override AMLI artifacts endpoint |
| `AMLI_BSA_URL` | Optional | Override AMLI BSA endpoint |
| `AMLI_API_KEY` | Optional | X-API-Key for AMLI service |
| `OBSIDIAN_REPO` | No | Vault repo for `novel.cjs` (default `Dikshit-Sharma/novel`) |
| `VITE_DEV_DASHBOARD_PASSWORD` | Dev only | Local dev password fallback |

## CI

GitHub Actions (`.github/workflows/ci.yml`): `npm ci → lint → build` on every push/PR.

## Design Principles

- **OS-first, portfolio-second** — workspace metaphor everywhere (top bar = Waybar, status bar, workspaces, window chrome)
- **No fabricated data** — no fake uptime, no fake connection status, no mock graph edges
- **Relationships everywhere** — TechBadge opens inspector → projects/experience/knowledge using that tech
- **Dark-first** — IBM Plex Sans/Mono, indigo accent, reduced motion support
- **Mobile-native** — bottom nav, touch-friendly graph, responsive workspace switcher

## License

MIT — code only. Content (resume, notes, project details) is personal and not licensed for reuse.