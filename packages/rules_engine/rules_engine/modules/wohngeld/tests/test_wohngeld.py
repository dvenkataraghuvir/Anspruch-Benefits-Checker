"""Wohngeld tests.

Two layers:
  1. Structural tests (figure-independent) — RUN NOW and must stay green.
  2. Golden amount cases (figure-dependent) — the 2/IV suite tests the pure
     formula directly (not gated by figures_loaded). They run as soon as the
     _2IV_* constants below are filled. Each constant has an inline TODO.
     The full estimate_wohngeld integration test remains gated by FIGURES_LOADED
     (manifest PLZ table still pending).
"""
from __future__ import annotations

from datetime import date
from decimal import Decimal

import pytest

from anspruch_core.types import HouseholdMember, Money, ResultState, UserSituation
from rules_engine.engine import EligibilityEngine
from rules_engine.modules.wohngeld.calculator import (
    AmbiguousMietstufe,
    PostalCodeNotFound,
    _compute_wohngeld_amount,
    _load_manifest,
    _round_half_up,
    compute_Y,
    estimate_wohngeld,
    resolve_mietstufe,
)
from rules_engine.modules.wohngeld.module import WohngeldModule

# Flip to True once the PLZ table and eligibility guards are transcribed.
# Does NOT gate the 2/IV golden tests — those bypass estimate_wohngeld.
FIGURES_LOADED = False

golden = pytest.mark.skipif(
    not FIGURES_LOADED,
    reason="Pending: transcribe postal_code_mietstufe and eligibility guards.",
)

_PLACEHOLDER_PLZ = "00000"


def _renter(**kw) -> UserSituation:
    base = dict(
        as_of=date(2026, 6, 1),
        household_size=2,
        monthly_net_income=Money(amount="2000"),
        monthly_cold_rent=Money(amount="900"),
        bundesland="Bayern",
        postal_code=_PLACEHOLDER_PLZ,
        municipality=None,
        household_members=[],
    )
    base.update(kw)
    return UserSituation(**base)


# ── Layer 1: structural (run now) ────────────────────────────────────────────

def test_required_attributes():
    # monthly_net_income removed — form now sends per-member household_members instead.
    assert WohngeldModule().required_attributes() == [
        "household_size",
        "monthly_cold_rent",
        "bundesland",
        "postal_code",
    ]


def test_missing_cold_rent_is_cannot_determine_via_engine():
    engine = EligibilityEngine([WohngeldModule()])
    [res] = engine.assess_all(_renter(monthly_cold_rent=None))
    assert res.state is ResultState.CANNOT_DETERMINE
    assert "monthly_cold_rent" in res.missing_inputs


def test_missing_postal_code_is_cannot_determine_via_engine():
    engine = EligibilityEngine([WohngeldModule()])
    [res] = engine.assess_all(_renter(postal_code=None))
    assert res.state is ResultState.CANNOT_DETERMINE
    assert "postal_code" in res.missing_inputs


def test_unknown_plz_surfaces_as_cannot_determine():
    # PLZ "00000" is not in postal_code_mietstufe — honest CANNOT_DETERMINE.
    engine = EligibilityEngine([WohngeldModule()])
    [res] = engine.assess_all(_renter())
    assert res.state is ResultState.CANNOT_DETERMINE
    assert "postal_code" in res.missing_inputs


# ── Eligibility gate tests ───────────────────────────────────────────────────

def test_s7_excluded_household_is_not_eligible():
    # § 7 WoGG: Bürgergeld recipient → NOT_ELIGIBLE before the formula runs.
    engine = EligibilityEngine([WohngeldModule()])
    [res] = engine.assess_all(_renter(receives_housing_covering_benefit=True))
    assert res.state is ResultState.NOT_ELIGIBLE
    assert "7 WoGG" in res.reason


def test_over_assets_household_is_not_eligible():
    # § 21 Nr. 3 WoGG: 2-person household, allowance = 90,000 €.
    from anspruch_core.types import Money
    engine = EligibilityEngine([WohngeldModule()])
    [res] = engine.assess_all(
        _renter(household_assets=Money(amount="90001"), household_size=2)
    )
    assert res.state is ResultState.NOT_ELIGIBLE
    assert "21" in res.reason


