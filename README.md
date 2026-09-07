# Dikshit — Developer Portfolio + Dashboard

Personal portfolio for Dikshit Sharma, Java Full Stack Developer, plus a live dashboard that
monitors GitHub activity, the Obsidian vault, a private encrypted journal and the
password-protected AMLI_Vault work data.

## Run locally

```bash
npm install
npm run dev
```

Visit `/#/dashboard` (or click the **Dashboard** button in the navbar/hero) to open the
dashboard. In dev without Netlify functions the GitHub + AMLI sections fall back to direct
public APIs, and the password gate accepts `VITE_DEV_DASHBOARD_PASSWORD` if you set it in a
`.env.local`.

## Resume

Put the PDF at:

```text
public/resume/Dikshit_Sharma_Resume.pdf
```

The site links to `/resume/Dikshit_Sharma_Resume.pdf`.

## Dashboard

The dashboard has six tabs:

| Tab       | What it shows |
|-----------|---------------|
| Overview  | Public summary cards + Projects & Skills |
| GitHub    | Contribution heatmap, monthly activity, repos, stats (public) |
| Journal   | Entry-activity graphs (public) + encrypted diary (password) |
| Obsidian  | Categories + notes from the local vault, with `.md` export |
| AMLI      | Aggregate system graphs (public) + artifacts/APIs details (password) |
| Settings  | Configuration reference |

### Password protection

The journal and the AMLI details are locked behind a password. Set it on Netlify:

```text
DASHBOARD_PASSWORD=your-secret-password
```

Verification runs server-side through the `auth` Netlify function (`POST /api/auth`) — the
password is never stored in the browser. Journal entry bodies are additionally AES-256-GCM
encrypted client-side using that same password before they touch localStorage.

### GitHub

Set a fine-grained personal access token (repo:read) as `GITHUB_TOKEN` to enable the full
contribution heatmap and avoid the unauthenticated API rate limit. `GITHUB_USERNAME`
defaults to `Dikshit-Sharma`.

### Obsidian categories

Categories are generated from the local vault with:

```bash
npm run gen:obsidian
```

The script scans `~/Entertainment/Obsidian/Void` (excluding `AMLI_Vault`, `.obsidian` and
`.git`), then writes:

- `src/data/obsidian.generated.ts` — small manifest imported by the app
- `public/obsidian-data/<category>.json` — full note content (loaded on demand)

After adding/editing notes, rerun the script and redeploy. Each category can be exported
back out as Obsidian `.md` files from the dashboard.

### AMLI Vault (work data)

Aggregate graphs are public; the details (recent artifacts, top APIs) are password
protected. The data is pulled from the existing **AMLI Enc/Dec** service
(`amliaes.netlify.app`). Customize the endpoints / auth:

```text
AMLI_ARTIFACTS_URL=https://amliaes.netlify.app/api/artifacts
AMLI_BSA_URL=https://amliaes.netlify.app/api/bsa
AMLI_API_KEY=             # optional X-API-Key sent to the AMLI service
```

A scheduled Netlify function (`amli-sync`) refreshes the snapshot **every morning at
05:30 UTC** and caches it server-side. The "Update now" button on the AMLI tab also
triggers an on-demand refresh.

## Netlify

`netlify.toml` wires up the build (`npm run build`), the functions directory
(`netlify/functions`) and SPA redirects. Required env vars for production are listed in
the dashboard **Settings** tab:

- `DASHBOARD_PASSWORD` — unlocks journal + AMLI details (required)
- `GITHUB_TOKEN` — GitHub heatmap + higher rate limits (recommended)
- `GITHUB_USERNAME` — GitHub account (default: `Dikshit-Sharma`)
- `AMLI_*` — see above (optional overrides)