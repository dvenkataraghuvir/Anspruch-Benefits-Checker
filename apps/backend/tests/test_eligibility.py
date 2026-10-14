from datetime import date

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _situation(**override) -> dict:
    base = {
        "as_of": date.today().isoformat(),
        "residence_status": "german_or_eu",
        "household_size": 2,
        "children": [],
        "monthly_cold_rent": {"amount": "900", "currency": "EUR"},
        "bundesland": "Bayern",
        "postal_code": "00000",      # placeholder — primary Mietstufe key (§ 12 WoGG)
        "receiving_benefits": [],
        "household_members": [],
        "receives_housing_covering_benefit": False,
        "household_assets": None,
    }
    base.update(override)
    return base


def _wohngeld(results: list[dict]) -> dict:
    return next(r for r in results if r["program_id"] == "wohngeld")


def test_health():
    assert client.get("/healthz").json() == {"status": "ok"}


def test_unknown_plz_returns_cannot_determine():
    # PLZ "00000" is not in postal_code_mietstufe — the honest answer is CANNOT_DETERMINE.
    r = client.post("/api/v1/eligibility/assess",
                    json={"situation": _situation()})
    assert r.status_code == 200
    w = _wohngeld(r.json())
    assert w["state"] == "cannot_determine"
    assert "postal_code" in w["missing_inputs"]


def test_würzburg_eligible_69():
    # Full UserSituation for PLZ 97074, size 2, members (1500 n=3)+(1300 n=3), cold rent 970.
    # Expected: ELIGIBLE, amount 69 € (BMWSB Wohngeldrechner reference).
    situation = _situation(
        postal_code="97074",
        monthly_cold_rent={"amount": "970", "currency": "EUR"},
        household_members=[
            {
                "gross_income": {"amount": "1500", "currency": "EUR"},
                "pays_income_tax": True,
                "pays_health_care_insurance": True,
                "pays_pension_insurance": True,
            },
            {
                "gross_income": {"amount": "1300", "currency": "EUR"},
                "pays_income_tax": True,
                "pays_health_care_insurance": True,
                "pays_pension_insurance": True,
            },
        ],
    )
    r = client.post("/api/v1/eligibility/assess", json={"situation": situation})
    assert r.status_code == 200
    w = _wohngeld(r.json())
    assert w["state"] == "eligible", w
    assert w["estimated_amount"]["amount"] == "69", w["estimated_amount"]


def test_s7_excluded_is_not_eligible():
    # § 7 WoGG: household receiving a housing-covering benefit → NOT_ELIGIBLE.
    r = client.post("/api/v1/eligibility/assess",
                    json={"situation": _situation(receives_housing_covering_benefit=True)})
    assert r.status_code == 200
    w = _wohngeld(r.json())
    assert w["state"] == "not_eligible"
    assert "7" in w["reason"]


def test_size_3_is_unavailable():
    # Household size 3 is not in verified_household_sizes ([1, 2, 4]) → UNAVAILABLE.
    r = client.post("/api/v1/eligibility/assess",
                    json={"situation": _situation(household_size=3, postal_code="97074")})
    assert r.status_code == 200
    w = _wohngeld(r.json())
    assert w["state"] == "unavailable"


def test_würzburg_size4_is_eligible():
    # Size 4 is now in verified_household_sizes → gate admits it; formula returns ELIGIBLE.
    # S4-C: 4 × zero income, cold rent 5 000 → BMWSB Wohngeldrechner 908 €.
    situation = _situation(
        household_size=4,
        postal_code="97074",
        monthly_cold_rent={"amount": "5000", "currency": "EUR"},
        household_members=[
            {"gross_income": {"amount": "0", "currency": "EUR"}},
            {"gross_income": {"amount": "0", "currency": "EUR"}},
            {"gross_income": {"amount": "0", "currency": "EUR"}},
            {"gross_income": {"amount": "0", "currency": "EUR"}},
        ],
    )
    r = client.post("/api/v1/eligibility/assess", json={"situation": situation})
    assert r.status_code == 200
    w = _wohngeld(r.json())
    assert w["state"] == "eligible", w
    assert w["estimated_amount"]["amount"] == "908", w["estimated_amount"]


