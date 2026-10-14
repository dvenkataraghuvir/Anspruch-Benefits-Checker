// TypeScript mirror of packages/core/anspruch_core/types.py — KEEP IN SYNC.
// If this and the Python contract disagree, the Python contract wins.
// Money.amount is a STRING over the wire to preserve Decimal precision.

export type ResultState =
  | 'eligible'
  | 'eligible_no_amount'
  | 'not_eligible'
  | 'cannot_determine'
  | 'unavailable';

export type ResidenceStatus =
  | 'german_or_eu'
  | 'settled_permit'
  | 'residence_permit'
  | 'other_unsure';

export interface Money {
  amount: string; // Decimal serialized as string
  currency: string; // 'EUR'
}

export interface Child {
  date_of_birth: string | null; // ISO date
}

export interface HouseholdMember {
  gross_income: Money | null; // SENSITIVE
  monthly_werbungskosten: Money | null; // SENSITIVE; § 14 WoGG / § 9a EStG; null counts as 0
  pays_income_tax: boolean;             // Einkommensteuer
  pays_health_care_insurance: boolean;  // gesetzl. Kranken-/Pflegeversicherung
  pays_pension_insurance: boolean;      // gesetzl. Rentenversicherung
}

export interface UserSituation {
  as_of: string; // ISO date — which day's rules apply
  residence_status: ResidenceStatus;
  age: number | null;
  household_size: number | null;
  children: Child[];
  monthly_net_income: Money | null; // SENSITIVE
  monthly_cold_rent: Money | null; // SENSITIVE — Bruttokaltmiete; engine adds heiz/klima
  bundesland: string | null;
  postal_code: string | null; // primary Mietstufe key — see CONTRACT.md
  municipality: string | null; // tiebreaker when a PLZ spans multiple Mietstufen
  employment_status: string | null;
  receiving_benefits: string[];
  household_members: HouseholdMember[]; // SENSITIVE; § 16 WoGG
  receives_housing_covering_benefit: boolean; // § 7 WoGG: Bürgergeld/SGB XII/AsylbLG
  household_assets: Money | null;            // SENSITIVE; § 21 Nr. 3 WoGG
}

export interface Citation {
  source_title: string;
  source_url: string;
  effective_year: string;
  legal_basis: string | null;
  snippet: string | null;
}

export interface EligibilityResult {
  program_id: string;
  program_version: string;
  state: ResultState;
  headline: string;
  reason: string;
  estimated_amount: Money | null;
  missing_inputs: string[];
  required_documents: string[];
  application_url: string | null;
  citations: Citation[];
  notes: string[]; // advisory flags (borderline, Bürgergeld-Vorrang)
}
