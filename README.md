# Anspruch

A grounded German benefits-eligibility assistant. Tell it your situation, it
tells you which benefits you likely qualify for — every claim cited to the
official rule, amounts computed deterministically, and an honest "I can't
determine this yet" instead of a guess.

Three subsystems compose into one product: **Atlas** (grounding/RAG),
**Relay** (orchestration + human approval), **Lens** (eval + guardrails).
First benefit module: **Wohngeld**.

## Status

| Part | State |
|---|---|
| Rules engine + Wohngeld module | ✅ Working. All figures checked against the WoGG on 2026-10-14; household sizes 1–4 verified against the official BMWSB Wohngeldrechner |
| Eligibility API (FastAPI) | ✅ `POST /api/v1/eligibility/assess` |
| Website (React, DE/EN) | ✅ Landing, eligibility check, how it works, privacy |
| Grounding corpus (`packages/grounding`) | 🟡 Statute sections registered; texts not yet filled |
| Atlas RAG, Relay (LangGraph), Lens guards | ⬜ Designed in `docs/ARCHITECTURE.md`, not yet built |

Current limits, stated honestly in the app: Mietstufe lookup covers Würzburg
only; household sizes 5–12 show *unavailable*; the 2025 Wohngeld figures
expire on 2026-12-31 (the 2027 reform's figures are not yet published).
See `docs/WOHNGELD_FIGURES.md` for the full audit trail and open items.

## Layout

```
docs/                      ARCHITECTURE.md (design + security) · CONTRACT.md (data contract)
                           WOHNGELD_FIGURES.md (every figure, its source, verification status)
packages/
  core/anspruch_core/      types.py — THE contract (source of truth)
  rules_engine/            deterministic engine + Wohngeld module (tested)
  grounding/               dated statute corpus for citations (never feeds the engine)
apps/
  frontend/                Vite + React + TS website, DE/EN (no secrets)
  backend/                 FastAPI — POST /api/v1/eligibility/assess
conftest.py                makes the packages importable for pytest
```

## Running locally

Open **two terminals** — backend first, then frontend.

### Terminal 1 — Backend (FastAPI, port 8000)

```bash
# First time only: install monorepo packages + backend deps
pip install -e packages/core -e packages/rules_engine -e packages/grounding
pip install -r apps/backend/requirements.txt

cd apps/backend
cp .env.example .env          # CORS origin → http://localhost:5173
uvicorn app.main:app --reload # http://localhost:8000
```

### Terminal 2 — Frontend (Vite + React, port 5173)

```bash
# First time only
cd apps/frontend
npm install
cp .env.example .env          # VITE_API_BASE_URL=http://localhost:8000

npm run dev                   # http://localhost:5173
```

Try the check with PLZ **97070** (Würzburg), household size 1–4, and a cold
rent — you get a computed amount with the § 19 WoGG citation. Other postcodes
return *cannot determine*, as designed.

### Tests

```bash
# All Python tests (run from repo root)
pytest -q

# Frontend type-check + build
cd apps/frontend && npm run build
```

## Working rules (do not break)

1. The contract wins; if the UI disagrees, change the UI.
2. The LLM never does arithmetic — amounts come only from the rules engine.
3. Never invent euro figures, thresholds, or rules — only dated, cited sources.
   Every figure is listed with its source in `docs/WOHNGELD_FIGURES.md`.
4. The frontend holds no secrets and never calls a provider directly.
5. Small commits; tests green before moving on.

Keep `packages/core/anspruch_core/types.py` and
`apps/frontend/src/contract/types.ts` in lockstep — change both together.

## Disclaimer

Informational guidance, not legal or tax advice. The binding decision rests
with the responsible authority (e.g. the local Wohngeldbehörde).
