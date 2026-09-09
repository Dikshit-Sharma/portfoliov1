# Portfolio OS — UI / Architecture Audit

**Branch:** `fea/ui`
**Date:** 2026-09-09
**Status:** Baseline for Desktop Environment transformation

This audit catalogues the existing implementation before the Desktop-Environment
transformation. Every finding is classified so existing functionality is preserved
wherever possible, improved where it is weak, and never thrown away without reason.

---

## 1. Ground Truth

- **Build :** `npm run build` passes (`tsc -b && vite build`, 1874 modules, ~332KB gzip main bundle).
- **Lint :** `npm run lint` (oxlint) passes with **0 errors**, **10 warnings** (7 `react/set-state-in-effect`, 3 `react/only-export-components`).
- **Stack:** React 19.2, TypeScript ~6.0, Vite 8, Tailwind v4 (`@tailwindcss/vite`), oxlint, lucide-react, clsx/tailwind-merge/CVA. No test runner configured.
- **Routing:** hash-based SPA (`#/route/subroute`). No React Router.
- **Data:** static TypeScript modules + generated Obsidian manifest + JSON snapshots in `public/obsidian-data/`.
- **Backend:** 5 Netlify functions (`auth`, `github`, `amli`, `amli-sync`, `novel`). Netlify Blobs for caching. Scheduled sync daily.
- **Auth:** dashboard password gate + AES-256-GCM encrypted journal (Web Crypto, PBKDF2). Auth token = SHA-256 of password (server-side trusted).

---

## 2. Architecture Inventory

```
src/
├── App.tsx                 # root; routes → page switch; dashboard special-case
├── main.tsx                # mount
├── index.css               # design tokens + global styles
├── components/             # 29 presentational/page components
│   ├── workspace/          # TopBar, StatusBar, WorkspaceShell(ctx), EntityInspector,
│   │                       # ArchitectureDiagram, TechBadge
│   └── ui/                 # badge, button, kbd
├── dashboard/              # private control center (GitHub, Obsidian, Activity, Lab, AMLI, Settings, Journal)
│   ├── Dashboard.tsx
│   ├── components/         # charts, PasswordGate
│   ├── lib/                # crypto, markdown, obsidian types, router, storage, auth-token
│   └── sections/           # Github, Journal, Obsidian, Overview, ProjectsSkills, Settings, Amli
├── data/                   # projects, experience, impact, lab, site, changelog, architecture, now, obsidian.generated
├── hooks/useReveal.tsx     # IntersectionObserver reveal
└── lib/                    # registry, relations, knowledge-graph, workspaces, router, seo, utils
```

---

## 3. Findings by Classification

### [KEEP] — working, meaningful, preserve

| Area | Detail | Notes |
|------|--------|-------|
| Route model | `PageRoute` union (12 routes) | Foundation for deep-linking |
| `lib/router.ts` | hash router + `useHashRoute`, `navigate` | Robust; needs extension not rewrite |
| `lib/workspaces.ts` | `WORKSPACES` (4 workspaces), `IntegrationStatus`, `OS_IDENTITY` | Directly reusable for window/workspace model |
| `lib/registry.ts` | Entity registry + search scoring | Reuse as the entity source for global search |
| `lib/relations.ts` | Relation engine (`inspectEntity`, `projectsUsingTechnology`…) | The entity-inspector backbone |
| `lib/knowledge-graph.ts` | `buildKnowledgeGraph()` from published notes | Real edges only |
| `data/*` | All static content | No fabricated data — the source of truth |
| `components/workspace/EntityInspector` | OS-level inspector | Extend rather than duplicate |
| `components/workspace/ArchitectureDiagram` | SVG graph + `ArchitectureList` a11y fallback | Data-driven |
| `components/workspace/TechBadge` | Click → inspector | Reuse |
| `components/Terminal` | 586-line real terminal (commands, history, tab, aliases, search) | Convert to an application window |
| `components/CommandPalette` | Ctrl+K palette, help overlay, G-leader, shortcuts | Evolve into the application launcher |
| `dashboard/` | Encrypted journal, auth gate, GH/AMLI/Obsidian sections | PRIVATE. Preserve security model as-is |
| `netlify/*.cjs` | 5 functions (auth, github, amli, amli-sync, novel) | Security model verified in prior audits (F1–F7 fixed) |
| `scripts/obsidian-generator.mjs` | `public: true` gating, JSON snapshots | Preserve privacy model |
| `ThemeProvider` | dark/light/system | Reuse |
| `ErrorBoundary` | per-section error boundary | Reuse |
| `lib/seo.ts` | per-route `<title>`/meta | Extend for apps/entities |
| `components/icons.tsx` | GitHub/LinkedIn SVG | Reuse |
| `components/ui/*` | badge/button/kbd | Reuse as primitives |
| `data/site.ts` | personal identity, resume, links | Reuse everywhere |

