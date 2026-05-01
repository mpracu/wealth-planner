import { useState } from 'react';
import { signIn, signUp, confirmSignUp, signInWithRedirect, resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import ShieldLogo from './ShieldLogo';
import { useLanguage } from '../LanguageContext';
import './Auth.css';

export default function Auth({ onAuthSuccess }) {
  const { t } = useLanguage();
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
    } catch {
      setError(t('auth.googleError'));
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
      setMessage(t('auth.resetSent'));
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
      setMessage(t('auth.resetSuccess'));
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
          <ShieldLogo className="auth-logo" />
          <h1>Wealth Planner</h1>
          <p className="tagline">{t('auth.tagline')}</p>
        </div>

        {mode === 'signin' && (
          <form onSubmit={handleSignIn}>
            <input type="email" placeholder={t('auth.email')} value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder={t('auth.password')} value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <div className="error">{error}</div>}
            {message && <div className="success">{message}</div>}
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? t('auth.signingIn') : t('auth.signIn')}
            </button>
            <p className="switch-mode">
              <a onClick={() => setMode('forgot')}>{t('auth.forgot')}</a>
            </p>
            <p className="switch-mode">
              {t('auth.noAccount')} <a onClick={() => setMode('signup')}>{t('auth.signUp')}</a>
            </p>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword}>
            <h2>{t('auth.reset.title')}</h2>
            <input type="email" placeholder={t('auth.email')} value={email} onChange={e => setEmail(e.target.value)} required />
            {error && <div className="error">{error}</div>}
            {message && <div className="success">{message}</div>}
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? t('auth.sending') : t('auth.sendCode')}
            </button>
            <p className="switch-mode">
              <a onClick={() => setMode('signin')}>{t('auth.backSignIn')}</a>
            </p>
          </form>
        )}

        {mode === 'resetconfirm' && (
          <form onSubmit={handleResetConfirm}>
            <h2>{t('auth.enterCode')}</h2>
            <input type="text" placeholder={t('auth.resetCode')} value={code} onChange={e => setCode(e.target.value)} required />
            <input type="password" placeholder={t('auth.newPass')} value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <div className="error">{error}</div>}
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? t('auth.resetting') : t('auth.reset.title')}
            </button>
            <p className="switch-mode">
              <a onClick={() => setMode('signin')}>{t('auth.backSignIn')}</a>
            </p>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignUp}>
            <h2>{t('auth.createAcc')}</h2>
            <input type="email" placeholder={t('auth.email')} value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder={t('auth.passMin')} value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <div className="error">{error}</div>}
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? t('auth.creating') : t('auth.signUp')}
            </button>
            <p className="switch-mode">
              {t('auth.hasAccount')} <a onClick={() => setMode('signin')}>{t('auth.signIn')}</a>
            </p>
          </form>
        )}

        {mode === 'confirm' && (
          <form onSubmit={handleConfirm}>
            <h2>{t('auth.confirm.title')}</h2>
            <p className="info-text">{t('auth.confirm.check')}</p>
            <input type="text" placeholder={t('auth.confirm.code')} value={code} onChange={e => setCode(e.target.value)} required />
            {error && <div className="error">{error}</div>}
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? t('auth.confirming') : t('auth.confirm.btn')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
