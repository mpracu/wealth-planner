import { useState, useEffect } from 'react';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { BarChart2, Wallet, PiggyBank, BookOpen, Sailboat, Sun, Moon, LogOut, LogIn, Menu, X } from 'lucide-react';
import Auth from './components/Auth';
import Simulator from './components/Simulator';
import CoastFire from './components/CoastFire';
import NetWorth from './components/NetWorth';
import Budget from './components/Budget';
import Landing from './components/Landing';
import Brand from './components/Brand';
import About from './components/About';
import { useLanguage } from './LanguageContext';
import { installGlobalErrorHandlers } from './errorReporter';
import FeedbackWidget from './components/FeedbackWidget';
import { ROUTES, viewFromLocation, pathFor } from './routes.js';
import { usePortfolio } from './lib/usePortfolio.js';
import './aws-config';
import './App.css';

function App() {
  const { t, lang, toggleLang } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(() => viewFromLocation(window.location));
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    checkUser();
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
    navigate('landing');
  };

  const portfolio = usePortfolio(!!user);

  // Each view has its own URL: keep the address bar, the back button and the
  // tab title in step with what is on screen.
  const navigate = (newView, search = '') => {
    const url = pathFor(newView) + search;
    if (url !== window.location.pathname + window.location.search) {
      window.history.pushState({}, '', url);
    }
    setView(newView);
    setMenuOpen(false);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const onPop = () => setView(viewFromLocation(window.location));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    document.title = ROUTES[view]?.title || 'Caudal - Haz fluir tu patrimonio';
  }, [view]);

  // Real links (so they can be opened in a new tab and crawled) that still
  // switch view without a page reload on a plain click.
  const linkTo = (target) => ({
    href: pathFor(target),
    onClick: (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      navigate(target);
    },
  });

  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="app">
      <nav className="navbar">
        <a className="navbar-logo" {...linkTo('landing')}>
          <img src="/logo-symbol.png" alt="" className="navbar-logo-icon" />
          Caudal
        </a>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label={t('nav.toggleMenu')}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <a className={view === 'simulator' ? 'active' : ''} {...linkTo('simulator')}>
            <BarChart2 size={15} />
            {t('nav.simulator')}
          </a>
          <a className={view === 'coastfire' ? 'active' : ''} {...linkTo('coastfire')}>
            <Sailboat size={15} />
            {t('nav.coastfire')}
          </a>
          {user ? (
            <>
              <a className={view === 'networth' ? 'active' : ''} {...linkTo('networth')}>
                <Wallet size={15} />
                {t('nav.networth')}
              </a>
              <a className={view === 'budget' ? 'active' : ''} {...linkTo('budget')}>
                <PiggyBank size={15} />
                {t('nav.budget')}
              </a>
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
        <Landing onNavigate={navigate} isAuthenticated={!!user} portfolio={portfolio} />
      ) : (
        <div className="container">
          {view === 'login' && !user ? (
            <Auth onAuthSuccess={() => { checkUser(); navigate('networth'); }} />
          ) : view === 'about' ? (
            <About onNavigate={navigate} />
          ) : view === 'brand' ? (
            <Brand />
          ) : view === 'simulator' ? (
            <Simulator portfolio={portfolio} />
          ) : view === 'coastfire' ? (
            <CoastFire portfolio={portfolio} />
          ) : view === 'networth' && user ? (
            <NetWorth />
          ) : view === 'budget' && user ? (
            <Budget />
          ) : (
            <div className="auth-required">
              <h2>{t('auth.req.title')}</h2>
              <p>{t('auth.req.text')}</p>
              <button onClick={() => navigate('login')}>{t('auth.req.btn')}</button>
            </div>
          )}
        </div>
      )}

      <FeedbackWidget user={user} />
    </div>
  );
}

export default App;
