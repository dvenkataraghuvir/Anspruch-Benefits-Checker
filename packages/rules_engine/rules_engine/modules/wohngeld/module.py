"""Wohngeld benefit module.

Figure-INDEPENDENT logic (required inputs, structural exclusions) is real and
unit-tested now. Figure-DEPENDENT logic (the amount) delegates to the
calculator, which raises until official figures are transcribed — at which
point this module returns ELIGIBLE with an amount and the golden tests light up.
"""
from __future__ import annotations

from datetime import date
from decimal import Decimal

from anspruch_core.types import (
    Citation,
    EligibilityResult,
    ResultState,
    UserSituation,
)

from .calculator import AmbiguousMietstufe, HouseholdSizeNotVerified, PostalCodeNotFound, estimate_wohngeld

PROGRAM_ID = "wohngeld"
VERSION = "2026"

# TODO(verify + cite): Wohngeld is generally excluded when the household already
# receives a transfer benefit that itself covers housing costs (e.g. Bürgergeld /
# Grundsicherung). Confirm the exact list against the official source before
# trusting this branch, then fill these keys.
EXCLUDING_BENEFITS: set[str] = set()


def _citation() -> Citation:
    # Mirrors manifest.yaml `source` (figures re-checked 2026-10-14).
    return Citation(
        source_title="Wohngeldgesetz (WoGG)",
        source_url="https://www.gesetze-im-internet.de/wogg/__19.html",
        effective_year=VERSION,
        legal_basis="§ 19 WoGG",
    )


