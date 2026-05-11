import { Component } from 'react';
import { reportError } from './errorReporter';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { crashed: false };
  }

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch(error, info) {
    reportError({
      type: 'react_crash',
      message: error.message,
      stack: (error.stack || '') + '\n\nComponent stack:\n' + (info.componentStack || '')
    });
  }

  render() {
    if (this.state.crashed) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '1rem',
          fontFamily: 'system-ui, sans-serif', padding: '2rem', textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem' }}>⚠️</div>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Something went wrong</h2>
          <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>
            The error has been reported automatically. Try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.6rem 1.5rem', background: '#3b82f6', color: '#fff',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem'
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
