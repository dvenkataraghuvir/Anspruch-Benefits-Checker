import { useI18n } from '../i18n';
import type { EligibilityResult, Money, ResultState } from '../contract/types';

// Tones are part of the contract's UI treatment (CONTRACT.md): green / slate /
// ochre / cloud. Labels are localized; tones never change.
const STATE_TONE: Record<ResultState, string> = {
  eligible:           'tone-eligible',
  eligible_no_amount: 'tone-eligible',
  not_eligible:       'tone-neutral',
  cannot_determine:   'tone-pending',
  unavailable:        'tone-unavailable',
};

function formatMoney(m: Money): string {
  return `€ ${m.amount}`;
}

export function ResultCard({
  result,
  onAddDetail,
  onRetry,
}: {
  result: EligibilityResult;
  onAddDetail?: (input: string) => void;
  onRetry?: () => void;
}) {
  const { t } = useI18n();
  const tone   = STATE_TONE[result.state];
  const label  = t.results.states[result.state];
  const legal  = result.citations[0]?.legal_basis ?? null;
  const citUrl = result.citations[0]?.source_url ?? null;

  const isPlzMissing =
    result.state === 'cannot_determine' && result.missing_inputs.includes('postal_code');

  return (
    <article className={`card ${tone}`}>
      <header className="card-head">
        <h3 className="card-title">{result.headline || result.program_id}</h3>
        <span className="pill">{label}</span>
      </header>

      {result.reason && <p className="card-reason">{result.reason}</p>}

      {/* ── ELIGIBLE ─────────────────────────────────────────────── */}
      {result.state === 'eligible' && result.estimated_amount && (
        <>
          <p className="card-amount">
            {formatMoney(result.estimated_amount)} <span>{t.results.perMonth}</span>
          </p>
          {legal && <p className="card-legal">{t.results.basedOn} {legal}</p>}
        </>
      )}

      {result.state === 'eligible' && result.notes.length > 0 && (
        <ul className="card-notes">
          {result.notes.map((note, i) => (
            <li key={i} className="card-note">{note}</li>
          ))}
        </ul>
      )}

      {/* ── ELIGIBLE_NO_AMOUNT ───────────────────────────────────── */}
      {result.state === 'eligible_no_amount' && (
        <p className="card-amount card-amount--text">{t.results.certificate}</p>
      )}

      {/* ── CANNOT_DETERMINE ─────────────────────────────────────── */}
      {result.state === 'cannot_determine' && (
        <div className="card-missing">
          {isPlzMissing ? (
            <p>{t.results.plzNotCovered}</p>
          ) : (
            <>
              <p>
                {t.results.stillNeeded} <strong>{result.missing_inputs.join(', ')}</strong>
              </p>
              {onAddDetail && (
                <button className="link-btn" onClick={() => onAddDetail(result.missing_inputs[0])}>
                  {t.results.addDetail}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* ── UNAVAILABLE ──────────────────────────────────────────── */}
      {result.state === 'unavailable' && (
        <>
          {!result.reason && (
            <p className="card-reason">{t.results.unavailableDefault}</p>
          )}
          {onRetry && (
            <button className="link-btn" onClick={onRetry}>{t.results.retry}</button>
          )}
        </>
      )}

      {/* ── Footer: citation + disclaimer (every card) ───────────── */}
      <footer className="card-footer">
        {citUrl && citUrl !== 'TODO://official-source' && (
          <a className="card-cite" href={citUrl} target="_blank" rel="noreferrer">
            {legal ? `${legal} →` : t.results.officialSource}
          </a>
        )}
        <p className="card-disclaimer">
          {t.results.cardDisclaimer}{' '}
          <a href="https://www.verwaltung.bund.de/" target="_blank" rel="noreferrer">
            {t.results.findOffice}
          </a>
        </p>
      </footer>
    </article>
  );
}
