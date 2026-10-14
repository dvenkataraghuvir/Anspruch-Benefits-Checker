# Anspruch — System Architecture & MVP Blueprint

> Working product name: **Anspruch** ("entitlement / claim").
> Three subsystems — **Atlas** (grounding), **Relay** (orchestration), **Lens** (eval/guardrails) — composed into one product: a grounded German benefits-entitlement assistant.
> Status: blueprint. First module to implement = **Wohngeld**.

---

## 0. What this product is

A user describes their situation. Anspruch tells them which benefits they likely qualify for, **computes the amounts deterministically**, **grounds every claim in the official rule with a citation**, drafts the application checklist, and **never submits anything without explicit human approval**. It says "I don't know — verify with the authority" rather than guessing.

The core promise — *cite the source or refuse* — is not a feature. It is the reason the product is trustworthy in a money domain.

---

## 1. The decisions that shaped everything

| # | Decision | Why |
|---|---|---|
| D1 | **Monorepo modular monolith**, not 3 microservices | One deploy for the MVP; hard module boundaries so you can split later without a rewrite. Avoids premature distributed-systems cost. |
| D2 | **LLM never does arithmetic** | Eligibility & amounts are calculations → deterministic, typed, unit-tested rules engine. LLM extracts the situation and explains the result. |
| D3 | **Rules-as-versioned-modules** | Each benefit = pluggable module + dated, sourced manifest. Bürgergeld→Neue Grundsicherung becomes a data change, not a code change. |
| D4 | **EU data residency + data minimization by design** | GDPR-grade PII (income, household, benefit status). Transient by default, encrypted at rest if persisted, never logged, EU region only. |
| D5 | **Frontend holds zero secrets** | SPA → backend (BFF) → providers. httpOnly cookie sessions. Fixes the `file://`-calls-LLM-directly key-leak in the current Atlas. |
| D6 | **Output guard cross-checks numbers** | Any figure in an LLM explanation must match the engine output, or the response is blocked. |
| D7 | **Human-in-the-loop before any consequential action** | Relay never auto-submits an official form. Idempotent execute step, mandatory approval gate. |

---

## 2. System boundaries

```
                         ┌─────────────────────────────────────────────┐
                         │                 FRONTEND (SPA)               │
                         │      React + TS + Vite · no secrets           │
                         └───────────────────────┬─────────────────────┘
                                                  │ httpOnly cookie (session)
                                                  ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                          BACKEND  (FastAPI modular monolith)                        │
│                                                                                    │
│   ┌──────────────┐   ┌─────────────────────┐   ┌──────────────┐   ┌────────────┐   │
│   │   ATLAS      │   │  RULES ENGINE (core)│   │   RELAY      │   │   LENS     │   │
│   │  grounding   │   │  deterministic      │   │ orchestration│   │ eval +     │   │
│   │  RAG + cite  │◄──┤  eligibility/amount │◄──┤ LangGraph    │──►│ guardrails │   │
│   │  + refuse    │   │  rules-as-modules   │   │ + HITL       │   │ + tracing  │   │
│   └──────┬───────┘   └──────────┬──────────┘   └──────┬───────┘   └─────┬──────┘   │
│          │                      │                     │                 │          │
└──────────┼──────────────────────┼─────────────────────┼─────────────────┼──────────┘
           ▼                      ▼                     ▼                 ▼
      ┌─────────┐           ┌──────────┐          ┌─────────┐       ┌──────────┐
      │ Qdrant  │           │ Postgres │          │  Redis  │       │ Postgres │
      │ vectors │           │ rules,   │          │ state,  │       │ traces,  │
      │         │           │ users,   │          │ rate-   │       │ eval,    │
      │         │           │ assess.  │          │ limit   │       │ audit    │
      └─────────┘           └──────────┘          └─────────┘       └──────────┘
```

