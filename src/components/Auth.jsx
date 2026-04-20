import { useState } from 'react';
import { signIn, signUp, confirmSignUp, signInWithRedirect, resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import './Auth.css';

export default function Auth({ onAuthSuccess }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await resetPassword({ username: email });
      setMessage('Reset code sent to your email!');
      setMode('resetconfirm');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleResetConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await confirmResetPassword({ username: email, confirmationCode: code, newPassword: password });
      setMessage('Password reset successful! Please sign in.');
      setMode('signin');
      setCode('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <div className="logo">
            <svg className="auth-logo-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="authBagGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#3b82f6"/>
                  <stop offset="100%" stopColor="#22c55e"/>
                </linearGradient>
              </defs>
              <path d="M13 8 C13 6 14.5 5 16 5 C17.5 5 19 6 19 8" stroke="url(#authBagGrad)" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <path d="M10 12 C8 12 6 14 6 17 C6 23 10 27 16 27 C22 27 26 23 26 17 C26 14 24 12 22 12 Z" fill="url(#authBagGrad)"/>
              <rect x="12" y="8" width="8" height="4" rx="2" fill="url(#authBagGrad)"/>
              <path d="M11 17 C11 15 13 13.5 15 13.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
            </svg>
          </div>
          <h1>Wealth Planner</h1>
          <p className="tagline">Track your net worth, plan your future</p>
        </div>
        
        {mode === 'signin' && (
          <form onSubmit={handleSignIn}>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <div className="error">{error}</div>}
            {message && <div className="success">{message}</div>}
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <p className="switch-mode">
              <a onClick={() => setMode('forgot')}>Forgot Password?</a>
            </p>
            <p className="switch-mode">
              Don't have an account? <a onClick={() => setMode('signup')}>Sign Up</a>
            </p>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword}>
            <h2>Reset Password</h2>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            {error && <div className="error">{error}</div>}
            {message && <div className="success">{message}</div>}
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
            <p className="switch-mode">
              <a onClick={() => setMode('signin')}>Back to Sign In</a>
            </p>
          </form>
        )}

        {mode === 'resetconfirm' && (
          <form onSubmit={handleResetConfirm}>
            <h2>Enter Reset Code</h2>
            <input type="text" placeholder="Reset Code" value={code} onChange={e => setCode(e.target.value)} required />
            <input type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <div className="error">{error}</div>}
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <p className="switch-mode">
              <a onClick={() => setMode('signin')}>Back to Sign In</a>
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