class WohngeldModule:
    program_id = PROGRAM_ID
    version = VERSION
    effective_from = date(2026, 1, 1)
    # 2025 figures expire when the § 43 WoGG update / 2027 reform takes effect.
    # After this date the engine selects no Wohngeld version rather than
    # quoting stale amounts. Add a new versioned module for 2027.
    effective_to: date | None = date(2026, 12, 31)

    def required_attributes(self) -> list[str]:
        # postal_code is the primary Mietstufe key (see CONTRACT.md).
        # municipality is optional — only needed as a tiebreaker when a PLZ
        # spans multiple municipalities with different Mietstufen.
        return [
            "household_size",
            "monthly_cold_rent",
            "bundesland",
            "postal_code",
        ]

    def assess(self, situation: UserSituation) -> EligibilityResult:
        # ── § 7 WoGG: transfer-benefit exclusion ─────────────────────────────
        # Households receiving Bürgergeld (SGB II), Sozialhilfe/Grundsicherung
        # (SGB XII), or Asylbewerberleistungen are excluded when housing costs
        # are already covered by those benefits.
        if situation.receives_housing_covering_benefit:
            return EligibilityResult(
                program_id=PROGRAM_ID,
                program_version=VERSION,
                state=ResultState.NOT_ELIGIBLE,
                headline="Not eligible: housing costs covered by another benefit",
                reason=(
                    "Households receiving Bürgergeld (SGB II), Sozialhilfe or "
                    "Grundsicherung (SGB XII), or Asylbewerberleistungen are "
                    "excluded from Wohngeld while housing costs are covered by "
                    "those benefits (§ 7 WoGG)."
                ),
                citations=[_citation()],
            )

        # ── § 21 Nr. 3 WoGG: substantial assets ──────────────────────────────
        # Allowance: 60,000 € for the first member + 30,000 € per additional.
        # Threshold sourced from WoGVwV (Wohngeld-Verwaltungsvorschrift).
        if situation.household_assets is not None and situation.household_size is not None:
            allowance = Decimal("60000") + Decimal("30000") * (situation.household_size - 1)
            if situation.household_assets.amount > allowance:
                return EligibilityResult(
                    program_id=PROGRAM_ID,
                    program_version=VERSION,
                    state=ResultState.NOT_ELIGIBLE,
                    headline="Not eligible: assets exceed the allowance",
                    reason=(
                        f"Household assets exceed the allowance of "
                        f"{int(allowance):,} € "
                        f"(60,000 € + 30,000 € × {situation.household_size - 1} "
                        f"additional members). Claiming Wohngeld with substantial "
                        f"assets is not permitted (§ 21 Nr. 3 WoGG; WoGVwV)."
                    ),
                    citations=[_citation()],
                )

        # ── Structural exclusion (receiving_benefits string list) ─────────────
        if EXCLUDING_BENEFITS & set(situation.receiving_benefits):
            return EligibilityResult(
                program_id=PROGRAM_ID,
                program_version=VERSION,
                state=ResultState.NOT_ELIGIBLE,
                headline="Likely not eligible",
                reason="Your housing costs are already covered by another benefit you receive.",
                citations=[_citation()],
            )

        # ── Amount (figure-dependent) ─────────────────────────────────────────
        # PostalCodeNotFound: PLZ absent from the WoGV lookup table.
        # AmbiguousMietstufe: PLZ maps to multiple Mietstufen; municipality needed.
        # WohngeldFiguresNotLoaded: propagates to the engine → UNAVAILABLE.
        try:
            amount = estimate_wohngeld(situation)
        except PostalCodeNotFound:
            return EligibilityResult(
                program_id=PROGRAM_ID,
                program_version=VERSION,
                state=ResultState.CANNOT_DETERMINE,
                headline="Postal code not recognised",
                reason=(
                    "The postal code you entered was not found in our Mietstufe table. "
                    "Please check the postal code or contact your local Wohngeldbehörde."
                ),
                missing_inputs=["postal_code"],
                citations=[_citation()],
            )
        except AmbiguousMietstufe as exc:
            candidates = ", ".join(exc.candidates)
            return EligibilityResult(
                program_id=PROGRAM_ID,
                program_version=VERSION,
                state=ResultState.CANNOT_DETERMINE,
                headline="Municipality needed to determine Mietstufe",
                reason=(
                    f"This postal code covers multiple municipalities with different "
                    f"Mietstufen: {candidates}. Please add your municipality."
                ),
                missing_inputs=["municipality"],
                citations=[_citation()],
            )
        except HouseholdSizeNotVerified:
            return EligibilityResult(
                program_id=PROGRAM_ID,
                program_version=VERSION,
                state=ResultState.UNAVAILABLE,
                headline="Not yet verified for this household size",
                reason=(
                    "Wohngeld for this household size isn't verified yet. "
                    "We add more sizes once we have checked them against the "
                    "official calculator."
                ),
                citations=[_citation()],
            )

        # ── Amount-based eligibility ──────────────────────────────────────────
        if amount.amount == Decimal("0"):
            return EligibilityResult(
                program_id=PROGRAM_ID,
                program_version=VERSION,
                state=ResultState.NOT_ELIGIBLE,
                headline="Income above the Wohngeld limit",
                reason=(
                    "Based on your household size and income, the calculated "
                    "Wohngeld amount is zero, so your income is above the limit "
                    "for your household."
                ),
                citations=[_citation()],
            )

        notes: list[str] = []
        if amount.amount <= Decimal("10"):
            notes.append(
                "This estimated amount is very small (≤ 10 €). At this income "
                "level the official Wohngeld calculator may return 0 €. Please "
                "verify with your local Wohngeldbehörde before applying."
            )
            notes.append(
                "If your income is too low to meet basic needs even with Wohngeld, "
                "Bürgergeld (SGB II) typically covers housing costs in full. "
                "Consider checking your Bürgergeld eligibility first."
            )

        return EligibilityResult(
            program_id=PROGRAM_ID,
            program_version=VERSION,
            state=ResultState.ELIGIBLE,
            headline="Likely eligible",
            reason=(
                "Based on your household size, income and rent."
            ),
            estimated_amount=amount,
            notes=notes,
            citations=[_citation()],
        )