- **Atlas** answers "what does the official rule say?" → grounded prose + citations + refusal. Stateless w.r.t. the user.
- **Rules Engine** answers "does this person qualify and for how much?" → deterministic, no LLM. The heart of the product.
- **Relay** runs the multi-step flow: intake → assess → ground → draft checklist → **approve** → (optional) assisted submit.
- **Lens** wraps every LLM call: input guard (PII/injection), output guard (groundedness/number-check), tracing, eval harness, dashboards.

---

## 3. Tech stack (minimal, scalable, EU-friendly)

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React + TypeScript + Vite SPA; TanStack Query for server state | No secrets client-side. Add Next.js marketing site later if SEO needed. |
| Backend | Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2 (async) | One deployable; modules with clean interfaces. |
| Orchestration | LangGraph + Redis checkpointer | Relay state machine, resumable, HITL pause. |
| RAG | Qdrant (EU region), BAAI/bge embeddings (local), ms-marco reranker (local) | Reuse from current Atlas. |
| LLM | Groq (primary) · NVIDIA NIM (fallback) · Gemini (judge) | Config-driven, swappable. |
| Relational DB | PostgreSQL (managed, EU region) | Rules registry, users, assessments, traces, audit. |
| Cache/queue | Redis (EU region) | Sessions cache, rate limiting, LangGraph state. |
| Auth | Managed provider (Clerk / Supabase Auth / Authentik) | **Never roll your own.** Session via httpOnly cookie. |
| Secrets | Platform secret manager / env injection | Never in repo. Rotatable. |
| CI | GitHub Actions | Tests + eval regression gate + dependency scan. |

---

## 4. Monorepo file structure

```
anspruch/
├── README.md
├── docker-compose.yml                # local dev: postgres, qdrant, redis, backend
├── .github/workflows/
│   ├── ci.yml                        # lint, typecheck, unit tests
│   └── eval.yml                      # Lens golden-set regression gate
├── packages/                         # shared, importable
│   ├── core/                         # cross-cutting domain types + utils
│   │   └── anspruch_core/
│   │       ├── types.py              # UserSituation, Money, Citation, ...
│   │       ├── security.py           # PII redaction, field encryption helpers
│   │       └── errors.py
│   └── rules_engine/                 # THE deterministic heart
│       └── rules_engine/
│           ├── protocol.py           # BenefitModule protocol
│           ├── engine.py             # EligibilityEngine (date-aware registry)
│           ├── registry.py
│           ├── manifests/            # dated, sourced metadata (data, not code)
│           │   └── wohngeld.2026.yaml
│           └── modules/              # one folder per benefit
│               └── wohngeld/
│                   ├── __init__.py
│                   ├── eligibility.py
│                   ├── calculator.py
│                   └── tests/
│                       └── test_wohngeld.py
├── apps/
│   ├── backend/                      # FastAPI modular monolith
│   │   └── app/
│   │       ├── main.py               # app factory, router wiring, lifespan
│   │       ├── config.py             # pydantic-settings, secrets from env
│   │       ├── db/
│   │       │   ├── session.py
│   │       │   └── migrations/       # Alembic
│   │       ├── deps.py               # auth dependency, rate-limit, db session
│   │       ├── modules/
│   │       │   ├── atlas/            # grounding RAG
│   │       │   │   ├── router.py
│   │       │   │   ├── service.py
│   │       │   │   ├── retriever.py  # Retriever / Reranker / Generator / Judge
│   │       │   │   └── ingest.py
│   │       │   ├── eligibility/      # thin API over packages/rules_engine
│   │       │   │   ├── router.py
│   │       │   │   └── service.py
│   │       │   ├── relay/            # LangGraph workflows
│   │       │   │   ├── router.py
│   │       │   │   ├── graph.py
│   │       │   │   └── tools.py
│   │       │   └── lens/             # eval + guardrails + tracing
│   │       │       ├── router.py
│   │       │       ├── middleware.py # input/output guards
│   │       │       ├── tracing.py
│   │       │       └── eval.py
│   │       └── models/               # SQLAlchemy + Pydantic schemas
│   └── frontend/                     # Vite React TS SPA
│       └── src/
│           ├── main.tsx
│           ├── lib/api.ts            # typed client, talks ONLY to backend
│           ├── features/
│           │   ├── intake/           # situation form
│           │   ├── results/          # entitlement dashboard
│           │   ├── program/          # grounded detail + checklist
│           │   ├── assistant/        # Relay flow + HITL approval
│           │   └── observability/    # Lens dashboard (admin)
│           └── components/           # design system
└── docs/
    └── ARCHITECTURE.md               # this file
```

