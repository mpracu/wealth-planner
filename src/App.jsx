import { useState, useEffect } from 'react';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import ReactGA from 'react-ga4';
import Auth from './components/Auth';
import Simulator from './components/Simulator';
import NetWorth from './components/NetWorth';
import Blog from './components/Blog';
import './aws-config';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('simulator');

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
    setView('simulator');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <nav className="navbar">
        <h1>💰 Wealth Planner</h1>
        <div className="nav-links">
          <button 
            className={view === 'simulator' ? 'active' : ''} 
            onClick={() => setView('simulator')}
          >
            📊 Simulator
          </button>
          {user ? (
            <>
              <button 
                className={view === 'networth' ? 'active' : ''} 
                onClick={() => setView('networth')}
              >
                💼 Net Worth
              </button>
              <button 
                className={view === 'blog' ? 'active' : ''} 
                onClick={() => setView('blog')}
              >
                📝 Blog
              </button>
              <button onClick={handleSignOut}>🚪 Sign Out</button>
            </>
          ) : (
            <>
              <button 
                className={view === 'blog' ? 'active' : ''} 
                onClick={() => setView('blog')}
              >
                📝 Blog
              </button>
              <button onClick={() => setView('login')}>🔐 Login</button>
            </>
          )}
        </div>
      </nav>

      <div className="container">
        {view === 'login' && !user ? (
          <Auth onAuthSuccess={() => { checkUser(); setView('networth'); }} />
        ) : view === 'simulator' ? (
          <Simulator />
        ) : view === 'blog' ? (
          <Blog />
        ) : view === 'networth' && user ? (
          <NetWorth />
        ) : (
          <div className="auth-required">
            <h2>Login Required</h2>
            <p>Please login to access Net Worth tracking</p>
            <button onClick={() => setView('login')}>Login</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
