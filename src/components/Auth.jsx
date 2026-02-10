import { useState } from 'react';
import { signIn, signUp, confirmSignUp, signInWithRedirect } from 'aws-amplify/auth';
import './Auth.css';

export default function Auth({ onAuthSuccess }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithRedirect({ provider: 'Google' });
    } catch (err) {
      setError('Google sign-in not configured yet. Use email/password for now.');
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn({ username: email, password });
      onAuthSuccess();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signUp({ username: email, password, options: { userAttributes: { email } } });
      setMode('confirm');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      await signIn({ username: email, password });
      onAuthSuccess();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <div className="logo">💰</div>
          <h1>Wealth Planner</h1>
          <p className="tagline">Track your net worth, plan your future</p>
        </div>
        
        {mode === 'signin' && (
          <form onSubmit={handleSignIn}>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <div className="error">{error}</div>}
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <p className="switch-mode">
              Don't have an account? <a onClick={() => setMode('signup')}>Sign Up</a>
            </p>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignUp}>
            <h2>Create Account</h2>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password (min 8 chars)" value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <div className="error">{error}</div>}
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
            <p className="switch-mode">
              Already have an account? <a onClick={() => setMode('signin')}>Sign In</a>
            </p>
          </form>
        )}

        {mode === 'confirm' && (
          <form onSubmit={handleConfirm}>
            <h2>Confirm Email</h2>
            <p className="info-text">Check your email for the confirmation code</p>
            <input type="text" placeholder="Confirmation Code" value={code} onChange={e => setCode(e.target.value)} required />
            {error && <div className="error">{error}</div>}
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? 'Confirming...' : 'Confirm'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
