import { Link } from 'react-router-dom';
import { useI18n, usePageTitle } from '../i18n';

// Tone dots reuse the exact ResultCard palette so the legend matches the app.
const STATE_TONES = ['dot--green', 'dot--green', 'dot--slate', 'dot--ochre', 'dot--cloud'];

export function HowItWorksPage() {
  const { t } = useI18n();
  usePageTitle(t.meta.how);

  return (
    <>
      <section className="page-head">
        <div className="container container--narrow">
          <h1>{t.how.title}</h1>
          <p className="lead">{t.how.lead}</p>
        </div>
      </section>

      <section className="section">
        <div className="container container--narrow">
          <h2 className="section-title">{t.how.pipelineTitle}</h2>
          <ol className="steps steps--column">
            {t.how.pipeline.map((s, i) => (
              <li key={s.title} className="step">
                <span className="step-num" aria-hidden>
                  {i + 1}
                </span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--tinted">
        <div className="container container--narrow">
          <h2 className="section-title">{t.how.statesTitle}</h2>
          <p className="section-lead">{t.how.statesLead}</p>
          <ul className="state-list">
            {t.how.states.map((s, i) => (
              <li key={s.name} className="state-item">
                <span className={`dot ${STATE_TONES[i]}`} aria-hidden />
                <div>
                  <strong>{s.name}</strong>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container container--narrow">
          <h2 className="section-title">{t.how.honestyTitle}</h2>
          <p className="prose">{t.how.honestyBody}</p>
          <div className="page-cta">
            <h3>{t.how.ctaTitle}</h3>
            <Link to="/check" className="btn btn-primary">
              {t.home.ctaPrimary}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
