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
            <svg className="auth-logo-icon" viewBox="0 0 40 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="authBagGrad" x1="0" y1="0" x2="40" y2="44" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#3b82f6"/>
                  <stop offset="100%" stopColor="#22c55e"/>
                </linearGradient>
                <linearGradient id="authBagGradLight" x1="0" y1="0" x2="40" y2="44" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#60a5fa"/>
                  <stop offset="100%" stopColor="#34d399"/>
                </linearGradient>
              </defs>
              <ellipse cx="15" cy="11" rx="4" ry="2.5" transform="rotate(-20 15 11)" fill="url(#authBagGrad)"/>
              <ellipse cx="25" cy="11" rx="4" ry="2.5" transform="rotate(20 25 11)" fill="url(#authBagGrad)"/>
              <ellipse cx="20" cy="12" rx="3" ry="2.5" fill="url(#authBagGradLight)"/>
              <path d="M15 14 Q20 13 25 14 L24 18 Q20 17 16 18 Z" fill="url(#authBagGrad)"/>
              <path d="M7 28 C7 20 12 18 16 18 L24 18 C28 18 33 20 33 28 C33 36 27 42 20 42 C13 42 7 36 7 28 Z" fill="url(#authBagGrad)"/>
              <ellipse cx="14" cy="25" rx="3" ry="4" fill="white" opacity="0.15"/>
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
