import { Link } from 'react-router-dom';
import { useI18n, usePageTitle } from '../i18n';

const PRINCIPLE_ICONS = ['§', '=', '🛡'];

export function HomePage() {
  const { t } = useI18n();
  usePageTitle(t.meta.home);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="container hero-inner">
          <p className="eyebrow">{t.home.eyebrow}</p>
          <h1>{t.home.heroTitle}</h1>
          <p className="lead">{t.home.heroLead}</p>
          <div className="hero-actions">
            <Link to="/check" className="btn btn-primary">
              {t.home.ctaPrimary}
            </Link>
            <Link to="/how-it-works" className="btn btn-ghost">
              {t.home.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust principles ─────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">{t.home.principlesTitle}</h2>
          <div className="card-grid">
            {t.home.principles.map((p, i) => (
              <article key={p.title} className="feature-card">
                <span className="feature-icon" aria-hidden>
                  {PRINCIPLE_ICONS[i]}
                </span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Steps ────────────────────────────────────────────────── */}
      <section className="section section--tinted">
        <div className="container">
          <h2 className="section-title">{t.home.stepsTitle}</h2>
          <ol className="steps">
            {t.home.steps.map((s, i) => (
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

      {/* ── Programs ─────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">{t.home.programsTitle}</h2>
          <p className="section-lead">{t.home.programsLead}</p>
          <div className="program-list">
            <article className="program-card">
              <header className="program-head">
                <h3>{t.home.programWohngeldTitle}</h3>
                <span className="pill pill--green">{t.home.programWohngeldStatus}</span>
              </header>
              <p>{t.home.programWohngeldBody}</p>
            </article>
            <article className="program-card">
              <header className="program-head">
                <h3>{t.home.programMoreTitle}</h3>
                <span className="pill pill--ochre">{t.home.programMoreStatus}</span>
              </header>
              <p>{t.home.programMoreBody}</p>
            </article>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="section section--tinted">
        <div className="container container--narrow">
          <h2 className="section-title">{t.home.faqTitle}</h2>
          <div className="faq">
            {t.home.faq.map(item => (
              <details key={item.q} className="faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="cta-box">
            <h2>{t.home.ctaBoxTitle}</h2>
            <p>{t.home.ctaBoxBody}</p>
            <Link to="/check" className="btn btn-light">
              {t.home.ctaPrimary}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
