import { Link } from 'react-router-dom';
import { useI18n, usePageTitle } from '../i18n';

export function NotFoundPage() {
  const { t } = useI18n();
  usePageTitle(t.meta.notFound);

  return (
    <section className="page-head page-head--center">
      <div className="container container--narrow">
        <p className="eyebrow">404</p>
        <h1>{t.notFound.title}</h1>
        <p className="lead">{t.notFound.body}</p>
        <Link to="/" className="btn btn-primary">
          {t.notFound.backHome}
        </Link>
      </div>
    </section>
  );
}
