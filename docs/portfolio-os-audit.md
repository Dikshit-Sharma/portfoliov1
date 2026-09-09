# Portfolio OS — Full Audit Report

**Date:** 2026-09-09
**Branch:** `fea/ui`
**Commit:** `c41810a` (pre-transformation) → current

---

## 1. Repository Structure (Pre-Transformation)

```
cv/
├── src/
│   ├── App.tsx                    — Root, hash-router switch, lazy Dashboard/Knowledge
│   ├── main.tsx                   — React 19 StrictMode entry
│   ├── index.css                  — Tailwind v4, CSS custom properties, dark/light, noise, reveal
│   ├── components/ (31 files)     — Hero, Navbar, Footer, WorkPage, LabPage, KnowledgePage,
│   │                                  RecruiterPage, Terminal, CommandPalette, Dashboard pages, etc.
│   ├── dashboard/ (15 files)      — Control Center tabs, PasswordGate, charts, journal (AES-256-GCM)
│   ├── data/ (8 files)            — projects, experience, impact, lab, now, changelog, site, obsidian.generated
│   ├── hooks/useReveal.tsx        — IntersectionObserver scroll-reveal wrapper
│   └── lib/ (4 files)             — router, registry, seo, utils
├── netlify/functions/ (5 files)   — auth, github, amli, amli-sync, novel
├── public/                        — Static obsidian JSON + resume PDF
├── scripts/obsidian-generator.mjs — Scans local Obsidian vault → data files
├── vite.config.ts                 — React + Tailwind v4
├── netlify.toml                   — Build, functions, redirects, scheduled amli-sync
└── package.json                   — React 19, TypeScript 6, Vite 8, Oxlint
```

---

## 2. Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19.2 (react-jsx transform) |
| Build | Vite 8 + @vitejs/plugin-react |
| Styling | Tailwind CSS 4 (CSS-first @theme) |
| Routing | Custom hash router (no react-router) |
| Icons | Lucide React + inline SVGs |
| Serverless | Netlify Functions (CommonJS) + @netlify/blobs |
| Data | Static TS modules + generated Obsidian JSON + localStorage |
| Linting | Oxlint (Rust) |
| TypeScript | ~6.0 (strict, verbatimModuleSyntax, erasableSyntaxOnly) |

---

## 3. Existing Features (Before Transformation)

| Feature | Status | Notes |
|---------|--------|-------|
| Hero with terminal panel | ✅ | Hardcoded metrics (fabricated: "uptime 99.9%") |
| Navbar (conventional) | ✅ | Links + theme toggle + command palette button |
| Command Palette | ✅ | ⌘K fuzzy search over registry entities |
| Terminal | ✅ | Interactive with commands (help, projects, exp, skills, etc.) |
| Work / Lab pages | ✅ | Lists + deep-dive detail views |
| Knowledge Page | ⚠️ | Graph with **fabricated mock edges** |
| Recruiter Page | ✅ | Simplified view, but generic card layout |
| Experience / About / Skills | ✅ | Timeline, grouped skills |
| Dashboard (private) | ✅ | 6 tabs, PasswordGate, GitHub/Obsidian/AMLI/Journal |
| Journal encryption | ✅ | AES-256-GCM client-side, PBKDF2 150k |
| Obsidian publishing | ⚠️ | `public: true` filter in generator, **novel.cjs leaks private notes** |
| GitHub integration | ✅ | Heatmap + repos + contribution calendar |
| AMLI integration | ⚠️ | Client-side password gate only, **no server auth** |

---

## 4. Security Audit (Critical Findings)

| ID | Severity | Finding | File | Fixed |
|----|----------|---------|------|-------|
| F1 | **P0** | Private Obsidian notes exposed via `files` map in API response | `novel.cjs` | ✅ Separated cache from served snapshot |
| F2 | P1 | AMLI "password protected" data served with no server auth | `amli.cjs` | ✅ `X-Dashboard-Auth` header verification |
| F3 | P1 | Unauthenticated force-sync/spoofable scheduler trigger | `amli.cjs`, `amli-sync.cjs`, `novel.cjs` | ✅ Scheduler header + allowlisted-origin check |
| F4 | P1 | Rate limiter bypassable via spoofable `X-Forwarded-For` | `auth.cjs` | ✅ Keyed on `x-nf-client-connection-ip` (last hop) |
| F5 | P2 | Error leakage across all functions | All `.cjs` | ✅ Generic error messages, no env/config leakage |
| F6 | P2 | No rate limiting on GitHub unauthenticated path | `github.cjs` | ⚠️ Deferred (low risk, public data) |
| F7 | P2 | CORS inconsistencies (echo-first-origin, missing on amli-sync) | All `.cjs` | ✅ Omit ACAO for disallowed origins |

