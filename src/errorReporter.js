const API = import.meta.env.VITE_API_ENDPOINT;

// Per-session deduplication: don't report the same error twice in one session
const reported = new Set();

function errorKey(message) {
  return (message || '').slice(0, 120);
}

export function reportError({ type, message, stack, userId } = {}) {
  const key = `${type}:${errorKey(message)}`;
  if (reported.has(key)) return;
  reported.add(key);

  // Fire-and-forget — never throw
  try {
    fetch(`${API}/error-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        message,
        stack,
        userId: userId || null,
        url: window.location.href,
        userAgent: navigator.userAgent
      })
    }).catch(() => {});
  } catch {}
}

export function installGlobalErrorHandlers(getUserId) {
  window.addEventListener('error', (e) => {
    // Ignore cross-origin script errors (no useful info)
    if (e.message === 'Script error.' && !e.filename) return;
    reportError({
      type: 'js_error',
      message: e.message,
      stack: e.error?.stack || `${e.filename}:${e.lineno}:${e.colno}`,
      userId: getUserId?.()
    });
  });

  window.addEventListener('unhandledrejection', (e) => {
    const message = e.reason?.message || String(e.reason);
    const stack = e.reason?.stack;
    reportError({ type: 'unhandled_promise', message, stack, userId: getUserId?.() });
  });
}