def test_size_5_is_unavailable():
    # Household size 5 is not in verified_household_sizes ([1, 2, 3, 4]) → UNAVAILABLE.
    engine = EligibilityEngine([WohngeldModule()])
    [res] = engine.assess_all(_renter(household_size=5, postal_code="97074"))
    assert res.state is ResultState.UNAVAILABLE


# Official BMWSB Wohngeldrechner results, entered by hand on 2026-10-14:
# PLZ 97070 (Mietstufe IV), all three § 16 deductions ticked for every earner,
# non-earners at 0. Run A: Werbungskosten 0. Run B: 102.50 €/month per earner
# (Arbeitnehmer-Pauschbetrag 1,230 €/year, § 9a Satz 1 Nr. 1a EStG).
_RECHNER_CASES = [
    # id,  size, cold rent, incomes,                 run A, run B
    ("G1", 2, "970",  ["1500", "1300"],              69,  140),
    ("G2", 1, "600",  ["1400"],                      300, 335),
    ("G3", 3, "800",  ["2200", "0", "0"],            491, 521),
    ("G4", 4, "1000", ["2500", "600", "0", "0"],     545, 598),
]


@pytest.mark.parametrize("werbungskosten,run", [("0", "A"), ("102.50", "B")])
@pytest.mark.parametrize("case", _RECHNER_CASES, ids=[c[0] for c in _RECHNER_CASES])
def test_matches_official_wohngeldrechner(case, werbungskosten, run):
    _id, size, rent, incomes, expected_a, expected_b = case
    members = [
        HouseholdMember(
            gross_income=Money(amount=income),
            monthly_werbungskosten=Money(amount=werbungskosten if income != "0" else "0"),
            pays_income_tax=income != "0",
            pays_health_care_insurance=income != "0",
            pays_pension_insurance=income != "0",
        )
        for income in incomes
    ]
    engine = EligibilityEngine([WohngeldModule()])
    [res] = engine.assess_all(
        _renter(
            postal_code="97070",
            household_size=size,
            monthly_cold_rent=Money(amount=rent),
            household_members=members,
        )
    )
    expected = expected_a if run == "A" else expected_b
    assert res.state is ResultState.ELIGIBLE
    assert res.estimated_amount.amount == Decimal(expected)


def test_werbungskosten_never_make_income_negative():
    # § 14 WoGG counts only positive Einkünfte: costs above income floor at 0,
    # so a high-cost member cannot reduce another member's income.
    situation = _renter(
        postal_code="97070",
        household_size=2,
        monthly_cold_rent=Money(amount="970"),
        household_members=[
            HouseholdMember(gross_income=Money(amount="1500"), pays_income_tax=True,
                            pays_health_care_insurance=True, pays_pension_insurance=True),
            HouseholdMember(gross_income=Money(amount="1300"),
                            monthly_werbungskosten=Money(amount="5000"),
                            pays_income_tax=True, pays_health_care_insurance=True,
                            pays_pension_insurance=True),
        ],
    )
    only_first = _renter(
        postal_code="97070",
        household_size=2,
        monthly_cold_rent=Money(amount="970"),
        household_members=[
            HouseholdMember(gross_income=Money(amount="1500"), pays_income_tax=True,
                            pays_health_care_insurance=True, pays_pension_insurance=True),
            HouseholdMember(gross_income=Money(amount="0")),
        ],
    )
    assert estimate_wohngeld(situation) == estimate_wohngeld(only_first)


