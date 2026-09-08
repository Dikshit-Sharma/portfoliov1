# Portfolio v2 — Status Tracker

Live working document. A feature is **not** marked complete merely because its component exists — it must pass the full gate: TypeScript → lint → build → functional → responsive → accessibility → security → performance.

Legend:
- ✅ Done (verified by the gate)
- 🔶 In progress
- ⬜ Not started
- ❌ Blocked / requires data

---

## Phase 1 — Audit & Build Recovery

| Item | Status | Notes |
| --- | --- | --- |
| Repository audit (`docs/portfolio-v2-audit.md`) | ✅ | 2026-09-08 |
| Fix framer-motion / `motion.tsx` build failure | ✅ | Deleted unused file (`c622709`); `npm run build` passes |
| Dependency integrity | ✅ | `framer-motion` absent from `package.json` + lockfile; `npm ci` reproducible |
| Lint gate | ✅ | `npm run lint` → 0 errors |
| Build gate | ✅ | `npm run build` → PASS |
| Push build fix to origin | ✅ | `fea/ui @ c622709` |

## Phase 2 — Application Foundation

| Item | Status | Notes |
| --- | --- | --- |
| Global entity registry / single source of truth | 🔶 | Planned: `src/lib/registry.ts` |
| Error boundaries | ⬜ | Planned around dashboard/knowledge/graph sections |
| Lazy loading (dashboard, terminal, knowledge) | ⬜ | Planned via `React.lazy` |
| Per-route metadata (SEO titles) | ⬜ | Planned via `usePageMeta` |
| Design tokens | ✅ | Existing CSS variables + Tailwind v4 theme |

## Phase 3 — Core Portfolio

| Item | Status | Notes |
| --- | --- | --- |
| Home | ✅ | Hero + Impact + About + Skills + Experience + Projects + Education + Contact |
| Work + project deep dives | ✅ | `WorkPage` + `ProjectDetailPage` |
| Lab | ✅ | `LabPage` + `LabDetailPage` |
| Now | ✅ | `NowPage`, data-driven |
| Experience | ✅ | `Experience` timeline, data-driven |
| Skills | ✅ | Grouped lists |
| Recruiter mode | ✅ | `RecruiterPage`, uses shared impact data |
| Changelog | ✅ | `ChangelogPage`, data-driven |
| 404 | ✅ | `NotFoundPage` |
| Contact | ✅ | `ContactPage` |

## Phase 4 — Workspace Layer

| Item | Status | Notes |
| --- | --- | --- |
| Command palette search across entities | 🔶 | Currently searches commands + projects |
| Global search registry | ⬜ | |
| Terminal aliases (`work`, `proj`, `exp`, `tech`, `search`) | ⬜ | |
| Terminal data privacy (remove phone from `contact`) | ⬜ | |
| Contextual navigation / breadcrumbs | ⬜ | Low priority — flat routes |
| URL-addressable state | ✅ | `#/work/:id`, `#/lab/:id` work |

## Phase 5 — Knowledge

| Item | Status | Notes |
| --- | --- | --- |
| Obsidian publishing model (`public: true`) | ⬜ | Generator currently blacklist-based |
| Build-time validation | ⬜ | |
| Knowledge graph scalability | 🔶 | SVG circular graph, 3 categories / 169 notes |

## Phase 6 — Architecture

| Item | Status | Notes |
| --- | --- | --- |
| Data-driven architecture model | ⬜ | `ArchitectureDiagram` is static |
| Interactive inspector | ⬜ | Deferred — requires data model |

## Phase 7 — Dashboard

| Item | Status | Notes |
| --- | --- | --- |
| Preserve existing dashboard | ✅ | Untouched |
| Integrations status states | ✅ | Loading/empty/error present |
| Security audit (functions) | 🔶 | `auth.cjs` brute-force guard planned |

## Phase 8 — Polish

| Item | Status | Notes |
| --- | --- | --- |
| Accessibility | 🔶 | Manual audit open |
| Performance | 🔶 | Code splitting planned |
| SEO | 🔶 | Per-route titles planned |
| Mobile | ✅ | Navbar drawer + palette button |
| Loading / empty / error states | ✅ | Dashboard sections |

## Phase 9 — Verification

| Item | Status | Notes |
| --- | --- | --- |
| `npm run lint` | ✅ | |
| `npm run build` | ✅ | |
| Test suite | ❌ | No test infra in repo |
| Final report `docs/portfolio-v2-final-report.md` | ⬜ | |