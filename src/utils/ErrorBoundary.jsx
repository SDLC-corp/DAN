import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Keep this minimal; you can wire to Sentry later
    // eslint-disable-next-line no-console
    console.error('UI crashed:', error, info);
  }

  render() {
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (!hasError) return children;

    return (
      <div style={{ padding: 24, fontFamily: 'system-ui' }}>
        <h2>Something went wrong</h2>
        <p>Please refresh. If the issue continues, contact support.</p>
        {error ? (
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f6f8fa', padding: 12, borderRadius: 8 }}>
            {String(error)}
          </pre>
        ) : null}
      </div>
    );
  }
}