def test_würzburg_end_to_end_via_estimate_wohngeld():
    # Full pipeline: PLZ 97074 → Mietstufe IV → formula → 69 €.
    # Reproduces the BMWSB-verified result end-to-end through estimate_wohngeld.
    from anspruch_core.types import HouseholdMember, Money
    situation = _renter(
        postal_code="97074",
        household_size=2,
        monthly_cold_rent=Money(amount="970"),
        monthly_net_income=Money(amount="1"),  # satisfies required_attributes; household_members takes over
        household_members=[
            HouseholdMember(
                gross_income=Money(amount="1500"),
                pays_income_tax=True,
                pays_health_care_insurance=True,
                pays_pension_insurance=True,
            ),
            HouseholdMember(
                gross_income=Money(amount="1300"),
                pays_income_tax=True,
                pays_health_care_insurance=True,
                pays_pension_insurance=True,
            ),
        ],
    )
    engine = EligibilityEngine([WohngeldModule()])
    [res] = engine.assess_all(situation)
    assert res.state is ResultState.ELIGIBLE
    assert res.estimated_amount is not None
    assert res.estimated_amount.amount == Decimal("69"), (
        f"Expected 69 €, got {res.estimated_amount.amount} € "
        "(BMWSB Wohngeldrechner, Würzburg, rent 970, 1500+1300 n=3)"
    )


def test_module_expires_before_2027_figures():
    # 2025 figures (BGBl. 2024 I Nr. 314) must not be applied from 2027-01-01,
    # when the § 43 WoGG update / Wohngeld reform takes effect.
    engine = EligibilityEngine([WohngeldModule()])
    assert engine.active_modules(date(2026, 12, 31))
    assert engine.active_modules(date(2027, 1, 1)) == []


def test_heating_component_keeps_m_above_anlage3_floor():
    # Anlage 3 Nr. 1 WoGG replaces M below a minimum. calculator.py does not
    # apply that floor because M always includes the § 12 Abs. 6 heating
    # component, which exceeds the floor for every size. If a figure change
    # (e.g. a halved heating component) breaks this, implement the M floor.
    from rules_engine.modules.wohngeld.calculator import _get_size_component
    manifest = _load_manifest()
    for size, floor in manifest["anlage3_m_floors"].items():
        heiz = _get_size_component(size, manifest["heizkostenkomponente_eur"])
        assert heiz >= Decimal(str(floor)), f"size {size}: heiz {heiz} < M floor {floor}"


# ── _round_half_up ───────────────────────────────────────────────────────────

def test_round_half_up_rounds_half_up():
    assert _round_half_up(Decimal("0.5")) == Decimal("1")
    assert _round_half_up(Decimal("1.5")) == Decimal("2")
    assert _round_half_up(Decimal("2.5")) == Decimal("3")


def test_round_half_up_rounds_below_half_down():
    assert _round_half_up(Decimal("0.4")) == Decimal("0")
    assert _round_half_up(Decimal("1.499")) == Decimal("1")


def test_round_half_up_exact_integer_unchanged():
    assert _round_half_up(Decimal("7")) == Decimal("7")


# ── compute_Y (§ 16 WoGG) ───────────────────────────────────────────────────

_ZERO_FLOOR = Decimal("0")


def test_compute_y_single_member_no_deductions():
    Y = compute_Y([(Decimal("1500"), 0)], y_floor=_ZERO_FLOOR)
    assert Y == Decimal("1500")


def test_compute_y_single_member_all_three_deductions():
    Y = compute_Y([(Decimal("1000"), 3)], y_floor=_ZERO_FLOOR)
    assert Y == Decimal("700.0")


def test_compute_y_two_members_mixed_deductions():
    Y = compute_Y([(Decimal("2000"), 1), (Decimal("1000"), 2)], y_floor=_ZERO_FLOOR)
    assert Y == Decimal("2600.0")


def test_compute_y_floor_applied_when_total_below_minimum():
    floor = Decimal("500")
    Y = compute_Y([(Decimal("100"), 0)], y_floor=floor)
    assert Y == floor


def test_compute_y_floor_not_applied_when_total_above_minimum():
    Y = compute_Y([(Decimal("1000"), 0)], y_floor=Decimal("200"))
    assert Y == Decimal("1000")


# ── _compute_wohngeld_amount (§ 19 WoGG z1..z4 formula) ─────────────────────

