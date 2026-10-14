"""Deterministic Wohngeld amount calculation (§§ 16, 19 WoGG + Anlage 2/3).

Three inputs drive the result: household members (with per-member income and
deduction flags), eligible rent M (warm rent capped by the § 12 WoGG Mietstufe
ceiling), and the Anlage 2 coefficients for the household size. All numeric
figures are read from manifest.yaml — never hardcoded here.

Until figures_loaded is true in manifest.yaml, estimate_wohngeld raises
WohngeldFiguresNotLoaded so the live app shows UNAVAILABLE instead of a guess.

Mietstufe resolution (CONTRACT.md):
  postal_code is the primary key into postal_code_mietstufe (WoGV Anlage).
  If a PLZ spans multiple municipalities with different Mietstufen, municipality
  is required as a tiebreaker. Bundesland alone is insufficient.

Income rule (§ 16 WoGG):
  For each household member:
    adjusted_i = gross_i × (1 − 0.10 × n_i)
  where n_i = count of qualifying deductions applied to that member:
    income tax (Einkommensteuer),
    statutory health/care insurance (gesetzliche Kranken-/Pflegeversicherung),
    statutory pension insurance (gesetzliche Rentenversicherung).
  Y = Σ adjusted_i, then floored at the Anlage 3 minimum for the household size.

Formula (§ 19 WoGG + Anlage 3):
  z1 = a + b×M + c×Y
  z2 = z1 × Y
  z3 = M − z2
  z4 = 1.15 × z3
  W = round_half_up(z4), floored at 0.
"""
from __future__ import annotations

import functools
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path
from typing import Any

import yaml

from anspruch_core.types import Money, UserSituation

_MANIFEST_PATH = Path(__file__).parent / "manifest.yaml"
_VALID_MIETSTUFEN = ("I", "II", "III", "IV", "V", "VI", "VII")
_MAX_TABULATED_HOUSEHOLD_SIZE = 12  # Anlage 2/3 tables go up to 12


class WohngeldFiguresNotLoaded(NotImplementedError):
    """Raised until official figures are transcribed from the Wohngeldrechner."""


class PostalCodeNotFound(ValueError):
    """PLZ absent from the postal_code_mietstufe table in manifest.yaml.

    module.assess() converts this into CANNOT_DETERMINE(missing_inputs=["postal_code"]).
    """

    def __init__(self, postal_code: str) -> None:
        super().__init__(
            f"PLZ {postal_code!r} not found in postal_code_mietstufe table. "
            "Populate the table from the official WoGV Anlage."
        )
        self.postal_code = postal_code


class HouseholdSizeNotVerified(NotImplementedError):
    """Raised when household_size is not in manifest verified_household_sizes.

    module.assess() converts this into UNAVAILABLE("not yet verified").
    Add the size to verified_household_sizes only after its golden spot-check
    tests pass against the BMWSB Wohngeldrechner.
    """

    def __init__(self, household_size: int) -> None:
        super().__init__(
            f"Household size {household_size} not in verified_household_sizes. "
            "Run spot-check golden tests against the BMWSB Wohngeldrechner and "
            "add it to manifest.yaml once confirmed."
        )
        self.household_size = household_size


class AmbiguousMietstufe(ValueError):
    """PLZ maps to multiple municipalities with different Mietstufen and no
    municipality tiebreaker was supplied or matched.

    module.assess() converts this into CANNOT_DETERMINE(missing_inputs=["municipality"]).
    """

    def __init__(self, postal_code: str, candidates: list[str]) -> None:
        super().__init__(
            f"PLZ {postal_code!r} covers municipalities with different Mietstufen: "
            f"{candidates!r}. Supply municipality to disambiguate."
        )
        self.postal_code = postal_code
        self.candidates = candidates


@functools.lru_cache(maxsize=1)
def _load_manifest() -> dict[str, Any]:
    with _MANIFEST_PATH.open(encoding="utf-8") as fh:
        return yaml.safe_load(fh)


