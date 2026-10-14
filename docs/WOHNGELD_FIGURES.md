# Wohngeld figures — source checklist

Every number the Wohngeld module uses, where it comes from, and its status.
Figures live in `packages/rules_engine/rules_engine/modules/wohngeld/manifest.yaml`;
this file is the audit trail. Last full check: **2026-10-14**.

Legal state checked: WoGG as amended by the Zweite Fortschreibungsverordnung
(BGBl. 2024 I Nr. 314), in force since 2025-01-01, unchanged for 2026.

## 1. Calculation figures

| # | Figure | Manifest key | Official source | Status |
|---|---|---|---|---|
| 1 | Rent ceilings (Höchstbeträge), Mietstufe I–VII × size 1–5 + per extra member | `rent_ceilings_eur` | [WoGG Anlage 1](https://www.gesetze-im-internet.de/wogg/anlage_1.html) | ✅ All 42 values match |
| 2 | Heating component (CO₂ + permanent), size 1–5 + per extra member | `heizkostenkomponente_eur` | [§ 12 Abs. 6 WoGG](https://www.gesetze-im-internet.de/wogg/__12.html) | ✅ Match (110.40 … 225.40, +27.60) |
| 3 | Climate component, size 1–5 + per extra member | `klimakomponente_eur` | [§ 12 Abs. 7 WoGG](https://www.gesetze-im-internet.de/wogg/__12.html) | ✅ Match (19.20 … 39.20, +4.80) |
| 4 | Formula coefficients a, b, c, size 1–12 | `coefficients` | [WoGG Anlage 2](https://www.gesetze-im-internet.de/wogg/anlage_2.html) | ✅ All 36 values match |
| 5 | Minimum Y (income) per size 1–12 | `anlage3_y_floors` | [WoGG Anlage 3 Nr. 1](https://www.gesetze-im-internet.de/wogg/anlage_3.html) | ✅ Match |
| 6 | Minimum M (rent) per size 1–12 | `anlage3_m_floors` | WoGG Anlage 3 Nr. 1 | ✅ Added 2026-10-14. Not applied in code because the heating component always exceeds it; guarded by a test |
| 7 | Formula steps z1–z4, factor 1.15 | `calculator.py` | WoGG Anlage 3 Nr. 2 | ✅ Match |
| 8 | Rounding (below 0.50 down, from 0.50 up) | `calculator.py` | WoGG Anlage 3 Nr. 3 | ✅ Match |
| 9 | Income deductions, 10% each for tax, health/care, pension | `calculator.py` | [§ 16 WoGG](https://www.gesetze-im-internet.de/wogg/__16.html) | ✅ Match ("jeweils 10 Prozent", § 16 Abs. 1) |
| 10 | Asset limit 60,000 € + 30,000 € per extra member | `module.py` | WoGVwV Nr. 21.37 | ⚠️ Correct value, but it is a *guideline* ("in der Regel"), not a hard statutory limit. Courts require case-by-case review |

## 2. Location → Mietstufe

| # | Item | Status |
|---|---|---|
| 11 | Würzburg, Stadt = Mietstufe IV | ✅ Verified in [WoGV Anlage](https://www.gesetze-im-internet.de/wogv/anlage.html) |
| 12 | Würzburg PLZs 97070–97084 (even) | ⚠️ From postal data, not an official WoGV source. 7 unverified odd-numbered PLZs **removed** |
| 13 | All other municipalities | ❌ Not loaded. Show as *cannot determine* |

**Structural gap:** the WoGV Anlage lists *municipalities* (and districts for
municipalities under 10,000 inhabitants), not postcodes. One PLZ can span
several municipalities. Full coverage needs a PLZ→municipality dataset, which
is not an official legal source, so it needs a decision. See *Open items*.

## 3. Open items (priority order)

1. ✅ **Werbungskosten — resolved 2026-10-14.** § 14 Abs. 1 WoGG counts
   *Einkünfte* under § 2 EStG. The official Wohngeldrechner has a required
   per-person "monatliche Werbungskosten" field (default 0). Added to the
   contract as `HouseholdMember.monthly_werbungskosten`, subtracted before the
   § 16 deductions. The form pre-fills 102.50 € (Arbeitnehmer-Pauschbetrag
   1,230 €/year, [§ 9a EStG](https://www.gesetze-im-internet.de/estg/__9a.html)).
2. ✅ **Golden cases vs. official calculator — done 2026-10-14.** All 8 results
   matched the official Wohngeldrechner and are pinned in
   `test_matches_official_wohngeldrechner`. Household sizes 1–4 are now verified.
   Inputs: PLZ 97070 (Stufe IV), all three § 16 deductions for every earner,
   non-earners at 0. Run A: Werbungskosten 0. Run B: 102.50 € per earner.

   | Case | Size | Cold rent | Gross incomes | Run A | Run B |
   |---|---|---|---|---|---|
   | G1 | 2 | 970 € | 1,500 € + 1,300 € | 69 € | 140 € |
   | G2 | 1 | 600 € | 1,400 € | 300 € | 335 € |
   | G3 | 3 | 800 € | 2,200 € + 0 + 0 | 491 € | 521 € |
   | G4 | 4 | 1,000 € | 2,500 € + 600 € + 0 + 0 | 545 € | 598 € |

   Next: the same procedure for sizes 5–12 before adding them to
   `verified_household_sizes`. Not yet modelled: the calculator's
   "Erwerbstätiges Kind unter 25", "33 Jahre Grundrentenzeiten",
   Alleinerziehend, Unterhalt and Schwerbehinderung deductions (§ 17 WoGG).

3. **2027 change.** The current figures are valid until **2026-12-31**
   (`effective_to` set). The cabinet bill of 2026-07-06 suspends the § 43
   update, halves the heating component and changes the formula from
   2027-01-01. Once published in the Bundesgesetzblatt: add a `2027` module
   and manifest, and re-run this checklist. Note that halving the heating
   component makes item 6 binding for larger households.
4. **PLZ coverage.** Decide the location strategy (see §2).
5. **`content_hash`** in the manifest `source` block is still `TODO`.

## How to re-check

1. Open each source link above and compare value by value.
2. Update the *Last full check* date at the top and in `manifest.yaml`.
3. Run `python -m pytest -q`. The Wohngeld tests pin the formula and the expiry date.