def test_compute_wohngeld_amount_floored_at_zero():
    result = _compute_wohngeld_amount(
        M=Decimal("500"),
        a=Decimal("0.04"),
        b=Decimal("0.0002"),
        c=Decimal("0.00008"),
        Y=Decimal("999999"),
    )
    assert result == Decimal("0")


def test_compute_wohngeld_amount_positive_case():
    result = _compute_wohngeld_amount(
        M=Decimal("600"),
        a=Decimal("0.04"),
        b=Decimal("0.0002"),
        c=Decimal("0.00008"),
        Y=Decimal("800"),
    )
    assert result > Decimal("0")


def test_compute_wohngeld_amount_result_is_integer_euro():
    result = _compute_wohngeld_amount(
        M=Decimal("600"),
        a=Decimal("0.04"),
        b=Decimal("0.0002"),
        c=Decimal("0.00008"),
        Y=Decimal("800"),
    )
    assert result == result.to_integral_value()


def test_compute_wohngeld_amount_zero_coefficients():
    # a=b=c=0 → z1=0, z2=0, z3=M, z4=1.15*M; round_half_up(115) = 115
    result = _compute_wohngeld_amount(
        M=Decimal("100"),
        a=Decimal("0"),
        b=Decimal("0"),
        c=Decimal("0"),
        Y=Decimal("0"),
    )
    assert result == Decimal("115")


# ── resolve_mietstufe pure-function tests ────────────────────────────────────

_ILLUSTRATIVE_TABLE = {
    "11111": [{"municipality": "Einheitsgemeinde", "mietstufe": "III"}],
    "22222": [
        {"municipality": "TownA", "mietstufe": "III"},
        {"municipality": "TownB", "mietstufe": "III"},
    ],
    "33333": [
        {"municipality": "TownC", "mietstufe": "III"},
        {"municipality": "TownD", "mietstufe": "V"},
    ],
}


def test_resolve_mietstufe_raises_for_unknown_plz():
    with pytest.raises(PostalCodeNotFound) as exc_info:
        resolve_mietstufe("99999", None, _ILLUSTRATIVE_TABLE)
    assert exc_info.value.postal_code == "99999"


def test_resolve_mietstufe_single_entry_returns_directly():
    assert resolve_mietstufe("11111", None, _ILLUSTRATIVE_TABLE) == "III"


def test_resolve_mietstufe_multiple_same_mietstufe_returns_directly():
    assert resolve_mietstufe("22222", None, _ILLUSTRATIVE_TABLE) == "III"


def test_resolve_mietstufe_ambiguous_without_municipality_raises():
    with pytest.raises(AmbiguousMietstufe) as exc_info:
        resolve_mietstufe("33333", None, _ILLUSTRATIVE_TABLE)
    exc = exc_info.value
    assert exc.postal_code == "33333"
    assert set(exc.candidates) == {"TownC", "TownD"}


def test_resolve_mietstufe_ambiguous_with_matching_municipality_resolves():
    assert resolve_mietstufe("33333", "TownD", _ILLUSTRATIVE_TABLE) == "V"


def test_resolve_mietstufe_ambiguous_unmatched_municipality_raises():
    with pytest.raises(AmbiguousMietstufe):
        resolve_mietstufe("33333", "UnknownTown", _ILLUSTRATIVE_TABLE)


# ── Layer 2: golden 2/IV cases (bypass figures_loaded gate) ─────────────────
#
# These tests call _compute_wohngeld_amount and compute_Y directly using
# hardcoded official values for 2 persons, Mietstufe IV, effective 2026-01-01.
# They do NOT call estimate_wohngeld and are therefore NOT gated by figures_loaded.
#
# Fill ALL _2IV_* constants below from the official BMWSB Wohngeldrechner + WoGG.
# Once filled, the tests run automatically — no flag to flip.
#
# Official reference: BMWSB Wohngeldrechner (§§ 12, 16, 19 WoGG), 2026-01-01.
# ─────────────────────────────────────────────────────────────────────────────