### [IMPROVE] — good idea, needs polish

| Area | Finding |
|------|---------|
| TopBar → global shell | Currently a route-nav header; become a real system top bar (identity, workspaces, tray, clock, integrations, launcher/settings/notification triggers) |
| StatusBar | Dead `useState(true)`; `timeAgo` not reactive; enrich with real integration states |
| Skill display | `Skills.tsx` uses package-list format; improve to evidence-based skill model (see §31 of brief) |
| Project link bug | `WorkPage.tsx:335` — `project.links.live \|\| project.links.source && (…)` operator-precedence bug; `WorkPage.tsx:137` non-null assertion on possibly-undefined links |
| Kbd/Button no ref forwarding | primitive ramps don't use `forwardRef` — needed if focus trap / imperative access is added |
| `Navbar`/`TopBar` duplication | Two overlapping nav components exist (`Navbar.tsx` legacy + `TopBar.tsx`); converge on the system top bar |
| Clock | 60s tick has up to 59s skew — fine, keep |
| button outline dark-mode | redundant/incorrect `dark:` hover classes |
| `Button` only-export-components warnings | split `buttonClass` into separate module |

### [REFACTOR] — restructure without losing behavior

| Area | Finding |
|------|---------|
| `App.tsx` | Mental model `route → page`. Rebuild as `DesktopEnvironment → Workspace → Window → Application` while keeping the route layer for deep-linking |
| Workspaces | `workspaceForRoute` maps single route. Need: workspace as *application state* that persists across switch; route becomes a deep-link into workspace+window+entity |
| Navigation | `navigate()` sets hash → whole page recomposes. Need: workspace state transition (no full re-render/reload), windows persist |
| `InspectorTarget` | duplicated in `WorkspaceShell.tsx` and `EntityInspector.tsx` → single source |
| Relationship engine | inconsistent signatures (`relationsForTechnology(name)` vs `relationsForProject(id)`); unify |
| Technology matching | substring `includes` in `relations.ts`/`knowledge-graph.ts` (false positives: "Rust" in "Trustpilot"); word-boundary |
| Slug helpers | 3 near-identical slugify/techToId functions → unify |
| Data duplication | `site.ts` (cognizantRole/internRole), `experience.ts`, `projects.ts`, `lab.ts` overlap → single canonical model (unified data model, §29) |
| `SearchEntity` vs `RelatedEntity` | two similar entity-ref types → one canonical `EntityRef` |
| `dashboard/sections/ProjectsSkillsSection` | hardcoded projects list → derive from `data/projects` |
| `dashboard/sections/AmliSection` + `JournalSection` | duplicate `EmptyChart` → shared chart primitive |
| `StatusBar` `workspaceStatus` default | unify with `system` case |

### [MISSING] — needed for the desktop concept

| Capability | Where it should live |
|------------|----------------------|
| `DesktopEnvironment` root | boots into desktop, not a page |
| `DesktopBackground` | true wallpaper layer, theme-derived, no neon |
| `WindowManager` + `Window` | open/close/focus/minimize/maximize/tile/z-index/stack |
| `WorkspaceManager` | persistent per-workspace window state (switch ≠ reload) |
| `ApplicationRegistry` | apps are first-class (`id/name/icon/component/workspace/shortcut/deepLink`) |
| `ApplicationManager` | app lifecycle (closed→opening→open→focused→background→minimized→closed) |
| `Dock` | launch/switch/indicate running/focused apps |
| `Launcher` | global search: applications + commands + entities + routes |
| `NotificationCenter` | real-event notifications only (GitHub refreshed, project opened…) |
| `QuickSettings` | theme/accent/motion + real integration states — no fake hardware |
| Unified Command Registry | one source of truth shared by palette + terminal |
| Global shortcut registry | Super+1..4, Super+Space, Super+Enter, Esc; visible alternatives |
| DesktopContextMenu | subtle; only if it improves UX |
| Mobile composition | bottom nav + full-screen app stack (no tiny floating windows) |
| Boot experience | momentary, skippable, reduced-motion-safe, never blocks route |
| Design tokens | `--surface`, `--bar-height`, `--dock-height`, `--window-gap`, focus ring etc. |
| Persistence | localStorage for theme/workspace/recent (client-only, safe data) |
| Truthful GitHub app | online/cached/offline/error states; no fake live status |
| System application | Environment/Architecture/Integrations/Theme/Shortcuts/Privacy/About |
| Recruiter simplification | hide terminal/graph/architecture by default, keep it obvious |

### [BROKEN] / needs correction

| Location | Issue |
|----------|-------|
| `WorkPage.tsx:335` | operator-precedence bug on links conditional |
| `WorkPage.tsx:137` | non-null assertion `v!` on maybe-undefined links |
| `KnowledgePage` wheel pan | `e.preventDefault()` may be on passive listener in some browsers |
| `index.css` light-mode | `html:not(.dark)` sets `--color-*` on `html` while `@theme` defines on `:root`; ensure cascade works for all surfaces |

