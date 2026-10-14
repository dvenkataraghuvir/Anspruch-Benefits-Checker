# Anspruch — Data Contract (source of truth)

This document and `packages/core/anspruch_core/types.py` define the contract that
the rules engine, the API, and the UI all build against. **If the UI and this
contract disagree, the contract wins — change the UI, not the rule.**

## The five result states

Every benefit result is exactly one `ResultState`. They map 1:1 to the UI's
ResultCard states.

| State | Meaning | UI treatment | Required fields |
|---|---|---|---|
| `ELIGIBLE` | Qualifies, monetary | green ✓ + amount | `estimated_amount` present |
| `ELIGIBLE_NO_AMOUNT` | Qualifies, non-monetary (e.g. WBS) | green ✓, no amount | `estimated_amount` must be absent |
| `NOT_ELIGIBLE` | Does not qualify | neutral slate − (never red) | `reason` present |
| `CANNOT_DETERMINE` | Need more info | calm ochre ? + "Add detail" | `missing_inputs` non-empty |
| `UNAVAILABLE` | System/temporary error | cool grey, retry; "not your fault" | — |

These invariants are **enforced in code** by a Pydantic validator on
`EligibilityResult`. A contradictory result (e.g. `ELIGIBLE` with no amount)
cannot be constructed — it raises. The UI can therefore trust them blindly.

## UserSituation (the typed profile)

`as_of` (date) drives which rule version applies. Cross-cutting fields:
`residence_status`, `age`, `household_size`, `children` (list, each with optional
`date_of_birth`), `monthly_net_income` (SENSITIVE), `monthly_cold_rent`
(SENSITIVE; Bruttokaltmiete — the engine adds the § 12 WoGG heating and climate
components itself), `bundesland`, `municipality`, `employment_status`,
`receiving_benefits`.

Additional fields:
- `receives_housing_covering_benefit` (bool, default false) — § 7 WoGG gate: true
  if the household receives Bürgergeld (SGB II), Sozialhilfe/Grundsicherung (SGB XII),
  or Asylbewerberleistungen with housing costs covered. Triggers NOT_ELIGIBLE before
  the formula runs.
- `household_members[].monthly_werbungskosten` (Money | null, SENSITIVE) — § 14 WoGG:
  subtracted from that member's gross income before the § 16 deductions; each
  member's result is floored at 0. Null counts as 0 (the official
  Wohngeldrechner's default). The intake pre-fills the § 9a EStG
  Arbeitnehmer-Pauschbetrag; the engine never assumes it.
- `household_assets` (Money | null, SENSITIVE) — § 21 Nr. 3 WoGG gate: if assets
  exceed 60,000 € + 30,000 € × (household_size − 1), triggers NOT_ELIGIBLE.
- `EligibilityResult.notes` (list[str]) — advisory-only channel for borderline
  warnings ("result is ≤ 10 €, verify with official calculator") and the
  Bürgergeld-Vorrang hint. Never changes the state; the UI may render these beneath
  the card.

- **Money is always `Decimal`**, never float. Floats are coerced via `str`.
- **SENSITIVE** fields are GDPR-grade: transient by default, encrypted if
  persisted, never logged, never sent to LLM traces.

## Two findings the design surfaced (decide before building UI logic)

1. **Mietstufe lookup uses postal code (PLZ) as the primary key, with municipality
   as an optional tiebreaker.** `postal_code` is the primary field: the rules
   engine looks up the PLZ in the `postal_code_mietstufe` table (WoGV Anlage) to
   get the Mietstufe. If a PLZ covers multiple municipalities with *different*
   Mietstufen, `municipality` is required to resolve the ambiguity; otherwise it
   is ignored. `bundesland` alone cannot produce an accurate amount.

2. **Per-child dates of birth.** `children` is a list of `Child`, each with an
   optional `date_of_birth`. Benefits like Kinderzuschlag require it and will
   return `CANNOT_DETERMINE` (naming the missing input) until provided. The
   intake's progressive child-DOB rows map directly onto this.

## How the LLM relates to this contract

The LLM never produces an `EligibilityResult` and never computes an amount. It
(a) extracts a `UserSituation` from the conversation (validated by Pydantic),
and (b) explains the engine's already-computed result in plain language using
only the `citations` attached. An output guard rejects any explanation whose
euro figures don't match the engine's `estimated_amount`.

## Status of the Wohngeld module

- Real and tested now: required-input detection, structural exclusion branch,
  date-versioned selection, exception safety.
- Pending official figures: the amount calculation. Until transcribed, the live
  app shows Wohngeld as `UNAVAILABLE` (honest, not a fake number). Flip
  `FIGURES_LOADED = True` in the test file once implemented to activate the
  golden acceptance cases.
