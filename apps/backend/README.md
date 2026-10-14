# Anspruch — backend (FastAPI)

The thin vertical slice: exposes the deterministic eligibility engine over HTTP.
No database, no LLM, no real figures yet — that is intentional.

## Run

```bash
# from repo root, install the local packages once (editable):
pip install -e packages/core -e packages/rules_engine

# then the backend deps:
pip install -r apps/backend/requirements.txt

# run (from this directory):
cd apps/backend
uvicorn app.main:app --reload --port 8000
# GET  http://localhost:8000/healthz
# POST http://localhost:8000/api/v1/eligibility/assess  { "situation": { ... } }
```

Point the frontend at it: set `VITE_API_BASE_URL=http://localhost:8000` in
`apps/frontend/.env`, run `npm run dev`, submit the intake form — you'll get live
results (Wohngeld = UNAVAILABLE until figures are transcribed; missing inputs =
CANNOT_DETERMINE).

## Test

```bash
cd apps/backend && pytest -q
```

## Adding a benefit later

Register its module in `app/registry.py`. Nothing else changes — the endpoint,
serialization, and contract are benefit-agnostic.