---

## 5. Database schema (PostgreSQL)

Sensitive columns marked 🔒 are encrypted at rest (app-level, e.g. `pgcrypto`/envelope encryption) and **never** logged or sent to Lens traces.

```sql
-- Identity (minimal PII; auth handled by provider)
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_subject  TEXT UNIQUE NOT NULL,        -- provider subject id
  email         TEXT UNIQUE NOT NULL,
  locale        TEXT NOT NULL DEFAULT 'de',
  role          TEXT NOT NULL DEFAULT 'user',-- user | admin
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ                  -- soft delete for GDPR erasure
);

-- Versioned, dated, sourced benefit definitions (registry mirror of repo manifests)
CREATE TABLE program_definitions (
  id             TEXT NOT NULL,              -- 'wohngeld'
  version        TEXT NOT NULL,              -- '2026'
  jurisdiction   TEXT NOT NULL DEFAULT 'DE',
  effective_from DATE NOT NULL,
  effective_to   DATE,                       -- NULL = current
  role_tags      TEXT[] NOT NULL,            -- ['housing'] / ['health','tax-relief']
  source_url     TEXT NOT NULL,
  source_title   TEXT NOT NULL,
  source_fetched TIMESTAMPTZ NOT NULL,
  content_hash   TEXT NOT NULL,              -- integrity of the loaded manifest
  manifest       JSONB NOT NULL,
  PRIMARY KEY (id, version)
);
CREATE INDEX ON program_definitions (jurisdiction, effective_from, effective_to);
CREATE INDEX ON program_definitions USING GIN (role_tags);

-- Atlas corpus metadata (vectors live in Qdrant; this is the dated source registry)
CREATE TABLE documents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url     TEXT NOT NULL,
  title          TEXT NOT NULL,
  jurisdiction   TEXT NOT NULL DEFAULT 'DE',
  effective_date DATE,
  fetched_at     TIMESTAMPTZ NOT NULL,
  content_hash   TEXT NOT NULL,
  qdrant_collection TEXT NOT NULL
);

-- Audit trail of every eligibility computation (which rule version was used)
CREATE TABLE assessments (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES users(id) ON DELETE CASCADE,
  as_of_date         DATE NOT NULL,
  situation_snapshot JSONB NOT NULL,          -- 🔒 encrypted; minimized
  result             JSONB NOT NULL,          -- programs, amounts, citations
  program_versions   JSONB NOT NULL,          -- {'wohngeld':'2026', ...}
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON assessments (user_id, created_at);

-- Relay workflow runs (state checkpoint primarily in Redis; durable record here)
CREATE TABLE workflow_runs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  kind          TEXT NOT NULL,                -- 'wohngeld_application'
  status        TEXT NOT NULL,                -- running|awaiting_approval|done|failed
  current_node  TEXT,
  idempotency_key TEXT UNIQUE,                -- guards consequential actions
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lens: one row per LLM call (PII redacted BEFORE insert)
CREATE TABLE traces (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id     UUID NOT NULL,
  module         TEXT NOT NULL,               -- atlas|relay|...
  model          TEXT NOT NULL,
  prompt_redacted TEXT NOT NULL,              -- PII-stripped
  tokens_in      INT, tokens_out INT,
  latency_ms     INT,
  cost_usd       NUMERIC(10,6),
  groundedness   NUMERIC(4,3),
  guard_flags    TEXT[],                      -- ['pii_blocked','number_mismatch']
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON traces (module, created_at);

-- Lens: eval harness
CREATE TABLE eval_runs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  git_sha     TEXT NOT NULL,
  dataset     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE eval_results (
  run_id        UUID REFERENCES eval_runs(id) ON DELETE CASCADE,
  metric        TEXT NOT NULL,                -- faithfulness|context_recall|mrr|...
  value         NUMERIC(6,4) NOT NULL,
  PRIMARY KEY (run_id, metric)
);

-- Compliance audit log (security-relevant events)
CREATE TABLE audit_log (
  id          BIGSERIAL PRIMARY KEY,
  actor       TEXT, action TEXT NOT NULL, target TEXT,
  ip_hash     TEXT,                           -- hashed, not raw
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 6. Core production code

### 6.1 Domain types (`packages/core/anspruch_core/types.py`)

```python
from __future__ import annotations
from datetime import date
from decimal import Decimal
from enum import Enum
from pydantic import BaseModel, Field