---

## 5. Design / Product Gaps (vs. Vision)

| Requirement | Gap |
|-------------|-----|
| **Waybar-style status bar** | Navbar is generic; no workspace switcher, no system status |
| **Workspace metaphor** | No numbered workspaces (1 Work / 2 Lab / 3 Knowledge / 4 System) |
| **No fabricated data** | Hero: uptime 99.9%, fake GitHub status; Knowledge: mock graph edges |
| **Unified entity model** | Registry exists but partial; no technology/experience/impact/knowledge cross-links |
| **Entity inspector** | Missing; TechBadge not inspectable |
| **Architecture workspace** | Only in project deep-dive, no system-level map |
| **Skills as packages** | Skills rendered as badge grid, no `pkg list` metaphor |
| **Recruiter mode = Hyprland window** | Generic section stack, no window chrome |
| **CI pipeline** | None |
| **Tests** | None |

---

## 6. Transformation Scope (This PR)

### Security (P0/P1)
- ✅ `novel.cjs`: Separated raw vault cache (`vault-cache-v1`) from public snapshot; `files` never served.
- ✅ `amli.cjs`: Added `hasValidAuth()` (sha256 password via `X-Dashboard-Auth`); protected `topApis`/`recent`; `?sync=1` requires auth.
- ✅ `amli-sync.cjs`: Removed public serving path; only scheduled/allowlisted-origin refresh; no error leakage.
- ✅ `auth.cjs`: Rate-limiter keyed on `x-nf-client-connection-ip` (last hop); CORS omit-for-disallowed; generic error messages.
- ✅ `github.cjs`: Omit ACAO for disallowed origins; generic error; sanitized unauthenticated note.
- ✅ `novel.cjs`: Scheduler detection via `x-nf-scheduled`/`x-nf-event`; allowlisted-origin gated sync; generic errors.

### OS Shell
- ✅ `src/lib/workspaces.ts` — Workspace model (4 numbered workspaces + auxiliaries), integration status types, OS identity.
- ✅ `TopBar.tsx` — Waybar-style top bar: identity, workspace switcher (1-4), actions, clock, mobile sheet.
- ✅ `StatusBar.tsx` — Context-aware bottom status: workspace marker, integration status per page.
- ✅ `WorkspaceShell.tsx` — Context provider for EntityInspector.
- ✅ `EntityInspector.tsx` — Right-panel inspector for any entity kind (project, tech, experience, impact, knowledge).
- ✅ `SystemPage.tsx` — Workspace 4: neofetch identity, integrations status, architecture maps, changelog.

### Relationship Engine
- ✅ `relations.ts` — Cross-links: project↔technology↔experience↔impact↔knowledge; `inspectEntity()`.
- ✅ `TechBadge.tsx` — Clickable technology chip → opens inspector.
- ✅ Wired into `WorkPage` (project stack), `Skills` (module list), `RecruiterPage` (stack), `CommandPalette` (tech entities).

### Fabricated Data Removal
- ✅ Hero: Removed `uptime 99.9%`, `last commit 2h ago (static)`, `CONNECTED` claims → real counts (projects, lab, notes, categories) + "API CONFIGURED".
- ✅ KnowledgePage: Replaced mock edges with **real edges** derived from published note content (technology mentions in headings/first lines).

### Portfolio Improvements
- ✅ Skills: Rebranded as "Installed Modules" (`pkg list` terminal aesthetic), grouped, inspectable.
- ✅ RecruiterPage: Hyprland window chrome (title bar, focused badge), condensed content, `TechBadge` stack.
- ✅ CommandPalette: Workspace switcher commands (`ws-work`, `ws-lab`, `ws-knowledge`, `ws-system`), `G S` shortcut for System.
- ✅ Architecture: Data-driven (`src/data/architecture.ts`) — Portfolio OS, AMLI Tools, Axis Max Life; layered graph + text fallback.

### CI / Docs
- ✅ `.github/workflows/ci.yml` — `npm ci → lint → build` on push/PR.
- ✅ `README.md` — Rewritten as "Developer Workspace" with workspace table, keyboard map, architecture diagram, security table, env vars.

