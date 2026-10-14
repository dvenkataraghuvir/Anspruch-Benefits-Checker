# Anspruch — frontend (Vite + React + TypeScript)

The public website **and** the app. Holds **no secrets**; talks only to the
backend. Runs standalone with sample data until the backend is reachable.

## Run

```bash
npm install
cp .env.example .env      # VITE_API_BASE_URL=http://localhost:8000
npm run dev               # http://localhost:5173
npm run build             # typecheck + production build
```

Out of the box the check page shows all five `ResultCard` states with sample
data. Once the backend exposes `POST /api/v1/eligibility/assess`, the intake
form submits to it and shows real results; until then it falls back to the
sample gracefully.

## Pages

| Route | Page |
|---|---|
| `/` | Landing — hero, trust principles, how it works, programs, FAQ |
| `/check` | The eligibility check (intake form + result cards) |
| `/how-it-works` | Methodology — pipeline, the five result states, guarantees |
| `/privacy` | Plain-language data-handling summary |
| `*` | 404 |

## i18n (DE / EN)

- All UI copy lives in `src/i18n/translations.ts`. `en` defines the shape;
  `de` is typed against it, so a missing key is a compile error.
- `useI18n()` provides `{ lang, setLang, t }`; the toggle in the header
  persists the choice in `localStorage` and updates `<html lang>`.
- Language is auto-detected from the browser on first visit (German browsers
  get DE).
- Backend-produced strings (`reason`, `missing_inputs`, `notes`) are shown
  as delivered — localizing them is a backend concern (locale param), not a
  frontend one.
- No third-party fonts or scripts are loaded (system font stack) — keeps the
  site self-contained and avoids GDPR issues with external font CDNs.

## What's here

```
src/
  contract/types.ts        # TS mirror of the Python contract — KEEP IN SYNC
  lib/api.ts               # typed client; only talks to the backend
  i18n/                    # translations + provider (DE/EN)
  components/Layout.tsx    # header nav, language toggle, footer
  components/ResultCard.tsx# the hero: all five states from one `state` prop
  pages/                   # Home, Check, HowItWorks, Privacy, NotFound
  features/intake/         # IntakeForm
  features/results/        # ResultsScreen + sample data
  index.css                # Anspruch design tokens (green / sand / status tones)
```

## Deploying

`npm run build` emits a static site in `dist/`. Any static host works
(Netlify, Vercel, Cloudflare Pages, nginx). Two things to configure:

1. **SPA fallback** — rewrite all paths to `/index.html` (client-side routing).
   - Netlify: `/* /index.html 200` in `_redirects`
   - Vercel: `{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }`
   - nginx: `try_files $uri /index.html;`
2. **`VITE_API_BASE_URL`** — set at build time to the deployed backend URL,
   and add the site origin to the backend's `cors_allow_origins` allowlist.

## Recommended next adds (kept out to stay minimal)

- `@tanstack/react-query` for server state once real data fetching grows.
- Program-detail and checklist screens when the backend endpoints exist.