# Anlage 2 coefficients for 2-person household (§ 19 WoGG Anlage 2, 2026):
_2IV_A = Decimal("0.03")        # verified against BMWSB Wohngeldrechner
_2IV_B = Decimal("0.0003571")
_2IV_C = Decimal("0.0000304")

# § 12 WoGG Anlage 1 — base ceiling for Mietstufe IV, 2 persons (EUR):
_2IV_BASE = Decimal("619")      # rent_ceilings_eur[IV][2]

# § 12 Abs. 7 WoGG — Klimakomponente for 2 persons (EUR):
_2IV_KLIMA = Decimal("24.80")   # klimakomponente_eur[2]

# § 12 Abs. 6 WoGG — Heizkostenkomponente for 2 persons (EUR):
_2IV_HEIZ = Decimal("142.60")   # heizkostenkomponente_eur[2]

# Anlage 3 — minimum income (Y-floor) for 2 persons (EUR):
_2IV_Y_FLOOR = Decimal("679")   # anlage3_y_floors[2]

_2IV_CONSTANTS_READY = not any(
    v is None for v in [_2IV_A, _2IV_B, _2IV_C, _2IV_BASE, _2IV_KLIMA, _2IV_HEIZ, _2IV_Y_FLOOR]
)
_skip_2iv = pytest.mark.skipif(
    not _2IV_CONSTANTS_READY,
    reason="Pending: fill _2IV_* constants from official BMWSB Wohngeldrechner.",
)


def _M_2_IV(cold_rent: Decimal) -> Decimal:
    """§ 12 WoGG M for 2-person, Mietstufe IV.
    M = min(cold_rent, base + klima) + heiz
    """
    return min(cold_rent, _2IV_BASE + _2IV_KLIMA) + _2IV_HEIZ  # type: ignore[operator]


# Ten exact cases, all verified against the BMWSB Wohngeldrechner.
# Format: (label, cold_rent_eur, members[(gross, n_deductions),...], expected_eur)
#   cold_rent: Bruttokaltmiete in EUR (Decimal)
#   gross:     monthly gross income per member in EUR (Decimal)
#   n:         count of qualifying § 16 WoGG deductions (0–3)
#   expected:  BMWSB Wohngeldrechner result in EUR (Decimal), exact to the euro
GOLDEN_2IV_CASES = [
    ("2iv_rent5000_1500x3",     Decimal("5000"), [(Decimal("1500"), 3), (Decimal("0"),    0)], Decimal("490")),
    ("2iv_rent500_1500x3",      Decimal("500"),  [(Decimal("1500"), 3), (Decimal("0"),    0)], Decimal("387")),
    ("2iv_rent5000_zeroincome", Decimal("5000"), [(Decimal("0"),    0), (Decimal("0"),    0)], Decimal("646")),
    ("2iv_rent500_zeroincome",  Decimal("500"),  [(Decimal("0"),    0), (Decimal("0"),    0)], Decimal("520")),
    ("2iv_rent5000_1000x3",     Decimal("5000"), [(Decimal("1000"), 3), (Decimal("0"),    0)], Decimal("637")),
    ("2iv_rent5000_1000x0",     Decimal("5000"), [(Decimal("1000"), 0), (Decimal("0"),    0)], Decimal("512")),
    ("2iv_rent500_1000x0",      Decimal("500"),  [(Decimal("1000"), 0), (Decimal("0"),    0)], Decimal("406")),
    ("2iv_rent500_1000x3",      Decimal("500"),  [(Decimal("1000"), 3), (Decimal("0"),    0)], Decimal("513")),
    ("2iv_rent500_both1000x3",  Decimal("500"),  [(Decimal("1000"), 3), (Decimal("1000"), 3)], Decimal("253")),
    ("2iv_würzburg_rent970",    Decimal("970"),  [(Decimal("1500"), 3), (Decimal("1300"), 3)], Decimal("69")),
]