def resolve_mietstufe(
    postal_code: str,
    municipality: str | None,
    table: dict[str, list[dict[str, str]]],
) -> str:
    """Return the Mietstufe label (I..VII) for a postal code.

    Pure function — no I/O, no manifest loading.

    Resolution rules:
      1. PLZ absent → PostalCodeNotFound.
      2. All entries share one Mietstufe → return it (municipality ignored).
      3. Multiple distinct Mietstufen, municipality matches one entry → return it.
      4. Multiple distinct Mietstufen, no match → AmbiguousMietstufe.
    """
    entries = table.get(postal_code)
    if not entries:
        raise PostalCodeNotFound(postal_code)

    mietstufen = {e["mietstufe"] for e in entries}

    if len(mietstufen) == 1:
        return mietstufen.pop()

    if municipality is not None:
        for entry in entries:
            if entry["municipality"] == municipality:
                return entry["mietstufe"]

    raise AmbiguousMietstufe(postal_code, [e["municipality"] for e in entries])


def _get_rent_ceiling(
    mietstufe: str,
    household_size: int,
    ceilings: dict[str, Any],
) -> Decimal:
    """Return the § 12 WoGG Anlage 1 base rent ceiling (Bruttokaltmiete cap) in EUR.

    For household sizes above 5, each additional member adds each_additional_eur.
    """
    table = ceilings[mietstufe]
    base_size = min(household_size, 5)
    ceiling = Decimal(str(table[base_size]))
    if household_size > 5:
        increment = Decimal(str(table["each_additional_eur"]))
        ceiling += increment * (household_size - 5)
    return ceiling


def _get_size_component(household_size: int, table: dict[str, Any]) -> Decimal:
    """Look up a size-keyed table (heiz or klima) with the same extrapolation rule."""
    base_size = min(household_size, 5)
    value = Decimal(str(table[base_size]))
    if household_size > 5:
        increment = Decimal(str(table["each_additional_eur"]))
        value += increment * (household_size - 5)
    return value


def _round_half_up(d: Decimal) -> Decimal:
    """Round to the nearest euro, halves going up (§ 19 WoGG + Anlage 3)."""
    return d.quantize(Decimal("1"), rounding=ROUND_HALF_UP)


def compute_Y(
    members: list[tuple[Decimal, int]],
    y_floor: Decimal,
) -> Decimal:
    """§ 16 WoGG: adjusted total monthly income, floored at the Anlage 3 minimum.

    For each member tuple (gross, n):
      adjusted = gross × (1 − 0.10 × n)
    where n = number of qualifying deductions that apply to that member (0..3):
      income tax, statutory health/care insurance, statutory pension insurance.

    Y = Σ adjusted; floored at y_floor (Anlage 3 minimum for this household size).
    """
    total = sum(
        gross * (Decimal("1") - Decimal("0.10") * n)
        for gross, n in members
    )
    return max(total, y_floor)


def _compute_wohngeld_amount(
    M: Decimal,
    a: Decimal,
    b: Decimal,
    c: Decimal,
    Y: Decimal,
) -> Decimal:
    """Pure § 19 WoGG formula per Anlage 3. All intermediates stay Decimal.

    z1 = a + b×M + c×Y
    z2 = z1 × Y
    z3 = M − z2
    z4 = 1.15 × z3
    W  = round_half_up(z4), floored at 0.
    """
    z1 = a + b * M + c * Y
    z2 = z1 * Y
    z3 = M - z2
    z4 = Decimal("1.15") * z3
    return max(Decimal("0"), _round_half_up(z4))