def test_money_amount_is_serialized_as_string():
    # Guard against accidental float serialisation — Decimal must come back as string.
    r = client.post("/api/v1/eligibility/assess",
                    json={"situation": _situation()})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_s21_over_assets_is_not_eligible():
    # § 21 Nr. 3 WoGG: assets 95 000 > allowance 90 000 (size 2) → NOT_ELIGIBLE.
    r = client.post("/api/v1/eligibility/assess",
                    json={"situation": _situation(
                        postal_code="97074",
                        household_assets={"amount": "95000", "currency": "EUR"},
                    )})
    assert r.status_code == 200
    w = _wohngeld(r.json())
    assert w["state"] == "not_eligible"
    assert "21" in w["reason"]


def test_s21_just_under_assets_passes_gate():
    # Assets 89 000 < allowance 90 000 → §21 gate does not fire; formula returns ELIGIBLE.
    r = client.post("/api/v1/eligibility/assess",
                    json={"situation": _situation(
                        postal_code="97074",
                        monthly_cold_rent={"amount": "970", "currency": "EUR"},
                        household_members=[
                            {
                                "gross_income": {"amount": "1500", "currency": "EUR"},
                                "pays_income_tax": True,
                                "pays_health_care_insurance": True,
                                "pays_pension_insurance": True,
                            },
                            {
                                "gross_income": {"amount": "1300", "currency": "EUR"},
                                "pays_income_tax": True,
                                "pays_health_care_insurance": True,
                                "pays_pension_insurance": True,
                            },
                        ],
                        household_assets={"amount": "89000", "currency": "EUR"},
                    )})
    assert r.status_code == 200
    w = _wohngeld(r.json())
    assert w["state"] == "eligible"


def test_income_above_limit_is_not_eligible():
    # Both members 4 000 € gross, no deductions → formula amount = 0 → NOT_ELIGIBLE.
    r = client.post("/api/v1/eligibility/assess",
                    json={"situation": _situation(
                        postal_code="97074",
                        monthly_cold_rent={"amount": "600", "currency": "EUR"},
                        household_members=[
                            {"gross_income": {"amount": "4000", "currency": "EUR"}},
                            {"gross_income": {"amount": "4000", "currency": "EUR"}},
                        ],
                    )})
    assert r.status_code == 200
    w = _wohngeld(r.json())
    assert w["state"] == "not_eligible"
    reason_lower = w["reason"].lower()
    assert "income" in reason_lower or "limit" in reason_lower


def test_borderline_band_has_advisory_note():
    # Both members 1 000 € gross, no deductions, cold rent 500 → formula ≈ 2 € ≤ 10 → note fires.
    r = client.post("/api/v1/eligibility/assess",
                    json={"situation": _situation(
                        postal_code="97074",
                        monthly_cold_rent={"amount": "500", "currency": "EUR"},
                        household_members=[
                            {"gross_income": {"amount": "1000", "currency": "EUR"}},
                            {"gross_income": {"amount": "1000", "currency": "EUR"}},
                        ],
                    )})
    assert r.status_code == 200
    w = _wohngeld(r.json())
    assert w["state"] == "eligible"
    assert int(w["estimated_amount"]["amount"]) <= 10
    assert len(w["notes"]) > 0


def test_missing_plz_is_cannot_determine():
    # postal_code=None → engine short-circuits before assess(); returns CANNOT_DETERMINE.
    r = client.post("/api/v1/eligibility/assess",
                    json={"situation": _situation(postal_code=None)})
    assert r.status_code == 200
    w = _wohngeld(r.json())
    assert w["state"] == "cannot_determine"
    assert "postal_code" in w["missing_inputs"]
