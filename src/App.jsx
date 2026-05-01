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
import { useLanguage } from './LanguageContext';
import './aws-config';
import './App.css';

function App() {
  const { t, lang, toggleLang } = useLanguage();
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

  const handleLoadInSimulator = (profileKey) => {
    const returnMap = { conservative: 4, moderate: 6.5, aggressive: 9 };
    setSimulatorPreset({ annualReturn: returnMap[profileKey] });
    navigate('simulator');
  };

  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="app">
      <nav className="navbar">
        <h1 className="navbar-logo" onClick={() => navigate('landing')}>💰 Wealth Planner</h1>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label={t('nav.toggleMenu')}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <button
            className={view === 'simulator' ? 'active' : ''}
            onClick={() => navigate('simulator')}
          >
            <BarChart2 size={15} />
            {t('nav.simulator')}
          </button>
          <button
            className={view === 'risk' ? 'active' : ''}
            onClick={() => navigate('risk')}
          >
            <Target size={15} />
            {t('nav.risk')}
          </button>
          {user ? (
            <>
              <button
                className={view === 'networth' ? 'active' : ''}
                onClick={() => navigate('networth')}
              >
                <Wallet size={15} />
                {t('nav.networth')}
              </button>
              <button
                className={view === 'blog' ? 'active' : ''}
                onClick={() => navigate('blog')}
              >
                <BookOpen size={15} />
                {t('nav.blog')}
              </button>
              <button
                className="theme-toggle"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title={theme === 'dark' ? t('nav.switchLight') : t('nav.switchDark')}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button className="theme-toggle lang-toggle" onClick={toggleLang} title={lang === 'es' ? 'Switch to English' : 'Cambiar a español'}>
                {t('nav.langToggle')}
              </button>
              <button className="nav-signout" onClick={() => { handleSignOut(); setMenuOpen(false); }}>
                <LogOut size={15} />
                {t('nav.signout')}
              </button>
            </>
          ) : (
            <>
              <button
                className={view === 'blog' ? 'active' : ''}
                onClick={() => navigate('blog')}
              >
                <BookOpen size={15} />
                {t('nav.blog')}
              </button>
              <button
                className="theme-toggle"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title={theme === 'dark' ? t('nav.switchLight') : t('nav.switchDark')}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button className="theme-toggle lang-toggle" onClick={toggleLang} title={lang === 'es' ? 'Switch to English' : 'Cambiar a español'}>
                {t('nav.langToggle')}
              </button>
              <button className="nav-login" onClick={() => navigate('login')}>
                <LogIn size={15} />
                {t('nav.login')}
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
            <h2>{t('auth.req.title')}</h2>
            <p>{t('auth.req.text')}</p>
            <button onClick={() => setView('login')}>{t('auth.req.btn')}</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
