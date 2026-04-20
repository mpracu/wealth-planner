import { BarChart2, Wallet, RefreshCw } from 'lucide-react';
import './Landing.css';

function Landing({ onNavigate, isAuthenticated }) {
  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-content">
          <h1>
            Build your<br />
            <span className="hero-accent">financial</span> future<br />
            with confidence
          </h1>
          <p>
            Track net worth, simulate wealth growth, and plan recurring
            investments, all in one place.
          </p>
          <div className="hero-buttons">
            <button className="btn-outline" onClick={() => onNavigate('simulator')}>
              Try simulator
            </button>
            <button className="btn-outline" onClick={() => onNavigate(isAuthenticated ? 'networth' : 'login')}>
              View net worth
            </button>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-label">Total net worth</div>
          <div className="hero-card-value">€284,500</div>
          <div className="hero-card-badge">+12.4% this year</div>
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
          <h3>Wealth simulator</h3>
          <p>Project your future wealth with custom investment scenarios and timelines.</p>
          <span className="feature-link">Open simulator →</span>
        </div>
        <div className="feature" onClick={() => onNavigate(isAuthenticated ? 'networth' : 'login')}>
          <div className="feature-icon"><Wallet size={18} strokeWidth={1.5} /></div>
          <h3>Net worth tracker</h3>
          <p>Connect your accounts and get a real-time view of your full financial picture.</p>
          <span className="feature-link">Track now →</span>
        </div>
        <div className="feature" onClick={() => onNavigate(isAuthenticated ? 'networth' : 'login')}>
          <div className="feature-icon"><RefreshCw size={18} strokeWidth={1.5} /></div>
          <h3>Recurring investments</h3>
          <p>Set up automatic contributions and watch compound growth do its work.</p>
          <span className="feature-link">Set up →</span>
        </div>
      </section>
    </div>
  );
}

export default Landing;
