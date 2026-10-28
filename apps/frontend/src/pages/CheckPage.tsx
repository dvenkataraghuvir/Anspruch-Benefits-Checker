import { useState } from 'react';
import { IntakeForm } from '../features/intake/IntakeForm';
import { ResultsScreen } from '../features/results/ResultsScreen';
import { SAMPLE_RESULTS } from '../features/results/sample';
import { api } from '../lib/api';
import { useI18n, usePageTitle } from '../i18n';
import type { EligibilityResult, UserSituation } from '../contract/types';

export function CheckPage() {
  const { t } = useI18n();
  usePageTitle(t.meta.check);

  const [results, setResults] = useState<EligibilityResult[]>(SAMPLE_RESULTS);
  const [note, setNote] = useState<'sample' | 'backendDown' | null>('sample');

  async function handleSubmit(situation: UserSituation) {
    try {
      const real = await api.assess(situation);
      setResults(real);
      setNote(null);
    } catch {
      setNote('backendDown');
      setResults(SAMPLE_RESULTS);
    }
  }

  return (
    <div className="check-page">
      <div className="check-head">
        <h1>{t.check.title}</h1>
        <p className="muted">{t.check.lead}</p>
      </div>
      <IntakeForm onSubmit={handleSubmit} />
      {note && <p className="note">{note === 'sample' ? t.check.sampleNote : t.check.backendDown}</p>}
      <ResultsScreen results={results} />
    </div>
  );
}
