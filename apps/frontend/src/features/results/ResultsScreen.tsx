import { ResultCard } from '../../components/ResultCard';
import { useI18n } from '../../i18n';
import type { EligibilityResult } from '../../contract/types';

export function ResultsScreen({ results }: { results: EligibilityResult[] }) {
  const { t } = useI18n();
  return (
    <section className="results">
      <h2>{t.results.title}</h2>
      <div className="cards">
        {results.map((r) => (
          <ResultCard key={`${r.program_id}-${r.program_version}`} result={r} />
        ))}
      </div>
    </section>
  );
}