class ResidenceStatus(str, Enum):
    GERMAN = "german"
    EU_EEA = "eu_eea"            # freedom of movement
    NON_EU_PERMIT = "non_eu_permit"
    ASYLUM = "asylum"
    UNKNOWN = "unknown"


class Money(BaseModel):
    amount: Decimal             # store as Decimal, never float — money rule
    currency: str = "EUR"


class UserSituation(BaseModel):
    """Typed profile. Cross-cutting attributes every program keys off."""
    as_of: date
    residence_status: ResidenceStatus = ResidenceStatus.UNKNOWN
    age: int | None = None
    household_size: int | None = None
    children_count: int = 0
    monthly_net_income: Money | None = None     # 🔒 sensitive
    monthly_rent_warm: Money | None = None       # 🔒 sensitive
    bundesland: str | None = None                # region affects ceilings
    employment_status: str | None = None
    receiving_other_benefits: list[str] = Field(default_factory=list)


class Citation(BaseModel):
    source_title: str
    source_url: str
    effective_year: str
    snippet: str | None = None


class EligibilityResult(BaseModel):
    program_id: str
    program_version: str
    eligible: bool | None        # None = "can't determine — missing data"
    reason: str
    missing_inputs: list[str] = Field(default_factory=list)
    estimated_amount: Money | None = None
    citations: list[Citation] = Field(default_factory=list)
    required_documents: list[str] = Field(default_factory=list)
    application_url: str | None = None
```

### 6.2 Module protocol (`packages/rules_engine/rules_engine/protocol.py`)

```python
from typing import Protocol, runtime_checkable
from anspruch_core.types import UserSituation, EligibilityResult


@runtime_checkable
class BenefitModule(Protocol):
    program_id: str
    version: str
    effective_from: str   # ISO date
    effective_to: str | None

    def required_attributes(self) -> list[str]: ...
    def assess(self, s: UserSituation) -> EligibilityResult: ...
```

### 6.3 The engine (`packages/rules_engine/rules_engine/engine.py`)

```python
from datetime import date
from anspruch_core.types import UserSituation, EligibilityResult
from .protocol import BenefitModule


class EligibilityEngine:
    """Deterministic. No LLM. Selects the rule version valid on `as_of`."""

    def __init__(self, modules: list[BenefitModule]):
        self._modules = modules

    def _active(self, as_of: date) -> list[BenefitModule]:
        out = []
        for m in self._modules:
            start = date.fromisoformat(m.effective_from)
            end = date.fromisoformat(m.effective_to) if m.effective_to else None
            if start <= as_of and (end is None or as_of <= end):
                out.append(m)
        return out

    def assess_all(self, s: UserSituation) -> list[EligibilityResult]:
        results: list[EligibilityResult] = []
        for m in self._active(s.as_of):
            missing = [a for a in m.required_attributes()
                       if getattr(s, a, None) in (None, [])]
            if missing:
                # Honest "can't determine" — never guess.
                results.append(EligibilityResult(
                    program_id=m.program_id, program_version=m.version,
                    eligible=None, reason="insufficient information",
                    missing_inputs=missing))
                continue
            results.append(m.assess(s))
        return results
