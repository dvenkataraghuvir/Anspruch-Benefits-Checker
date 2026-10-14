import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n';
import type { Lang } from '../i18n/translations';

function LangToggle() {
  const { lang, setLang } = useI18n();
  const options: { value: Lang; label: string }[] = [
    { value: 'de', label: 'DE' },
    { value: 'en', label: 'EN' },
  ];
  return (
    <div className="lang-toggle" role="group" aria-label="Language / Sprache">
      {options.map(o => (
        <button
          key={o.value}
          className={`lang-btn ${lang === o.value ? 'lang-btn--active' : ''}`}
          aria-pressed={lang === o.value}
          onClick={() => setLang(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Layout() {
  const { t } = useI18n();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link ${isActive ? 'nav-link--active' : ''}`;

  return (
    <div className="site">
      <div className="beta-banner" role="note">
        <span className="beta-pill">Beta</span>
        <span>{t.beta.text}</span>
      </div>

      <header className="site-header">
        <div className="container site-header-inner">
          <Link to="/" className="brand">
            <span className="logo" aria-hidden>
              A
            </span>
            <span className="brand-text">
              <strong>Anspruch</strong>
              <span className="sub">{t.nav.brandSub}</span>
            </span>
          </Link>

          <nav className="site-nav" aria-label="Main">
            <NavLink to="/" end className={navClass}>
              {t.nav.home}
            </NavLink>
            <NavLink to="/how-it-works" className={navClass}>
              {t.nav.how}
            </NavLink>
            <NavLink to="/privacy" className={navClass}>
              {t.nav.privacy}
            </NavLink>
          </nav>

          <div className="site-header-actions">
            <LangToggle />
            <Link to="/check" className="btn btn-primary btn-small">
              {t.nav.check}
            </Link>
          </div>
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <div className="brand">
              <span className="logo logo--footer" aria-hidden>
                A
              </span>
              <strong>Anspruch</strong>
            </div>
            <p className="footer-tagline">{t.footer.tagline}</p>
          </div>

          <nav className="footer-nav" aria-label="Footer">
            <span className="footer-nav-title">{t.footer.product}</span>
            <Link to="/check">{t.nav.check}</Link>
            <Link to="/how-it-works">{t.nav.how}</Link>
            <Link to="/privacy">{t.nav.privacy}</Link>
          </nav>

          <div className="footer-legal">
            <p>{t.footer.disclaimer}</p>
            <p className="footer-copyright">{t.footer.copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
