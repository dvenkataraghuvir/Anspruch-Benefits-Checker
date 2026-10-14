# Anspruch — Project Rules

Read docs/ARCHITECTURE.md, docs/CONTRACT.md, and
packages/core/anspruch_core/types.py before starting any task.
These three files are the source of truth. When in doubt, re-read them.

## Non-negotiable rules

1. **The contract wins.** If the UI and docs/CONTRACT.md disagree, change the UI.
2. **The LLM never does arithmetic.** Eligibility and amounts come only from the
   deterministic rules engine. Never compute, estimate, or infer a euro figure.
3. **Never invent figures, rules, or lookup data.** No euro thresholds, Mietstufe
   assignments, PLZ entries, or statutory rules unless transcribed from a dated
   official source already in the repo. Prefer UNAVAILABLE or CANNOT_DETERMINE
   over any guess.
4. **Small commits. Tests must pass before finishing.** Run pytest and
   (cd apps/frontend && npm run build) before reporting a task complete.
   Do not start the next task until both are green.
5. **Frontend holds no secrets.** The SPA never calls a provider or LLM directly.
   All calls go through the backend.

## Contract lockstep rule

Any change to packages/core/anspruch_core/types.py must be mirrored in
apps/frontend/src/contract/types.ts in the same commit. They must never diverge.

## What not to touch

- Do not populate postal_code_mietstufe, municipality_mietstufe, or any
  calculation figures (coefficients, rent ceilings, income deductions) in
  manifest.yaml. Leave all as null / empty — the user fills these from the
  official WoGV Anlage and Wohngeldrechner.
- Do not restructure or regenerate the rules engine, backend, or frontend unless
  explicitly asked.
