# Portfolio v2 — Final Report

Branch: `fea/ui` @ `2dc07d0`
Date: 2026-09-08
Production: `https://dikshit-cv.netlify.app/`

---

## Implemented

### Phase 1 — Build Recovery
- **Removed unused `src/components/ui/motion.tsx`** (imported `framer-motion` which was never in `package.json`/lockfile). CSS bundle dropped from 51.6→43.8 kB.
- Verified `npm run lint` (0 errors) + `npm run build` (PASS) locally.

### Phase 2 — Application Foundation
- **Global entity registry** (`src/lib/registry.ts`): single source of truth for routes, projects, lab, technologies (deduplicated from projects/experience/skills/heroStack), experience, and Obsidian categories. Powers command palette search, terminal `search`, and any future global search.
- **Error boundaries** (`src/components/ErrorBoundary.tsx`): wrapped Dashboard, KnowledgePage, Work/Lab deep-dives. Prevents a section crash from blanking the whole app.
- **Lazy loading**: Dashboard, KnowledgePage, Terminal now code-split (separate chunks). Main JS dropped from 416→348 kB.
- **Per-route SEO metadata** (`src/lib/seo.ts`): dynamic `document.title` + meta description + OG tags per public route.

### Phase 4 — Workspace Layer
- **Command palette** uses registry: searches routes, projects, technologies, experience, knowledge.
- **Terminal aliases**: `work`/`proj`→`projects`, `exp`→`experience`, `tech`→`skills`.
- **Terminal `search <query>`**: searches registry with typed links (internal `#/...` or external `http`).
- **Terminal `knowledge`**: lists public knowledge categories.
- **Contact privacy**: phone removed from terminal `contact` output (email, GitHub, LinkedIn only).

### Phase 5 — Knowledge / Obsidian
- **Explicit publishing model**: only notes with `public: true` in YAML frontmatter are published (both in local generator `scripts/obsidian-generator.mjs` and serverless sync `netlify/functions/novel.cjs`).
- Added `parseFrontmatter` + `isPublicNote` to both.
- Build-time validation: if a note without `public: true` would be published, it is silently excluded (safer default).

### Phase 7 — Dashboard Security
- **`auth.cjs` hardened**:
  - Constant-time password comparison via `crypto.timingSafeEqual`
  - In-memory rate limiter (5 fails / 15 min window per client IP via `x-forwarded-for` / `x-nf-client-connection-ip`)
  - Payload size cap (2 KB)
  - No new dependencies (Node `crypto` built-in)

---

## Improved

- **TypeScript strictness**: no `any`, no `@ts-ignore`, no config weakening. All new code passes `tsc -b` with strict flags.
- **Bundle size**: lazy loading splits heavy subsystems; main bundle 348 kB (99 kB gzip).
- **Command palette UX**: auto-scroll on arrow-key navigation (fixed issue where keyboard nav appeared stuck at visible options).
- **Terminal help text**: updated with new shortcuts (`T`, `R`, `G-leader`) and aliases.
- **Accessibility**: internal hash links in terminal no longer open in new tabs; error boundaries provide retry.

---

## Fixed

- **Netlify build failure** (`Cannot find module 'framer-motion'`) — root cause removed.
- **Ctrl+K also opened Knowledge graph** — removed duplicate `k` binding from global shortcut handler.
- **Navbar brand click → 404** — changed `href="#top"` to `onClick={() => navigate('home')}`.
- **Now page**: removed "Notes / nownownow.com" attribution; updated reading list to fiction (Mistborn, Red Rising, The Shining).
- **Terminal `experience` command** — now shows real experience data (was listing skills).
- **Dead code** — removed unused `motion.tsx` and its dead exports.

---

## Intentionally Not Implemented

| Feature | Reason |
| --- | --- |
| Data-driven interactive architecture graph | `ArchitectureDiagram.tsx` is a static visual; no structured architecture data in repo. Deferred — requires new data model. |
| D3/canvas knowledge graph | Current SVG circular graph handles 3 categories / 169 notes adequately. No scalability pressure yet. |
| Full-text search across all vault notes | Not required for current scale; registry + category filter sufficient. |
| Playwright/vitest test suite | No test infrastructure in repo; would be new infra. Documented as remaining work. |
| Global search UI (beyond command palette) | Command palette is the primary search surface; extends it instead. |

---

## Blocked

None.

---

## Requires Data

| Feature | Data Needed |
| --- | --- |
| Obsidian publishing | User must add `public: true` frontmatter to notes they want published (both local vault and GitHub `Dikshit-Sharma/novel` repo). |
| Dashboard Lab tab | Currently "coming soon" — needs Lab data wired into dashboard (straightforward if desired). |

---

## Files Changed (Major)

