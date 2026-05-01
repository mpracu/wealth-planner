import { BarChart2, Wallet, RefreshCw } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import './Landing.css';

function Landing({ onNavigate, isAuthenticated }) {
  const { t } = useLanguage();

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
    </div>
  );
}

export default Landing;
