import { useState } from 'react';
import { BarChart2, Wallet, RefreshCw, PenLine, TrendingUp, Landmark, Flame, Check, ShieldCheck, Lock, Globe, EyeOff } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import Legal from './Legal';
import './Landing.css';

function Landing({ onNavigate, isAuthenticated }) {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  const [legal, setLegal] = useState(null);

  return (
    <div className="landing">
      {legal && <Legal type={legal} onClose={() => setLegal(null)} />}
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

      {/* ── Social proof ────────────────────────────────── */}
      <div className="sp-band">
        <div className="sp-inner">
          <div className="sp-item">
            <span className="sp-value">{t('land.sp.u.val')}</span>
            <span className="sp-label">{t('land.sp.u.lbl')}</span>
          </div>
          <div className="sp-sep" />
          <div className="sp-item">
            <span className="sp-value">{t('land.sp.w.val')}</span>
            <span className="sp-label">{t('land.sp.w.lbl')}</span>
          </div>
          <div className="sp-sep" />
          <div className="sp-item">
            <span className="sp-value">{t('land.sp.p.val')}</span>
            <span className="sp-label">{t('land.sp.p.lbl')}</span>
          </div>
        </div>
      </div>

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

      {/* ── How it works ────────────────────────────────── */}
      <section className="how-section">
        <div className="section-header">
          <h2>{t('land.how.title')}</h2>
          <p>{t('land.how.sub')}</p>
        </div>
        <div className="how-steps">
          <div className="how-step">
            <div className="how-step-num">1</div>
            <div className="how-step-icon"><PenLine size={18} strokeWidth={1.5} /></div>
            <h3>{t('land.how.s1.title')}</h3>
            <p>{t('land.how.s1.desc')}</p>
          </div>
          <div className="how-step">
            <div className="how-step-num">2</div>
            <div className="how-step-icon"><RefreshCw size={18} strokeWidth={1.5} /></div>
            <h3>{t('land.how.s2.title')}</h3>
            <p>{t('land.how.s2.desc')}</p>
          </div>
          <div className="how-step">
            <div className="how-step-num">3</div>
            <div className="how-step-icon"><TrendingUp size={18} strokeWidth={1.5} /></div>
            <h3>{t('land.how.s3.title')}</h3>
            <p>{t('land.how.s3.desc')}</p>
          </div>
        </div>
      </section>

      {/* ── Goals ───────────────────────────────────────── */}
      <section className="goals-band">
        <div className="goals-section">
          <div className="section-header">
            <h2>{t('land.why.title')}</h2>
            <p>{t('land.why.sub')}</p>
          </div>
          <div className="goals-grid">
            <div className="goal-card">
              <div className="goal-icon goal-icon--blue"><Landmark size={20} strokeWidth={1.5} /></div>
              <h3>{t('land.why.g1.title')}</h3>
              <p>{t('land.why.g1.desc')}</p>
            </div>
            <div className="goal-card">
              <div className="goal-icon goal-icon--amber"><Flame size={20} strokeWidth={1.5} /></div>
              <h3>{t('land.why.g2.title')}</h3>
              <p>{t('land.why.g2.desc')}</p>
            </div>
            <div className="goal-card">
              <div className="goal-icon goal-icon--green"><BarChart2 size={20} strokeWidth={1.5} /></div>
              <h3>{t('land.why.g3.title')}</h3>
              <p>{t('land.why.g3.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Security ────────────────────────────────────── */}
      <section className="sec-band">
        <div className="sec-section">
          <div className="section-header">
            <h2>{t('land.sec.title')}</h2>
            <p>{t('land.sec.sub')}</p>
          </div>
          <div className="sec-grid">
            <div className="sec-card">
              <div className="sec-icon"><ShieldCheck size={20} strokeWidth={1.5} /></div>
              <h3>{t('land.sec.s1.title')}</h3>
              <p>{t('land.sec.s1.desc')}</p>
            </div>
            <div className="sec-card">
              <div className="sec-icon"><Lock size={20} strokeWidth={1.5} /></div>
              <h3>{t('land.sec.s2.title')}</h3>
              <p>{t('land.sec.s2.desc')}</p>
            </div>
            <div className="sec-card">
              <div className="sec-icon"><Globe size={20} strokeWidth={1.5} /></div>
              <h3>{t('land.sec.s3.title')}</h3>
              <p>{t('land.sec.s3.desc')}</p>
            </div>
            <div className="sec-card">
              <div className="sec-icon"><EyeOff size={20} strokeWidth={1.5} /></div>
              <h3>{t('land.sec.s4.title')}</h3>
              <p>{t('land.sec.s4.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────── */}
      <section className="pricing-section">
        <div className="section-header">
          <h2>{t('land.price.title')}</h2>
          <p>{t('land.price.sub')}</p>
        </div>
        <div className="pricing-grid">
          <div className="plan-card">
            <div className="plan-name">{t('land.price.free.name')}</div>
            <div className="plan-price">€0<span>{t('land.price.mo')}</span></div>
            <p className="plan-desc">{t('land.price.free.desc')}</p>
            <ul className="plan-features">
              {['f1','f2','f3','f4','f5','f6'].map(k => (
                <li key={k}><Check size={14} strokeWidth={2.5} />{t(`land.price.${k}`)}</li>
              ))}
            </ul>
            <button className="plan-cta plan-cta--free" onClick={() => onNavigate(isAuthenticated ? 'networth' : 'login')}>
              {t('land.price.cta.free')}
            </button>
          </div>

          <div className="plan-card plan-card--pro">
            <div className="plan-badge">{t('land.price.pro.badge')}</div>
            <div className="plan-name">{t('land.price.pro.name')}</div>
            <div className="plan-price">€7<span>{t('land.price.mo')}</span></div>
            <p className="plan-desc">{t('land.price.pro.desc')}</p>
            <ul className="plan-features">
              {['p1','p2','p3','p4','p5','p6','p7'].map(k => (
                <li key={k}><Check size={14} strokeWidth={2.5} />{t(`land.price.${k}`)}</li>
              ))}
            </ul>
            <button className="plan-cta plan-cta--pro" disabled>
              {t('land.price.cta.wait')}
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="lf-inner">
          <div className="lf-brand">
            <div className="lf-logo">💰 Caudal</div>
            <p className="lf-tagline">{t('land.ft.tagline')}</p>
            <div className="lf-socials">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>

          <div className="lf-col">
            <h4 className="lf-col-title">{t('land.ft.col1')}</h4>
            <ul>
              <li><button onClick={() => onNavigate('brand')}>{t('land.ft.brand')}</button></li>
              <li><button onClick={() => onNavigate('about')}>{t('land.ft.what')}</button></li>
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
            <button className="lf-legal-btn" onClick={() => setLegal('terms')}>{t('land.ft.terms')}</button>
            <span className="lf-legal-sep">/</span>
            <button className="lf-legal-btn" onClick={() => setLegal('privacy')}>{t('land.ft.privacy')}</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