```

The LLM sits **around** this: it extracts a `UserSituation` from chat (validated by Pydantic), calls `assess_all`, then explains the structured results in plain language using only the `citations` provided. The Lens output guard rejects any explanation whose numbers don't match the engine's `estimated_amount`.

### 6.4 Atlas interfaces (`apps/backend/app/modules/atlas/retriever.py`)

```python
from typing import Protocol
from langchain_core.documents import Document


class Retriever(Protocol):
    def retrieve(self, query: str, k: int) -> list[Document]: ...

class Reranker(Protocol):
    def rerank(self, query: str, docs: list[Document], top_k: int) -> list[Document]: ...

class Generator(Protocol):
    async def stream(self, system: str, history: list, question: str): ...

class Judge(Protocol):
    async def faithfulness(self, context: str, answer: str) -> float: ...
```

Swapping Groq→NIM, or BM25→hybrid, is now a constructor change, not surgery on a 290-line function.

### 6.5 Config & secrets (`apps/backend/app/config.py`)

```python
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Secrets ONLY from env / secret manager — never committed.
    groq_api_key: str
    nvidia_api_key: str | None = None
    google_api_key: str | None = None
    qdrant_url: str
    qdrant_api_key: str
    database_url: str
    redis_url: str
    field_encryption_key: str        # for 🔒 columns
    session_secret: str
    cors_allow_origins: list[str] = []   # strict allowlist, no '*'

    region: str = "eu-central-1"
```

### 6.6 Security middleware sketch (`apps/backend/app/modules/lens/middleware.py`)

```python
import re

PII_PATTERNS = [
    re.compile(r"\b\d{2}\s?\d{3}\s?\d{4}\b"),         # phone-ish
    re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+"),          # email
    re.compile(r"\bDE\d{20}\b"),                      # IBAN-ish
]

def redact(text: str) -> str:
    for p in PII_PATTERNS:
        text = p.sub("[REDACTED]", text)
    return text

def output_number_guard(explanation: str, engine_amounts: set[str]) -> bool:
    """Block if the LLM states a money figure the engine never produced."""
    stated = set(re.findall(r"\d[\d.,]*\s?(?:€|EUR|Euro)", explanation))
    return all(s.strip() in engine_amounts for s in stated)