### [REMOVE] (deferred / no longer needed)

| Item | Note |
|------|------|
| `components/Navbar.tsx` | Legacy; superseded by `TopBar`. Keep until top bar becomes system shell, then drop or re-wire |
| `Hero` terminal-dashboard block | Hidden once we boot into a desktop; keep the component as the *Portfolio application* content |
| Dead `StatusBar` `visible` state | remove |
| `KnowledgePage` unused `techNodeById` | remove in `knowledge-graph.ts` |

### [SECURITY] (re-verify, mostly already handled)

- Netlify functions already hardened (constant-time auth compare, rate limit, `public:true` gating, encrypted journal, AMLI auth header, CORS allowlist, generic errors). Verify nothing new leaks.
- `site.ts:8` hardcoded phone number — keep but consider removing from public source.
- Ensure the new desktop launcher/global search never surfaces private dashboard/AMLI data. Public registry only.
- Private dashboard code already lazy-loaded + gated; ensure it stays out of the default desktop composition.
- `novel.cjs` serves only `public:true` categories; verify new `DesktopEnvironment` never imports private content.

### [PERFORMANCE]

- Main bundle 332KB (91.6KB gzip) — acceptable, but heavy pages (Knowledge, Terminal, Dashboard, Architecture) are lazy-loaded. Preserve lazy boundaries.
- Knowledge graph + Architecture diagram load lazily; don't render full graphs unless in the Knowledge/System window.
- Registry built eagerly at import — small, fine.
- Observer-based reveal: one `IntersectionObserver` per reveal element — fine at current scale.
- No virtualization needed at current data size; add only if notes grow.

### [ACCESSIBILITY]

- `EntityInspector`: add focus trap + `aria-hidden` backdrop.
- Mobile menu / overlays: add focus management.
- Knowledge SVG graph: already has `aria-label` + list fallback (ArchitectureList). Add a semantic note/backlink list alongside Knowledge graph.
- CommandPalette/Terminal: good keyboard support already; keep.
- `prefers-reduced-motion` global override present; keep and extend to new transitions.
- Ensure role/aria on windows, workspace switcher, dock.

---

## 4. Recently-Added Functionality (git history)

From `git log` — recent work on `fea/ui`:

- `6320720` **NEW DASHBOARD** — private control center (auth, journal, AMLI, GitHub, Obsidian, charts).
- `e321275` **DEVELOPER WORKSPACE** — OS shell (TopBar, StatusBar, WorkspaceShell, EntityInspector, ArchitectureDiagram, TechBadge), relationship engine, knowledge graph, neofetch, registry.
- `2dc07d0` global entity registry, error boundaries, lazy loading, SEO, terminal aliases/search, Obsidian `public:true` publishing, `auth.cjs` brute-force guard.
- `c622709` removed unused `motion.tsx` (framer-motion) — clean.
- `ecf3b00` merge
- `c41810a`/`a34260d` docs + final transformation commit.

So the *Developer Workspace* and *Dashboard* are the two most recent big blocks. The Desktop-Environment transformation builds directly on the workspace layer.

---

## 5. Classification Summary (counts)

| Class | Count | Highest-priority items |
|-------|-------|------------------------|
| KEEP | ~26 | Build foundation; preserve all data/security/relations |
| IMPROVE | 10 | TopBar→shell, status bar, skill model, project-link bugs |
| REFACTOR | 9 | App→DesktopEnvironment, workspaces-as-state, duplication (data/relations/slug) |
| MISSING | 18 | WindowManager, WorkspaceManager, ApplicationRegistry, Dock, Launcher, Notifications, QuickSettings, Mobile, Boot, tokens, persistence |
| BROKEN | 4 | project-link precedence, non-null links, wheel passive, css light-mode cascade |
| REMOVE | 3 | legacy Navbar, dead StatusBar state, unused techNodeById |
| SECURITY | 5 | verify no new leaks; keep private(private); phone number |
| PERFORMANCE | 4 | preserve lazy boundaries; lazy heavy apps |
| ACCESSIBILITY | 4 | focus trap, focus mgmt, graph alternatives, reduced-motion |

---

## 6. Recommended Path (Phase 1 → 2)

1. Keep all [KEEP] items as-is.
2. Introduce `src/desktop/` layer (DesktopEnvironment, WindowManager, WorkspaceManager, ApplicationRegistry, DesktopContext, Dock, Launcher, NotificationCenter, QuickSettings, background, shell).
3. Map existing components as *applications* (portfolio, projects, lab, terminal, knowledge, architecture, system, github, contact, recruiter, changelog, dashboard) — reuse, don't duplicate.
4. Evolve `lib/registry.ts` → unified Application+Command+Entity registry.
5. Preserve security/private boundaries exactly.
