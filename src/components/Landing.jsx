import { BarChart2, Wallet, RefreshCw } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import './Landing.css';

function Landing({ onNavigate, isAuthenticated }) {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-content">
          <h1>
            {t('land.hero.line1')}<br />
            <span className="hero-accent">{t('land.hero.accent')}</span><br />
            {t('land.hero.line3')}
          </h1>
          <p>{t('land.hero.sub')}</p>
          <div className="hero-buttons">
            <button className="btn-outline" onClick={() => onNavigate('simulator')}>
              {t('land.hero.sim')}
            </button>
            <button className="btn-outline" onClick={() => onNavigate(isAuthenticated ? 'networth' : 'login')}>
              {t('land.hero.nw')}
            </button>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-label">{t('land.card.label')}</div>
          <div className="hero-card-value">€284.500</div>
          <div className="hero-card-badge">{t('land.card.badge')}</div>
          <svg className="hero-sparkline" viewBox="0 0 220 64" fill="none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 58 C20 54 40 50 60 44 C80 38 100 32 120 26 C140 20 160 14 180 8 L220 2 L220 64 L0 64 Z"
              fill="url(#sparkFill)"
            />
            <path
              d="M0 58 C20 54 40 50 60 44 C80 38 100 32 120 26 C140 20 160 14 180 8 L220 2"
              stroke="#22c55e"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      <section className="features">
        <div className="feature" onClick={() => onNavigate('simulator')}>
          <div className="feature-icon"><BarChart2 size={18} strokeWidth={1.5} /></div>
          <h3>{t('land.f1.title')}</h3>
          <p>{t('land.f1.desc')}</p>
          <span className="feature-link">{t('land.f1.link')}</span>
        </div>
        <div className="feature" onClick={() => onNavigate(isAuthenticated ? 'networth' : 'login')}>
          <div className="feature-icon"><Wallet size={18} strokeWidth={1.5} /></div>
          <h3>{t('land.f2.title')}</h3>
          <p>{t('land.f2.desc')}</p>
          <span className="feature-link">{t('land.f2.link')}</span>
        </div>
        <div className="feature" onClick={() => onNavigate(isAuthenticated ? 'networth' : 'login')}>
          <div className="feature-icon"><RefreshCw size={18} strokeWidth={1.5} /></div>
          <h3>{t('land.f3.title')}</h3>
          <p>{t('land.f3.desc')}</p>
          <span className="feature-link">{t('land.f3.link')}</span>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="lf-inner">
          <div className="lf-brand">
            <div className="lf-logo">💰 Caudal</div>
            <p className="lf-tagline">{t('land.ft.tagline')}</p>
            <div className="lf-socials">
              <a href="https://github.com/mpracu/wealth-planner" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

          <div className="lf-col">
            <h4 className="lf-col-title">{t('land.ft.col1')}</h4>
            <ul>
              <li><button onClick={() => onNavigate('brand')}>{t('land.ft.brand')}</button></li>
              <li><button onClick={() => onNavigate('landing')}>{t('land.ft.what')}</button></li>
            </ul>
          </div>

          <div className="lf-col">
            <h4 className="lf-col-title">{t('land.ft.col2')}</h4>
            <ul>
              <li><button onClick={() => onNavigate('simulator')}>{t('land.ft.sim')}</button></li>
              <li><button onClick={() => onNavigate('risk')}>{t('land.ft.risk')}</button></li>
              <li><button onClick={() => onNavigate('blog')}>{t('land.ft.blog')}</button></li>
              <li><button onClick={() => onNavigate(isAuthenticated ? 'networth' : 'login')}>{t('land.ft.nw')}</button></li>
            </ul>
          </div>

          <div className="lf-col">
            <h4 className="lf-col-title">{t('land.ft.col3')}</h4>
            <ul>
              {isAuthenticated ? null : (
                <>
                  <li><button onClick={() => onNavigate('login')}>{t('land.ft.login')}</button></li>
                  <li><button onClick={() => onNavigate('login')}>{t('land.ft.register')}</button></li>
                </>
              )}
              {isAuthenticated && (
                <li><button onClick={() => onNavigate('networth')}>{t('land.ft.nw')}</button></li>
              )}
            </ul>
          </div>
        </div>

        <div className="lf-bottom">
          <span>{t('land.ft.copy').replace('{year}', year)}</span>
          <div className="lf-legal">
            <button className="lf-legal-btn">{t('land.ft.terms')}</button>
            <span className="lf-legal-sep">/</span>
            <button className="lf-legal-btn">{t('land.ft.privacy')}</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
