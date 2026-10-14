import { useI18n, usePageTitle } from '../i18n';

export function PrivacyPage() {
  const { t } = useI18n();
  usePageTitle(t.meta.privacy);

  return (
    <>
      <section className="page-head">
        <div className="container container--narrow">
          <h1>{t.privacy.title}</h1>
          <p className="lead">{t.privacy.lead}</p>
        </div>
      </section>

      <section className="section">
        <div className="container container--narrow">
          {t.privacy.sections.map(s => (
            <article key={s.title} className="prose-block">
              <h2>{s.title}</h2>
              <p>{s.body}</p>
            </article>
          ))}
          <p className="note">{t.privacy.legalNote}</p>
        </div>
      </section>
    </>
  );
}