@_skip_2iv
@pytest.mark.parametrize("label,cold_rent,members,expected", GOLDEN_2IV_CASES)
def test_wohngeld_2iv_golden(label, cold_rent, members, expected):
    M = _M_2_IV(cold_rent)
    Y = compute_Y(members, y_floor=_2IV_Y_FLOOR)
    result = _compute_wohngeld_amount(M=M, a=_2IV_A, b=_2IV_B, c=_2IV_C, Y=Y)
    assert result == expected, (
        f"{label}: got {result} EUR, expected {expected} EUR (BMWSB Wohngeldrechner)"
    )


# Case 11 — income-eligibility-ceiling boundary (xfail).
# 2 × 1000 gross, n=0, cold_rent=500. Official BMWSB result: 0 EUR.
# Our formula gives 2 EUR: the Höchsteinkommensgrenze (income ceiling above which
# Wohngeld is zero) is applied as a hard cutoff by the official tool, but our
# formula reaches zero continuously — it crosses ~2 EUR later than the official
# cutoff. Pin the exact income-limit rule before removing xfail.
@_skip_2iv
@pytest.mark.xfail(
    reason=(
        "Income-ceiling boundary: Höchsteinkommensgrenze zeroes Wohngeld at/above "
        "the income limit; our formula approaches 0 but crosses ~€2 later. "
        "Pin the exact income-limit rule before removing xfail."
    ),
    strict=False,
)
def test_wohngeld_2iv_case11_income_ceiling_boundary():
    cold_rent = Decimal("500")
    members = [(Decimal("1000"), 0), (Decimal("1000"), 0)]
    M = _M_2_IV(cold_rent)
    Y = compute_Y(members, y_floor=_2IV_Y_FLOOR)
    result = _compute_wohngeld_amount(M=M, a=_2IV_A, b=_2IV_B, c=_2IV_C, Y=Y)
    assert result == Decimal("0"), f"Expected 0 EUR (income ceiling); got {result} EUR"


# ── Layer 2: golden 1/IV cases (bypass figures_loaded gate) ─────────────────
#
# Two cases verified end-to-end against the BMWSB Wohngeldrechner, size 1, Mietstufe IV.
# ─────────────────────────────────────────────────────────────────────────────

_1IV_A       = Decimal("0.04")       # coefficients[1].a  (§ 19 WoGG Anlage 2, 2026)
_1IV_B       = Decimal("0.0004797")  # coefficients[1].b
_1IV_C       = Decimal("0.0000408")  # coefficients[1].c
_1IV_BASE    = Decimal("511")        # rent_ceilings_eur[IV][1]  (§ 12 WoGG Anlage 1, 2026)
_1IV_KLIMA   = Decimal("19.20")      # klimakomponente_eur[1]    (§ 12 Abs. 7 WoGG, 2026)
_1IV_HEIZ    = Decimal("110.40")     # heizkostenkomponente_eur[1] (§ 12 Abs. 6 WoGG, 2026)
_1IV_Y_FLOOR = Decimal("396")        # anlage3_y_floors[1]       (WoGG Anlage 3, 2026)

_1IV_CONSTANTS_READY = not any(
    v is None for v in [_1IV_A, _1IV_B, _1IV_C, _1IV_BASE, _1IV_KLIMA, _1IV_HEIZ, _1IV_Y_FLOOR]
)
_skip_1iv = pytest.mark.skipif(
    not _1IV_CONSTANTS_READY,
    reason="Pending: fill _1IV_* constants from official BMWSB Wohngeldrechner.",
)


def _M_1_IV(cold_rent: Decimal) -> Decimal:
    return min(cold_rent, _1IV_BASE + _1IV_KLIMA) + _1IV_HEIZ  # type: ignore[operator]


# Format: (label, cold_rent_eur, members[(gross, n_deductions),...], expected_eur)
GOLDEN_1IV_CASES = [
    # S1-A: high rent, zero income — formula at ceiling.  BMWSB ref: 571 €.
    ("1iv_s1a_rent5000_zeroincome", Decimal("5000"), [(Decimal("0"),    0)], Decimal("571")),
    # S1-B: low rent, income 700 after n=3 deductions.   BMWSB ref: 335 €.
    ("1iv_s1b_rent400_1000x3",      Decimal("400"),  [(Decimal("1000"), 3)], Decimal("335")),
]