def estimate_wohngeld(situation: UserSituation) -> Money:
    """Compute the estimated monthly Wohngeld (§§ 16, 19 WoGG + Anlage 2/3).

    Preconditions (enforced by WohngeldModule.required_attributes before this
    is ever called by the engine):
      situation.postal_code         is not None
      situation.household_size      is not None
      situation.monthly_net_income  is not None  (used as backward-compat fallback)
      situation.monthly_cold_rent   is not None  (Bruttokaltmiete — engine adds heiz/klima)

    Raises:
      WohngeldFiguresNotLoaded — figures_loaded is false in manifest.yaml.
      PostalCodeNotFound       — PLZ absent from postal_code_mietstufe table.
      AmbiguousMietstufe       — PLZ has multiple Mietstufen; municipality needed.
    """
    manifest = _load_manifest()

    # figures_loaded check is FIRST — the live app stays UNAVAILABLE until every
    # required figure is sourced from the official Wohngeldrechner.
    if not manifest.get("figures_loaded", False):
        raise WohngeldFiguresNotLoaded(
            "Wohngeld figures not yet transcribed from the official Wohngeldrechner. "
            "Fill all TODO entries in manifest.yaml and set figures_loaded: true."
        )

    # Household-size honesty gate: only return amounts for sizes verified
    # end-to-end against the BMWSB Wohngeldrechner.
    verified_sizes: list[int] = manifest.get("verified_household_sizes", [])
    if situation.household_size not in verified_sizes:
        raise HouseholdSizeNotVerified(situation.household_size)  # type: ignore[arg-type]

    # Mietstufe from PLZ, with municipality as optional tiebreaker.
    postal_code: str = situation.postal_code  # type: ignore[assignment]
    mietstufe = resolve_mietstufe(
        postal_code,
        situation.municipality,
        manifest.get("postal_code_mietstufe") or {},
    )

    # § 12 WoGG + Anlage 1: M = min(cold_rent, base + klima) + heiz
    #   base  = Anlage 1 base ceiling for (mietstufe, size)
    #   klima = Klimakomponente (§ 12 Abs. 7 WoGG) — added to ceiling cap only
    #   heiz  = Heizkostenkomponente (§ 12 Abs. 6 WoGG) — always added to M
    household_size: int = situation.household_size  # type: ignore[assignment]
    base = _get_rent_ceiling(mietstufe, household_size, manifest["rent_ceilings_eur"])
    klima = _get_size_component(household_size, manifest["klimakomponente_eur"])
    heiz = _get_size_component(household_size, manifest["heizkostenkomponente_eur"])
    cold_rent: Decimal = situation.monthly_cold_rent.amount  # type: ignore[union-attr]
    M = min(cold_rent, base + klima) + heiz

    # § 16 WoGG: build per-member (gross, n) tuples for compute_Y.
    # Use household_members if populated; fall back to single monthly_net_income
    # for backward compat until the intake UI is rebuilt to send per-member data.
    if situation.household_members:
        # § 14 WoGG: Werbungskosten come off first; only positive Einkünfte count.
        members: list[tuple[Decimal, int]] = [
            (
                max(
                    Decimal("0"),
                    m.gross_income.amount
                    - (m.monthly_werbungskosten.amount if m.monthly_werbungskosten else Decimal("0")),
                ),
                int(m.pays_income_tax)
                + int(m.pays_health_care_insurance)
                + int(m.pays_pension_insurance),
            )
            for m in situation.household_members
            if m.gross_income is not None
        ]
    else:
        # Backward compat: treat as one member with no deductions (n=0).
        members = [(situation.monthly_net_income.amount, 0)]  # type: ignore[union-attr]

    y_floor_key = min(household_size, _MAX_TABULATED_HOUSEHOLD_SIZE)
    y_floor = Decimal(str(manifest["anlage3_y_floors"][y_floor_key]))
    Y = compute_Y(members, y_floor=y_floor)

    # § 19 WoGG + Anlage 2: look up coefficients; clamp to largest tabulated size.
    coeff_key = min(household_size, _MAX_TABULATED_HOUSEHOLD_SIZE)
    raw = manifest["coefficients"][coeff_key]
    a = Decimal(str(raw["a"]))
    b = Decimal(str(raw["b"]))
    c = Decimal(str(raw["c"]))

    return Money(amount=_compute_wohngeld_amount(M=M, a=a, b=b, c=c, Y=Y))
