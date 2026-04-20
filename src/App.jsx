import { useState, useEffect } from 'react';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import ReactGA from 'react-ga4';
import { BarChart2, Wallet, BookOpen, Sun, Moon, LogOut, LogIn, Menu, X, Target } from 'lucide-react';
import Auth from './components/Auth';
import Simulator from './components/Simulator';
import NetWorth from './components/NetWorth';
import Blog from './components/Blog';
import Landing from './components/Landing';
import RiskProfile from './components/RiskProfile';
import './aws-config';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('landing');
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [simulatorPreset, setSimulatorPreset] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    checkUser();
    ReactGA.send({ hitType: 'pageview', page: window.location.pathname });
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setView('landing');
  };

  const navigate = (newView) => {
    setView(newView);
    setMenuOpen(false);
  };

  const handleLoadInSimulator = (profileKey, profile) => {
    // Map profile to a sensible annual return mid-point
    const returnMap = { conservative: 4, moderate: 6.5, aggressive: 9 };
    setSimulatorPreset({ annualReturn: returnMap[profileKey] });
    navigate('simulator');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-brand" onClick={() => navigate('landing')}>
          <svg className="navbar-logo-icon" viewBox="0 0 40 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bagGrad" x1="0" y1="0" x2="40" y2="44" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3b82f6"/>
                <stop offset="100%" stopColor="#22c55e"/>
              </linearGradient>
              <linearGradient id="bagGradLight" x1="0" y1="0" x2="40" y2="44" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#60a5fa"/>
                <stop offset="100%" stopColor="#34d399"/>
              </linearGradient>
            </defs>
            {/* Knot bow — left loop */}
            <ellipse cx="15" cy="11" rx="4" ry="2.5" transform="rotate(-20 15 11)" fill="url(#bagGrad)"/>
            {/* Knot bow — right loop */}
            <ellipse cx="25" cy="11" rx="4" ry="2.5" transform="rotate(20 25 11)" fill="url(#bagGrad)"/>
            {/* Knot centre */}
            <ellipse cx="20" cy="12" rx="3" ry="2.5" fill="url(#bagGradLight)"/>
            {/* Neck */}
            <path d="M15 14 Q20 13 25 14 L24 18 Q20 17 16 18 Z" fill="url(#bagGrad)"/>
            {/* Bag body */}
            <path d="M7 28 C7 20 12 18 16 18 L24 18 C28 18 33 20 33 28 C33 36 27 42 20 42 C13 42 7 36 7 28 Z" fill="url(#bagGrad)"/>
            {/* Shine */}
            <ellipse cx="14" cy="25" rx="3" ry="4" fill="white" opacity="0.15"/>
          </svg>
          <span className="navbar-logo-text">Wealth Planner</span>
        </div>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <button
            className={view === 'simulator' ? 'active' : ''}
            onClick={() => navigate('simulator')}
          >
            <BarChart2 size={15} />
            Simulator
          </button>
          <button
            className={view === 'risk' ? 'active' : ''}
            onClick={() => navigate('risk')}
          >
            <Target size={15} />
            Risk Profile
          </button>
          {user ? (
            <>
              <button
                className={view === 'networth' ? 'active' : ''}
                onClick={() => navigate('networth')}
              >
                <Wallet size={15} />
                Net Worth
              </button>
              <button
                className={view === 'blog' ? 'active' : ''}
                onClick={() => navigate('blog')}
              >
                <BookOpen size={15} />
                Blog
              </button>
              <button
                className="theme-toggle"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button className="nav-signout" onClick={() => { handleSignOut(); setMenuOpen(false); }}>
                <LogOut size={15} />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                className={view === 'blog' ? 'active' : ''}
                onClick={() => navigate('blog')}
              >
                <BookOpen size={15} />
                Blog
              </button>
              <button
                className="theme-toggle"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button className="nav-login" onClick={() => navigate('login')}>
                <LogIn size={15} />
                Login
              </button>
            </>
          )}
        </div>
      </nav>

      <div className="container">
        {view === 'landing' ? (
          <Landing onNavigate={navigate} isAuthenticated={!!user} />
        ) : view === 'login' && !user ? (
          <Auth onAuthSuccess={() => { checkUser(); setView('networth'); }} />
        ) : view === 'risk' ? (
          <RiskProfile onLoadInSimulator={handleLoadInSimulator} />
        ) : view === 'simulator' ? (
          <Simulator preset={simulatorPreset} />
        ) : view === 'blog' ? (
          <Blog />
        ) : view === 'networth' && user ? (
          <NetWorth />
        ) : (
          <div className="auth-required">
            <h2>Login Required</h2>
            <p>Please login to access this feature</p>
            <button onClick={() => setView('login')}>Login</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
