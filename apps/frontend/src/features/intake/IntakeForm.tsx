import { useState } from 'react';
import { useI18n } from '../../i18n';
import type { Messages } from '../../i18n/translations';
import type { HouseholdMember, ResidenceStatus, UserSituation } from '../../contract/types';

type MemberForm = {
  gross: string;
  werbungskosten: string;
  tax: boolean;
  health: boolean;
  pension: boolean;
};

type ErrorKey = keyof Messages['intake']['errors'];

// Arbeitnehmer-Pauschbetrag: 1,230 €/year ÷ 12 (§ 9a Satz 1 Nr. 1a EStG, checked 2026-10-14).
// A pre-fill the user can change — the engine itself never assumes it.
const EMPLOYEE_WERBUNGSKOSTEN_DEFAULT = '102.50';

const emptyMember = (): MemberForm => ({
  gross: '', werbungskosten: EMPLOYEE_WERBUNGSKOSTEN_DEFAULT, tax: false, health: false, pension: false,
});

const RESIDENCE: ResidenceStatus[] = [
  'german_or_eu',
  'settled_permit',
  'residence_permit',
  'other_unsure',
];

const BUNDESLAENDER = [
  'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen',
  'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen',
  'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen',
  'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen',
];

export function IntakeForm({ onSubmit }: { onSubmit: (s: UserSituation) => void }) {
  const { t } = useI18n();
  const [residence, setResidence]           = useState<ResidenceStatus>('german_or_eu');
  const [age, setAge]                       = useState('');
  const [householdSize, setHouseholdSize]   = useState('2');
  const [postalCode, setPostalCode]         = useState('');
  const [municipality, setMunicipality]     = useState('');
  const [bundesland, setBundesland]         = useState('Bayern');
  const [coldRent, setColdRent]             = useState('');
  const [members, setMembers]               = useState<MemberForm[]>([emptyMember(), emptyMember()]);
  const [assets, setAssets]                 = useState('');
  const [coveringBenefit, setCoveringBenefit] = useState(false);
  const [errors, setErrors]                 = useState<ErrorKey[]>([]);

  function onSizeChange(raw: string) {
    setHouseholdSize(raw);
    const n = Math.max(1, Math.min(12, parseInt(raw, 10) || 1));
    setMembers(prev =>
      prev.length < n
        ? [...prev, ...Array.from({ length: n - prev.length }, emptyMember)]
        : prev.slice(0, n),
    );
  }

  function updateMember(i: number, patch: Partial<MemberForm>) {
    setMembers(prev => prev.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  }

  function validate(): boolean {
    const errs: ErrorKey[] = [];
    if (!postalCode.trim())
      errs.push('plzRequired');
    if (!coldRent.trim() || isNaN(Number(coldRent)))
      errs.push('rentNumber');
    if (!householdSize || isNaN(parseInt(householdSize, 10)) || parseInt(householdSize, 10) < 1)
      errs.push('householdMin');
    if (assets.trim() && isNaN(Number(assets)))
      errs.push('assetsNumber');
    if (members.some(m => m.werbungskosten.trim() && isNaN(Number(m.werbungskosten))))
      errs.push('werbungskostenNumber');
    setErrors(errs);
    return errs.length === 0;
  }

  function submit() {
    if (!validate()) return;
    const n = Math.max(1, parseInt(householdSize, 10) || 1);
    const householdMembers: HouseholdMember[] = members.slice(0, n).map(m => ({
      gross_income: m.gross.trim() ? { amount: m.gross.trim(), currency: 'EUR' } : null,
      monthly_werbungskosten: m.werbungskosten.trim()
        ? { amount: m.werbungskosten.trim(), currency: 'EUR' }
        : null,
      pays_income_tax:           m.tax,
      pays_health_care_insurance: m.health,
      pays_pension_insurance:    m.pension,
    }));

    const situation: UserSituation = {
      as_of:                            new Date().toISOString().slice(0, 10),
      residence_status:                 residence,
      age:                              age ? Number(age) : null,
      household_size:                   n,
      children:                         [],
      monthly_net_income:               null,
      monthly_cold_rent:                { amount: coldRent.trim(), currency: 'EUR' },
      bundesland:                       bundesland || null,
      postal_code:                      postalCode.trim() || null,
      municipality:                     municipality.trim() || null,
      employment_status:                null,
      receiving_benefits:               [],
      household_members:                householdMembers,
      receives_housing_covering_benefit: coveringBenefit,
      household_assets:                 assets.trim()
                                          ? { amount: assets.trim(), currency: 'EUR' }
                                          : null,
    };
    onSubmit(situation);
  }

  const n = Math.max(1, parseInt(householdSize, 10) || 1);

  return (
    <section className="intake">
      <h2>{t.intake.title}</h2>

      <label className="field">
        <span>{t.intake.residence}</span>
        <select value={residence} onChange={e => setResidence(e.target.value as ResidenceStatus)}>
          {RESIDENCE.map(r => (
            <option key={r} value={r}>{t.intake.residenceOptions[r]}</option>
          ))}
        </select>
      </label>

      <div className="row">
        <label className="field">
          <span>{t.intake.postalCode} <span className="req">*</span></span>
          <input
            value={postalCode}
            onChange={e => setPostalCode(e.target.value)}
            inputMode="numeric"
            maxLength={5}
            placeholder="12345"
          />
        </label>
        <label className="field">
          <span>{t.intake.bundesland}</span>
          <select value={bundesland} onChange={e => setBundesland(e.target.value)}>
            {BUNDESLAENDER.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </label>
      </div>

      <label className="field">
        <span>
          {t.intake.municipality}{' '}
        </span>
        <input
          value={municipality}
          onChange={e => setMunicipality(e.target.value)}
          placeholder={t.intake.optional}
        />
      </label>

      <div className="row">
        <label className="field">
          <span>{t.intake.age}</span>
          <input
            value={age}
            onChange={e => setAge(e.target.value)}
            inputMode="numeric"
            placeholder={t.intake.optional}
          />
        </label>
        <label className="field">
          <span>{t.intake.householdSize} <span className="req">*</span></span>
          <input
            value={householdSize}
            onChange={e => onSizeChange(e.target.value)}
            inputMode="numeric"
            min="1"
            max="12"
          />
        </label>
      </div>

      {/* ── Cold rent ─────────────────────────────────────────────────── */}
      <div className="panel">
        <p className="panel-title">{t.intake.privacyPanel}</p>
        <label className="field">
          <span>
            {t.intake.coldRent} <span className="req">*</span>
          </span>
          <input
            value={coldRent}
            onChange={e => setColdRent(e.target.value)}
            inputMode="decimal"
            placeholder={t.intake.coldRentPlaceholder}
          />
          <span className="hint">{t.intake.coldRentHint}</span>
        </label>
      </div>

      {/* ── Per-member income ─────────────────────────────────────────── */}
      <div className="members-section">
        <p className="section-label">{t.intake.membersTitle}</p>
        <p className="hint" style={{ marginBottom: 8 }}>{t.intake.membersHint}</p>
        {members.slice(0, n).map((m, i) => (
          <div key={i} className="member-row">
            <div className="member-row-head">
              <span className="member-idx">{t.intake.person} {i + 1}</span>
              <input
                className="member-gross"
                value={m.gross}
                onChange={e => updateMember(i, { gross: e.target.value })}
                inputMode="decimal"
                placeholder={t.intake.grossPlaceholder}
              />
            </div>
            <label className="field member-wk">
              <span>{t.intake.werbungskosten}</span>
              <input
                value={m.werbungskosten}
                onChange={e => updateMember(i, { werbungskosten: e.target.value })}
                inputMode="decimal"
              />
              <span className="hint">{t.intake.werbungskostenHint}</span>
            </label>
            <div className="member-checks">
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={m.tax}
                  onChange={e => updateMember(i, { tax: e.target.checked })}
                />
                {t.intake.checkTax}
              </label>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={m.health}
                  onChange={e => updateMember(i, { health: e.target.checked })}
                />
                {t.intake.checkHealth}
              </label>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={m.pension}
                  onChange={e => updateMember(i, { pension: e.target.checked })}
                />
                {t.intake.checkPension}
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* ── Assets ───────────────────────────────────────────────────── */}
      <label className="field">
        <span>{t.intake.assets}</span>
        <input
          value={assets}
          onChange={e => setAssets(e.target.value)}
          inputMode="decimal"
          placeholder={t.intake.assetsPlaceholder}
        />
        <span className="hint">{t.intake.assetsHint}</span>
      </label>

      {/* ── Covering benefit ─────────────────────────────────────────── */}
      <div className="field">
        <span>{t.intake.coveringBenefit}</span>
        <span className="hint">{t.intake.coveringBenefitHint}</span>
        <div className="toggle-row">
          <label className="check-label">
            <input
              type="radio"
              name="coveringBenefit"
              checked={!coveringBenefit}
              onChange={() => setCoveringBenefit(false)}
            />
            {t.intake.no}
          </label>
          <label className="check-label">
            <input
              type="radio"
              name="coveringBenefit"
              checked={coveringBenefit}
              onChange={() => setCoveringBenefit(true)}
            />
            {t.intake.yes}
          </label>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="error-box">
          {errors.map(key => <p key={key}>{t.intake.errors[key]}</p>)}
        </div>
      )}

      <button className="primary" onClick={submit}>
        {t.intake.submit}
      </button>
    </section>
  );
}
