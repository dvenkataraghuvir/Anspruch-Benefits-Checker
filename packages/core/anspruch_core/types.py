"""Anspruch — locked domain contract.

This module is the SINGLE SOURCE OF TRUTH for the shape of an eligibility
result and the user situation it is computed from. The deterministic rules
engine produces these types; the API serialises them; the UI renders them.
If this file and the UI disagree, this file wins — change the UI, not the rule.

Money is always Decimal, never float. Amounts and thresholds are NEVER
invented here; they are transcribed from dated official sources at build time.
"""
from __future__ import annotations

from datetime import date
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, Field, field_validator, model_validator


class ResultState(str, Enum):
    """The five states a benefit result can take.

    These map 1:1 to the ResultCard states in the UI:
      ELIGIBLE            -> green ✓, shows estimated_amount
      ELIGIBLE_NO_AMOUNT  -> green ✓, non-monetary entitlement (e.g. WBS certificate)
      NOT_ELIGIBLE        -> neutral slate −, `reason` explains why (never red)
      CANNOT_DETERMINE    -> calm ochre ?, `missing_inputs` names what's needed
      UNAVAILABLE         -> cool grey, system/temporary error, retryable, not the user's fault
    """

    ELIGIBLE = "eligible"
    ELIGIBLE_NO_AMOUNT = "eligible_no_amount"
    NOT_ELIGIBLE = "not_eligible"
    CANNOT_DETERMINE = "cannot_determine"
    UNAVAILABLE = "unavailable"


class ResidenceStatus(str, Enum):
    """Mirrors the four intake radio options exactly.

    NOTE: 'German or EU citizen' is one UI choice, so it is one value here.
    If a future benefit must distinguish German from EU/EEA, the intake step
    must be split first — do not infer the distinction in a rule.
    """

    GERMAN_OR_EU = "german_or_eu"
    SETTLED_PERMIT = "settled_permit"      # Niederlassungserlaubnis (permanent)
    RESIDENCE_PERMIT = "residence_permit"  # Aufenthaltserlaubnis (temporary)
    OTHER_UNSURE = "other_unsure"


class Money(BaseModel):
    """Exact monetary value. Construct with Decimal, int, or str — never float
    arithmetic. Floats are coerced via str to avoid binary-float imprecision."""

    amount: Decimal
    currency: str = "EUR"

    @field_validator("amount", mode="before")
    @classmethod
    def _coerce_exact(cls, v: object) -> object:
        if isinstance(v, float):
            return Decimal(str(v))
        return v

    @field_validator("amount")
    @classmethod
    def _non_negative(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError("Money.amount must be non-negative")
        return v


class Child(BaseModel):
    """A child in the household. date_of_birth is optional at intake
    (progressive disclosure), but some benefits — e.g. Kinderzuschlag —
    require it and will return CANNOT_DETERMINE without it."""

    date_of_birth: date | None = None


class HouseholdMember(BaseModel):
    """Per-member income and deduction flags for § 16 WoGG.

    gross_income is the member's total monthly gross income before deductions.
    The three boolean flags correspond to the three qualifying deduction types
    under § 16 WoGG; each reduces that member's counted income by 10 %.

    monthly_werbungskosten is subtracted from gross_income first (§ 14 WoGG:
    income = positive Einkünfte per § 2 EStG). None counts as 0, matching the
    official Wohngeldrechner default.
    """

    gross_income: Money | None = None           # SENSITIVE
    monthly_werbungskosten: Money | None = None # SENSITIVE; § 14 WoGG / § 9a EStG
    pays_income_tax: bool = False               # Einkommensteuer
    pays_health_care_insurance: bool = False    # gesetzl. Kranken-/Pflegeversicherung
    pays_pension_insurance: bool = False        # gesetzl. Rentenversicherung


class UserSituation(BaseModel):
    """The typed profile every program keys off. Fields marked SENSITIVE are
    GDPR-grade: computed transiently by default, encrypted if persisted, and
    never written to logs or LLM traces."""

    as_of: date  # which day's rules to apply — drives versioned rule selection

    residence_status: ResidenceStatus = ResidenceStatus.OTHER_UNSURE
    age: int | None = None
    household_size: int | None = None          # total people incl. self
    children: list[Child] = Field(default_factory=list)

    monthly_net_income: Money | None = None     # SENSITIVE
    monthly_cold_rent: Money | None = None       # SENSITIVE (Bruttokaltmiete; engine adds heiz/klima)

    bundesland: str | None = None
    postal_code: str | None = None               # primary Mietstufe key — see CONTRACT.md
    municipality: str | None = None              # tiebreaker when a PLZ spans multiple Mietstufen
    employment_status: str | None = None
    receiving_benefits: list[str] = Field(default_factory=list)
    household_members: list[HouseholdMember] = Field(default_factory=list)  # SENSITIVE; § 16 WoGG
    receives_housing_covering_benefit: bool = False   # § 7 WoGG: Bürgergeld/SGB XII/AsylbLG
    household_assets: Money | None = None             # SENSITIVE; § 21 Nr. 3 WoGG asset check

    @property
    def children_count(self) -> int:
        return len(self.children)


class Citation(BaseModel):
    """Every claim that asserts a rule or an amount must carry one of these.
    No citation -> the UI must not present it as fact."""

    source_title: str
    source_url: str
    effective_year: str
    legal_basis: str | None = None  # e.g. "§ 19 WoGG"
    snippet: str | None = None


class EligibilityResult(BaseModel):
    """The unit the UI renders as a ResultCard. Self-policing: the validator
    below makes contradictory results impossible to construct, so the UI can
    trust the invariants without re-checking them."""

    program_id: str
    program_version: str
    state: ResultState
    headline: str                       # short label / i18n key for the card
    reason: str = ""                    # plain-language explanation
    estimated_amount: Money | None = None
    missing_inputs: list[str] = Field(default_factory=list)
    required_documents: list[str] = Field(default_factory=list)
    application_url: str | None = None
    citations: list[Citation] = Field(default_factory=list)
    notes: list[str] = Field(default_factory=list)  # advisory flags (borderline, Bürgergeld-Vorrang)

    @model_validator(mode="after")
    def _enforce_invariants(self) -> "EligibilityResult":
        if self.state is ResultState.ELIGIBLE and self.estimated_amount is None:
            raise ValueError(
                "ELIGIBLE requires estimated_amount; "
                "use ELIGIBLE_NO_AMOUNT for non-monetary entitlements"
            )
        if self.state is ResultState.ELIGIBLE_NO_AMOUNT and self.estimated_amount is not None:
            raise ValueError("ELIGIBLE_NO_AMOUNT must not carry an amount")
        if self.state is ResultState.CANNOT_DETERMINE and not self.missing_inputs:
            raise ValueError("CANNOT_DETERMINE requires at least one missing input")
        if self.state is ResultState.NOT_ELIGIBLE and not self.reason:
            raise ValueError("NOT_ELIGIBLE requires a plain-language reason")
        return self
