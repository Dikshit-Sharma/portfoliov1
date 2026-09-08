# Portfolio v2 — Audit

Audit date: 2026-09-08
Repository: `Dikshit-Sharma/portfoliov1`
Branch: `fea/ui`
Commit: `c622709`

Status legend:

| Status | Meaning |
| ------ | ------- |
| `[EXISTS]` | Fully working feature already in the repo |
| `[PARTIAL]` | Feature exists but is incomplete or simplified |
| `[MISSING]` | Not implemented at all |
| `[BROKEN]` | Present but broken / build-affecting |
| `[BLOCKED]` | Depends on missing info, credentials, or infrastructure |
| `[REQUIRES DATA]` | Needs user-provided content to be completed |
| `[IMPROVEMENT]` | Works but can be improved without changing behavior |

---

## Audit table

| Feature | Status | Existing implementation | Missing / problem | Planned action |
| ------- | ------ | ----------------------- | ----------------- | -------------- |
| Routing (public) | `[EXISTS]` | `src/lib/router.ts` — hash router `#/page/sub`, `useHashRoute`, `navigate()`. | No clean pathname routing; hash in URL; SPA fallback configured. | Keep hash routing (works on Netlify); harden 404 + document limitations. |
| Routing (dashboard) | `[EXISTS]` | `src/dashboard/lib/router.ts` — `useHashTab`, supports `#/dashboard/<tab>` and bare `#/<tab>`. | Duplicate router logic vs public router; bare `#/<tab>` ambiguous. | Keep; add alias/guard tests. |
| Homepage | `[EXISTS]` | `App.tsx#home` renders Hero, Impact, About, Skills, Experience, Projects, Education, Contact. | — | No change. |
| Hero | `[IMPROVEMENT]` | `Hero.tsx` — "Live Developer Workspace" terminal panel; labels static values as `(static)`. | Uses real data for projects count; static commit/deploy times. | Keep; no fabrication. |
| About | `[EXISTS]` | `About.tsx`. | — | No change. |
| Skills | `[PARTIAL]` | `Skills.tsx` — grouped skill lists from `site.ts#skillGroups`. | No click-through technology evidence; no project connections. | Add technology registry relationships (Phase 2/4). |
| Experience | `[EXISTS]` | `Experience.tsx` — interactive timeline from `data/experience.ts`. | — | Terminal output now shares the same data. |
| Projects | `[EXISTS]` | `WorkPage.tsx` + `ProjectDetailPage` (deep-dive) from `data/projects.ts`. | Only 3 projects; detail page is laid out but concise. | No fabricated data; keep. |
| Education | `[EXISTS]` | `Education.tsx` from `site.ts#education`. | — | No change. |
| Contact | `[EXISTS]` | `ContactPage.tsx` (email/phone/location + quick actions); `Contact.tsx` legacy unused. | Legacy `Contact.tsx` not referenced. | Consider removing dead component (careful with git history). |
| Navbar | `[EXISTS]` | `Navbar.tsx` — desktop links + mobile drawer, theme toggle, command palette button. | — | No change. |
| Theme | `[EXISTS]` | `ThemeProvider.tsx` — dark/light/system, localStorage, command palette themes. | — | No change. |
| Command palette | `[IMPROVEMENT]` | `CommandPalette.tsx` — Ctrl/K, `?` help, G-leader navigation, fuzzy filter, project search, auto-scroll. | Hardcoded command list; not backed by a shared registry. | Wire to global entity registry (Phase 2/4). |
| Terminal | `[IMPROVEMENT]` | `Terminal.tsx` — 15+ commands, tab-completion, history from shared data. | `contact` exposes phone; no `search`/`work`/`proj`/`exp`/`tech` aliases; duplicate data risk. | Add aliases + `search`, remove phone from terminal output, keep shared data source. |
| Dashboard | `[EXISTS]` | `Dashboard.tsx` + sections (Overview, GitHub, Journal, Obsidian, AMLI, Settings). | `lab` tab is a placeholder ("coming soon"). | Wire Lab data into dashboard lab tab. |
| GitHub integration | `[EXISTS]` | `netlify/functions/github.cjs` — GraphQL/REST, live + fallback; `GithubSection.tsx`. | — | No change. |
| Obsidian integration | `[EXISTS]` | `scripts/obsidian-generator.mjs` + `netlify/functions/novel.cjs` + `ObsidianSection.tsx`. | Generator publishes *all* folders except blacklist; no explicit `public: true` frontmatter model. | Add explicit publishing model + build-time validation (Phase 5). |
| AMLI integration | `[EXISTS]` | `amli.cjs` + `amli-sync.cjs` + `AmliSection.tsx`. | — | No change. |
| Authentication | `[EXISTS]` | `auth.cjs` password check + `PasswordGate.tsx` (sessionStorage). | Password check is single static password; no rate limiting. | Audit only; add brute-force guard to `auth.cjs`. |
| Architecture visualization | `[PARTIAL]` | `ArchitectureDiagram.tsx` — static hierarchy; hardcoded nodes. | Not interactive; not data-driven. | Leave static for now; document as future work (Phase 6 optional). |
| Mobile navigation | `[EXISTS]` | Navbar mobile drawer; floating command access via navbar button. | — | No change. |
| Keyboard shortcuts | `[EXISTS]` | Ctrl/K, `?`, `T`, `R`, `G{P,E,L,N,K,D,C}`, Esc. | — | No change. |
| Search (global) | `[MISSING]` | Only command-palette fuzzy filter + knowledge category filter. | No unified search across projects/tech/experience/knowledge. | Build global entity registry; extend command palette search (Phase 2/4). |
| SEO | `[PARTIAL]` | Static `index.html` meta (title, description, OG, Twitter). | No per-route `document.title`/meta updates; no canonical strategy documented. | Add per-route page metadata (Phase 2). |
| Accessibility | `[PARTIAL]` | Semantic HTML, focus styles, `prefers-reduced-motion`, ARIA dialogs. | Not systematically audited. | Manual check + note. |
| Performance | `[PARTIAL]` | Single bundle ~416 kB JS (115 kB gzip), all routes eager. No code splitting. | Heavy features (dashboard, terminal, knowledge graph) load on every page shell. | Lazy-load dashboard/terminal/knowledge (Phase 2). |
| Security | `[EXISTS]` | Secrets server-side in functions; client-side AES-256-GCM journal; CORS allowlist. | `auth.cjs` no rate limit; `novel.cjs` not in `netlify.toml` redirects/schedule. | Rate-limit auth; add `novel` redirect if needed (Phase 7). |
| Netlify deployment | `[EXISTS]` | `netlify.toml` build/publish/functions, API rewrites, SPA fallback, `amli-sync` schedule. | `novel.cjs` has no route alias/schedule (on-demand only). | Document; add schedule/redirect if desired. |
| Tests | `[MISSING]` | None. No vitest/jest/playwright. | — | Add lightweight unit tests if practical; otherwise document. |
| Error handling | `[PARTIAL]` | Loading/empty/error states in dashboard sections; `NotFoundPage` for bad routes. | No React error boundaries; an exception in one section can blank the app. | Add error boundary (Phase 2). |
| Loading / empty / offline states | `[PARTIAL]` | Dashboard sections handle loading/error. Public site has no loading boundaries. | — | Error boundary + lazy-load Suspense fallbacks. |
| Offline / cached states | `[PARTIAL]` | Netlify Blobs caches (26h freshness); journal in localStorage. | No explicit Live/Cached/Offline labels in UI. | Document; add labels where practical. |
| Data architecture | `[IMPROVEMENT]` | Structured data in `src/data/*` (projects, experience, impact, lab, now, changelog, site). | Duplicated lists: `site.ts` duplicates experience; dashboard `ProjectsSkillsSection` hardcodes projects. | Centralize relationships (Phase 2/4). |

---

## Dependencies

Production: `react`, `react-dom`, `@netlify/blobs`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`.
Dev: vite, typescript, tailwindcss v4, @vitejs/plugin-react, @tailwindcss/vite, oxlint, @types/*.

`framer-motion` was **never** installed. The unused `src/components/ui/motion.tsx` (which imported it) was removed to restore the build.

## Build status at audit time

```text
npm run lint  → 0 errors (pre-existing warnings only)
npm run build → PASS (tsc -b && vite build, 416.17 kB JS / 43.75 kB CSS)
```

## Key risks identified

1. `auth.cjs` has no brute-force protection — single shared password endpoint.
2. Obsidian generator has no explicit `public:` frontmatter publishing gate.
3. No global search/entity registry — command palette is the only search surface.
4. No error boundaries — one section crash blanks the app.
5. No code splitting — dashboard and heavyweight components eagerly loaded.
6. `novel.cjs` missing from `netlify.toml` route aliases/schedule.