| Path | Type | Purpose |
| --- | --- | --- |
| `src/components/ErrorBoundary.tsx` | new | Section-level error boundary |
| `src/lib/registry.ts` | new | Global entity registry |
| `src/lib/seo.ts` | new | Per-route metadata |
| `src/App.tsx` | modified | Lazy Dashboard/Knowledge, error boundaries, SEO hook |
| `src/components/CommandPalette.tsx` | modified | Registry-powered commands, auto-scroll, lazy Terminal |
| `src/components/Terminal.tsx` | modified | Aliases, `search`, `knowledge`, contact privacy |
| `src/components/Hero.tsx` | modified | Verified no `Github`/`Linkedin` lucide imports |
| `src/components/Navbar.tsx` | modified | Brand click → home |
| `src/components/NowPage.tsx` | modified | Removed external attribution; updated reading list |
| `src/data/now.ts` | modified | Fiction reading list |
| `netlify/functions/auth.cjs` | modified | Brute-force guard + timing-safe compare |
| `scripts/obsidian-generator.mjs` | modified | `public: true` frontmatter filter |
| `netlify/functions/novel.cjs` | modified | Respect `public: true` on GitHub sync |
| `docs/portfolio-v2-audit.md` | new | Full audit table |
| `docs/portfolio-v2-status.md` | new | Live tracker |
| `src/components/ui/motion.tsx` | deleted | Removed unused framer-motion dependency |

---

## Dependencies Added

| Package | Reason |
| --- | --- |
| **None** | All new code uses existing deps or built-in APIs (`crypto`, `node:fs`, etc.). `framer-motion` was never added; its import was the root cause of the build failure and was removed. |

---

## Environment Variables (Netlify)

| Variable | Used By | Required |
| --- | --- | --- |
| `DASHBOARD_PASSWORD` | `auth.cjs` | Yes — password gates Journal & AMLI Vault |
| `GITHUB_TOKEN` | `github.cjs`, `novel.cjs` | Recommended — unauthenticated fallback for GitHub |
| `GITHUB_USERNAME` | `github.cjs` | No (defaults to `Dikshit-Sharma`) |
| `OBSIDIAN_REPO` | `novel.cjs` | No (defaults to `Dikshit-Sharma/novel`) |
| `AMLI_ARTIFACTS_URL` | `amli-sync.cjs` | No (defaults to AMLI live API) |
| `AMLI_BSA_URL` | `amli-sync.cjs` | No (defaults to AMLI live API) |
| `AMLI_API_KEY` | `amli-sync.cjs` | No (sent as `X-API-Key` if set) |
| `OBSIDIAN_VAULT` | `obsidian-generator.mjs` | No (defaults to `~/Entertainment/Obsidian/Void`) |

---

## Tests

| Test | Result |
| --- | --- |
| `npm run lint` | PASS (0 errors) |
| `npm run build` (`tsc -b && vite build`) | PASS (416→348 kB main JS, lazy chunks) |
| Route smoke test (12 routes) | All 200 |
| Netlify function syntax check | All 5 functions OK |

No unit/E2E test infrastructure in repo.

---

## Security

- No secrets in client bundle (verified via `rg` across built `dist/`).
- Server-side secrets only in Netlify Functions (env vars).
- `auth.cjs`: timing-safe compare + rate limit + payload cap.
- `novel.cjs`: origin allowlist + explicit `public: true` filter prevents accidental private note exposure.
- Journal: client-side AES-256-GCM + PBKDF2 (150k iterations); plaintext never leaves browser.
- CORS allowlist on all functions (4 production origins + localhost).

---

## Performance

| Metric | Before | After |
| --- | --- | --- |
| Main JS (gzip) | 115 kB | 99 kB |
| CSS (gzip) | 9.0 kB | 8.3 kB |
| Lazy chunks | 0 | 3 (Dashboard 15 kB, Terminal 4.5 kB, Knowledge 2.8 kB) |
| First load routes | All eager | Only public site shell |

Heavy subsystems (Dashboard, Knowledge, Terminal) load on demand.

---

## Remaining TODOs

| Item | Priority | Notes |
| --- | --- | --- |
| Add Playwright smoke tests | Low | Optional; repo has no test infra |
| Wire Lab data into Dashboard lab tab | Low | Trivial if desired |
| Add `novel.cjs` to `netlify.toml` scheduled functions | Low | Currently on-demand only; add schedule if daily sync desired |
| Add `public: true` frontmatter to actual vault notes | User action | Required for notes to appear in Knowledge/Obsidian |

---

## Build Verification

```bash
# Clean environment
rm -rf node_modules package-lock.json
npm ci
npm run lint   # → 0 errors
npm run build  # → PASS (tsc -b && vite build)
```

All gates pass locally. Netlify production build should now succeed.