@_skip_1iv
@pytest.mark.parametrize("label,cold_rent,members,expected", GOLDEN_1IV_CASES)
def test_wohngeld_1iv_golden(label, cold_rent, members, expected):
    M = _M_1_IV(cold_rent)
    Y = compute_Y(members, y_floor=_1IV_Y_FLOOR)
    result = _compute_wohngeld_amount(M=M, a=_1IV_A, b=_1IV_B, c=_1IV_C, Y=Y)
    assert result == expected, (
        f"{label}: got {result} EUR, expected {expected} EUR (BMWSB Wohngeldrechner)"
    )


# ── Layer 2: golden 4/IV cases (bypass figures_loaded gate) ─────────────────
#
# Two cases verified end-to-end against the BMWSB Wohngeldrechner, size 4, Mietstufe IV.
# ─────────────────────────────────────────────────────────────────────────────

_4IV_A       = Decimal("0.01")       # coefficients[4].a  (§ 19 WoGG Anlage 2, 2026)
_4IV_B       = Decimal("0.0002163")  # coefficients[4].b
_4IV_C       = Decimal("0.0000176")  # coefficients[4].c
_4IV_BASE    = Decimal("858")        # rent_ceilings_eur[IV][4]  (§ 12 WoGG Anlage 1, 2026)
_4IV_KLIMA   = Decimal("34.40")      # klimakomponente_eur[4]    (§ 12 Abs. 7 WoGG, 2026)
_4IV_HEIZ    = Decimal("197.80")     # heizkostenkomponente_eur[4] (§ 12 Abs. 6 WoGG, 2026)
_4IV_Y_FLOOR = Decimal("1132")       # anlage3_y_floors[4]       (WoGG Anlage 3, 2026)

_4IV_CONSTANTS_READY = not any(
    v is None for v in [_4IV_A, _4IV_B, _4IV_C, _4IV_BASE, _4IV_KLIMA, _4IV_HEIZ, _4IV_Y_FLOOR]
)
_skip_4iv = pytest.mark.skipif(
    not _4IV_CONSTANTS_READY,
    reason="Pending: fill _4IV_* constants from official BMWSB Wohngeldrechner.",
)


def _M_4_IV(cold_rent: Decimal) -> Decimal:
    return min(cold_rent, _4IV_BASE + _4IV_KLIMA) + _4IV_HEIZ  # type: ignore[operator]


# Format: (label, cold_rent_eur, members[(gross, n_deductions),...], expected_eur)
GOLDEN_4IV_CASES = [
    # S4-C: high rent, all four members zero income.                   BMWSB ref: 908 €.
    ("4iv_s4c_rent5000_zeroincome", Decimal("5000"), [
        (Decimal("0"), 0), (Decimal("0"), 0), (Decimal("0"), 0), (Decimal("0"), 0),
    ], Decimal("908")),
    # S4-D: low rent, one earner 2 000 gross n=3, three zero-income.   BMWSB ref: 584 €.
    ("4iv_s4d_rent600_2000x3",      Decimal("600"),  [
        (Decimal("2000"), 3), (Decimal("0"), 0), (Decimal("0"), 0), (Decimal("0"), 0),
    ], Decimal("584")),
]


@_skip_4iv
@pytest.mark.parametrize("label,cold_rent,members,expected", GOLDEN_4IV_CASES)
def test_wohngeld_4iv_golden(label, cold_rent, members, expected):
    M = _M_4_IV(cold_rent)
    Y = compute_Y(members, y_floor=_4IV_Y_FLOOR)
    result = _compute_wohngeld_amount(M=M, a=_4IV_A, b=_4IV_B, c=_4IV_C, Y=Y)
    assert result == expected, (
        f"{label}: got {result} EUR, expected {expected} EUR (BMWSB Wohngeldrechner)"
    )