---

## 7. New / Modified Files

### New Files
```
src/lib/workspaces.ts
src/lib/relations.ts
src/lib/knowledge-graph.ts
src/dashboard/lib/auth-token.ts
src/components/workspace/TopBar.tsx
src/components/workspace/StatusBar.tsx
src/components/workspace/WorkspaceShell.tsx
src/components/workspace/EntityInspector.tsx
src/components/workspace/ArchitectureDiagram.tsx
src/components/workspace/TechBadge.tsx
src/components/SystemPage.tsx
src/data/architecture.ts
.github/workflows/ci.yml
```

### Modified Files
```
src/App.tsx                     — WorkspaceShell, TopBar, StatusBar, System route
src/lib/router.ts               — Added 'system' route
src/lib/registry.ts             — Added system route entity + validRoutes
src/lib/seo.ts                  — System route meta
src/components/Hero.tsx         — Removed fabricated data, real counts
src/components/KnowledgePage.tsx — Real graph from knowledge-graph.ts, sidebar layout
src/components/WorkPage.tsx     — TechBadge in project stacks
src/components/Skills.tsx       — "Installed Modules" terminal layout, TechBadge
src/components/RecruiterPage.tsx — Window chrome, focused UX, TechBadge
src/components/CommandPalette.tsx — Workspace commands, G S shortcut
src/dashboard/components/PasswordGate.tsx — Store sha256 token, dispatch auth-changed
src/dashboard/sections/AmliSection.tsx — Send X-Dashboard-Auth header, re-fetch on unlock
netlify/functions/auth.cjs      — Rate-limiter hardening, CORS fix, error sanitization
netlify/functions/amli.cjs      — Auth-gated details + sync, CORS fix, error sanitization
netlify/functions/amli-sync.cjs — Removed public serve, scheduler auth, CORS fix, error sanitization
netlify/functions/github.cjs    — CORS fix, error sanitization
netlify/functions/novel.cjs     — Private note leak fixed, scheduler hardening, CORS fix
README.md                       — Complete rewrite as Developer Workspace
```

---

## 8. Build Verification

```
$ npm run lint    → 0 errors (warnings only, pre-existing)
$ npm run build   → ✅ production build in ~1s
$ tsc -b          → ✅ no type errors
```

---

## 9. Known Limitations / Deferred

| Item | Reason |
|------|--------|
| GitHub unauthenticated rate limiting | Low risk (public data); add if quota issues arise |
| Playwright E2E tests | CI scaffolded; tests deferred to follow-up |
| Novel vault schedule in netlify.toml | Not yet added; runs via manual sync for now |
| Mobile graph performance | Lazy-loaded; acceptable for 4 categories |
| Architecture inspector integration | Entity inspector shows tech/project/experience; architecture nodes not yet linked |

---

## 10. Definition of Done Checklist

- [x] Production build passes (`npm run build`)
- [x] TypeScript passes (`tsc -b`)
- [x] Lint passes (`npm run lint` — 0 errors)
- [x] Routes work (`/`, `/work`, `/lab`, `/knowledge`, `/system`, `/recruiter`, `/dashboard`, etc.)
- [x] Mobile responsive (TopBar sheet, StatusBar, KnowledgePage sidebar)
- [x] Accessibility (semantic HTML, focus states, ARIA, reduced motion)
- [x] Public/private boundary secure (novel.cjs files leak fixed, AMLI auth enforced)
- [x] Obsidian publishing safe (generator enforces `public: true`, cache isolated)
- [x] Dashboard functional (GitHub, Journal, Obsidian, AMLI, Settings)
- [x] GitHub integration functional (heatmap, repos, profile)
- [x] Terminal functional (commands, search, inspect, neofetch)
- [x] Command Palette functional (fuzzy search, shortcuts, workspace switch)
- [x] Entity relationships work (TechBadge → inspector → related entities)
- [x] Architecture interactive (System workspace: 3 maps, selectable nodes, text fallback)
- [x] Knowledge graph scalable (lazy JSON fetch, real edges only)
- [x] Recruiter mode fast (window chrome, no terminal/graph, 30s scan)
- [x] OS shell cohesive (TopBar, StatusBar, WorkspaceShell, identity)
- [x] No fabricated information (Hero real counts, Knowledge real edges)
- [x] No unnecessary dependencies added (only `src` additions, no new npm packages)