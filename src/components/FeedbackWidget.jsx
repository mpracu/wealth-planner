import { useState } from 'react';
import { MessageSquarePlus, X, Send, ChevronDown } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import './FeedbackWidget.css';

const API = import.meta.env.VITE_API_ENDPOINT;

export default function FeedbackWidget({ user }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('feedback');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done | error

  const submit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus('sending');
    try {
      const res = await fetch(`${API}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          message: message.trim(),
          email: email.trim() || null,
          userId: user?.username || null
        })
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  };

  const reset = () => {
    setOpen(false);
    setTimeout(() => { setMessage(''); setEmail(''); setType('feedback'); setStatus('idle'); }, 300);
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        className={`fb-trigger ${open ? 'fb-trigger--open' : ''}`}
        onClick={() => open ? reset() : setOpen(true)}
        aria-label="Feedback"
      >
        {open
          ? <X size={18} strokeWidth={2} />
          : <><MessageSquarePlus size={18} strokeWidth={2} /><span>{t('fb.btn')}</span></>
        }
      </button>

      {/* Panel */}
      {open && (
        <div className="fb-panel">
          <div className="fb-panel-header">
            <h3>{t('fb.title')}</h3>
            <p>{t('fb.sub')}</p>
          </div>

          {status === 'done' ? (
            <div className="fb-success">
              <div className="fb-success-icon">✓</div>
              <p>{t('fb.thanks')}</p>
              <button className="fb-close-btn" onClick={reset}>{t('fb.close')}</button>
            </div>
          ) : (
            <form onSubmit={submit} className="fb-form">
              {/* Type selector */}
              <div className="fb-type-row">
                {[
                  { id: 'feedback', label: t('fb.type.general'), emoji: '💬' },
                  { id: 'feature',  label: t('fb.type.feature'),  emoji: '✨' },
                  { id: 'bug',      label: t('fb.type.bug'),      emoji: '🐛' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`fb-type-btn ${type === opt.id ? 'fb-type-btn--active' : ''}`}
                    onClick={() => setType(opt.id)}
                  >
                    <span>{opt.emoji}</span> {opt.label}
                  </button>
                ))}
              </div>

              {/* Message */}
              <textarea
                className="fb-textarea"
                placeholder={t('fb.placeholder')}
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                required
                autoFocus
              />

              {/* Optional email */}
              <input
                className="fb-email"
                type="email"
                placeholder={t('fb.emailPh')}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />

              {status === 'error' && (
                <p className="fb-error">{t('fb.error')}</p>
              )}

              <button
                type="submit"
                className="fb-submit"
                disabled={!message.trim() || status === 'sending'}
              >
                {status === 'sending'
                  ? t('fb.sending')
                  : <><Send size={14} strokeWidth={2} /> {t('fb.send')}</>
                }
              </button>
            </form>
          )}
        </div>
      )}

      {/* Backdrop on mobile */}
      {open && <div className="fb-backdrop" onClick={reset} />}
    </>
  );
}
