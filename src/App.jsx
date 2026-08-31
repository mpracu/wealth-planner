import { useState, useEffect } from 'react';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import ReactGA from './reactGA.js';
import { BarChart2, Wallet, PiggyBank, BookOpen, Sun, Moon, LogOut, LogIn, Menu, X } from 'lucide-react';
import Auth from './components/Auth';
import Simulator from './components/Simulator';
import NetWorth from './components/NetWorth';
import Budget from './components/Budget';
import Landing from './components/Landing';
import Brand from './components/Brand';
import About from './components/About';
import { useLanguage } from './LanguageContext';
import { installGlobalErrorHandlers } from './errorReporter';
import FeedbackWidget from './components/FeedbackWidget';
import './aws-config';
import './App.css';

function App() {
  const { t, lang, toggleLang } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('sim')) return 'simulator';
    if (params.has('brand')) return 'brand';
    return 'landing';
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    checkUser();
    ReactGA.send({ hitType: 'pageview', page: window.location.pathname });
    installGlobalErrorHandlers(() => user?.username);
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

  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="app">
      <nav className="navbar">
        <h1 className="navbar-logo" onClick={() => navigate('landing')}>
          <img src="/logo-symbol.png" alt="" className="navbar-logo-icon" />
          Caudal
        </h1>
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
                className={view === 'budget' ? 'active' : ''}
                onClick={() => navigate('budget')}
              >
                <PiggyBank size={15} />
                {t('nav.budget')}
              </button>
              <a href="/blog/">
                <BookOpen size={15} />
                {t('nav.blog')}
              </a>
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
              <a href="/blog/">
                <BookOpen size={15} />
                {t('nav.blog')}
              </a>
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

      {view === 'landing' ? (
        <Landing onNavigate={navigate} isAuthenticated={!!user} />
      ) : (
        <div className="container">
          {view === 'login' && !user ? (
            <Auth onAuthSuccess={() => { checkUser(); setView('networth'); }} />
          ) : view === 'about' ? (
            <About onNavigate={navigate} />
          ) : view === 'brand' ? (
            <Brand />
          ) : view === 'simulator' ? (
            <Simulator />
          ) : view === 'networth' && user ? (
            <NetWorth />
          ) : view === 'budget' && user ? (
            <Budget />
          ) : (
            <div className="auth-required">
              <h2>{t('auth.req.title')}</h2>
              <p>{t('auth.req.text')}</p>
              <button onClick={() => setView('login')}>{t('auth.req.btn')}</button>
            </div>
          )}
        </div>
      )}

      <FeedbackWidget user={user} />
    </div>
  );
}

export default App;
