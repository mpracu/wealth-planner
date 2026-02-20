import './Landing.css';

function Landing({ onNavigate, isAuthenticated }) {
  return (
    <div className="landing">
      <section className="hero">
        <h1>Build Your Financial Future</h1>
        <p>Track your net worth, simulate wealth growth, and plan your investments with confidence</p>
        <div className="hero-buttons">
          <button className="btn-primary" onClick={() => onNavigate('simulator')}>Try Simulator</button>
          <button className="btn-secondary" onClick={() => onNavigate(isAuthenticated ? 'networth' : 'login')}>
            {isAuthenticated ? 'Go to Net Worth' : 'Sign In'}
          </button>
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <div className="feature-icon">📊</div>
          <h3>Wealth Simulator</h3>
          <p>Model your financial future with compound interest, inflation adjustments, and custom scenarios</p>
        </div>
        <div className="feature">
          <div className="feature-icon">💰</div>
          <h3>Net Worth Tracker</h3>
          <p>Track assets, liabilities, and investments with ISIN codes. Monitor your progress over time</p>
        </div>
        <div className="feature">
          <div className="feature-icon">🔄</div>
          <h3>Recurring Investments</h3>
          <p>Set up automatic monthly contributions and watch them compound automatically</p>
        </div>
        <div className="feature">
          <div className="feature-icon">📈</div>
          <h3>Net Worth Forecast</h3>
          <p>Project your future wealth based on current holdings and recurring investments</p>
        </div>
        <div className="feature">
          <div className="feature-icon">📝</div>
          <h3>Investment Blog</h3>
          <p>Learn about index funds, ETFs, and long-term investing strategies</p>
        </div>
        <div className="feature">
          <div className="feature-icon">🌍</div>
          <h3>Multi-Currency</h3>
          <p>Support for €, $, and £ with proper locale formatting</p>
        </div>
      </section>

      <section className="cta">
        <h2>Start Planning Your Wealth Today</h2>
        <button className="btn-primary" onClick={() => onNavigate(isAuthenticated ? 'networth' : 'login')}>
          {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
        </button>
      </section>
    </div>
  );
}

export default Landing;