```

---

## 7. API endpoints (v1)

All under `/api/v1`. Auth via httpOnly session cookie. Admin endpoints require `role=admin`.

**Atlas — grounding**
- `POST /atlas/query` → `{question, filters}` ⇒ grounded answer + citations + groundedness; refuses below threshold.
- `POST /atlas/ingest` *(admin)* → ingest an official source (domain-allowlisted URL or upload).
- `GET  /atlas/sources` → dated source registry.

**Eligibility — deterministic**
- `POST /eligibility/assess` → `{situation}` ⇒ `EligibilityResult[]` (amounts, citations, missing inputs).
- `GET  /programs` → list (filter by `role_tag`, `jurisdiction`, `as_of`).
- `GET  /programs/{id}` → manifest (sources, docs, effective dates).

**Relay — orchestration**
- `POST /relay/runs` → start a workflow `{kind, situation}` (idempotency-key header).
- `GET  /relay/runs/{id}` → status + current node.
- `WS   /relay/runs/{id}/stream` → live node/token events.
- `POST /relay/runs/{id}/approve` → HITL gate; required before any consequential step.

**Lens — eval/guardrails/observability**
- `GET  /lens/traces` *(admin)* → filtered, PII-redacted.
- `GET  /lens/metrics` *(admin)* → quality/drift/cost/latency.
- `POST /lens/eval/run` *(CI/admin)* → run golden set, write `eval_results`.

**Platform**
- `GET /healthz`, `GET /readyz`
- `POST /account/delete` → GDPR erasure (soft-delete + purge job).

---

## 8. UI architecture

Single SPA (Vite + React + TS). Server state via TanStack Query. **No secrets, no LLM/provider calls client-side** — the typed `api.ts` client talks only to the backend.

Primary flows:
1. **Situation intake** — a guided, progressive form that builds a validated `UserSituation`. Sensitive fields are clearly marked; nothing is persisted unless the user opts in.
2. **Entitlement dashboard** — cards per program: *eligible / not / can't-determine*, estimated amount, and a "based on this official rule →" citation on every card. "Can't determine" cards show exactly which input is missing.
3. **Program detail** — grounded plain-language explanation (Atlas), required documents, and the application checklist.
4. **Application assistant** — Relay-driven; the **approval step is a hard, visible gate**. Nothing is submitted before the user clicks approve.
5. **Observability (admin)** — Lens dashboard: groundedness over time, drift, cost, latency, guard-flag counts, eval regression chart.

Design-system components are presentational; data fetching is isolated in hooks; routing is feature-based.

---

## 9. Security threat model (what must be avoided)

| Risk | Mitigation in this design |
|---|---|
| Secrets leaked via client | SPA holds none; all provider calls server-side; httpOnly cookies; strict CORS allowlist (no `*` with credentials). |
| Sensitive financial PII | Data minimization; transient by default; 🔒 column encryption at rest; TLS in transit; EU region; never logged; redacted before Lens traces; GDPR erasure endpoint. |
| LLM hallucinated amounts | Deterministic engine computes all numbers; output guard blocks figures the engine didn't produce. |
| Prompt injection from ingested docs/user text | Retrieved content is untrusted data, strictly separated from instructions; it can never trigger a tool/action. |
| Stale rule stated as current | Effective-dated manifests; cite the year used; refuse if no rule valid on `as_of`. |
| Consequential action without consent | Mandatory HITL approval; idempotency keys; never auto-submit official forms. |
| SSRF in ingestion fetcher | Domain allowlist; block private/internal ranges; size/time caps. |
| SQL injection | SQLAlchemy parameterized queries; no string interpolation. |
| Broken/missing auth | Managed auth provider; session validation dependency; RBAC on admin routes. |
| Cost-bombing / DoS via LLM | Per-user Redis rate limits; request size caps; per-user cost budgets. |
| Supply-chain | Pinned deps; `pip-audit`/Dependabot in CI; do not integrate unvetted third-party SDKs (cf. cold-outreach "SDK" pitches). |
| No accountability | `audit_log` for security-relevant events; hashed IPs, not raw. |

---

## 10. Build sequence (start here, next session)

1. **Scaffold** the monorepo (structure in §4), `docker-compose` for postgres+qdrant+redis, FastAPI app factory, config, health checks. Wire auth provider.
2. **Rules engine core** — implement `packages/rules_engine` exactly as §6 (protocol, engine, registry) with unit tests on the engine's date-selection and missing-input logic. No benefit yet.
3. **Wohngeld module** — the first real module:
   - `manifests/wohngeld.2026.yaml`: dated, sourced metadata (official source URL, effective dates, `role_tags: [housing]`, required docs, application URL).
   - `modules/wohngeld/eligibility.py` + `calculator.py`: deterministic renter (Mietzuschuss) and owner (Lastenzuschuss) branches, income/household/rent/region inputs.
   - Golden tests with worked examples pulled from the official calculator.
   > **Note:** all thresholds and amounts must be transcribed from the dated official source at build time and cited — they are intentionally not hardcoded in this blueprint, because they change yearly.
4. **Atlas grounding** for Wohngeld — ingest the official Wohngeld pages, expose `POST /atlas/query` returning a grounded explanation + citation for each eligibility reason.
5. **Lens guards** — wire input PII redaction + output number-guard around the explanation step; start writing traces.
6. **Relay flow** — `wohngeld_application`: intake → assess → ground → draft checklist → **approve**. No submission yet.
7. **Frontend** — intake form + entitlement dashboard + program detail for Wohngeld only.
8. **Eval harness** — a small golden set of situations with known correct outcomes; CI regression gate.

Once Wohngeld is end-to-end and green, every further benefit (Kindergeld, Kinderzuschlag, BAföG, Bürgergeld/Neue Grundsicherung, …) is a new manifest + module + tests — the engine, API, UI, and guards do not change.
