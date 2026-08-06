import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Hand } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FingerFlow AI Uncaught Error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            backgroundColor: '#090d16',
            color: '#ffffff',
            fontFamily: 'sans-serif',
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '480px',
              padding: '2.5rem',
              borderRadius: '24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                padding: '16px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)',
              }}
            >
              <Hand size={36} color="#ffffff" />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>FingerFlow AI Studio</h2>

            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span>{this.state.error?.message || 'An unexpected rendering error occurred.'}</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Please check your environment configuration or reload the application to launch the studio.
            </p>

            <button
              onClick={this.handleReload}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}
            >
              <RefreshCw size={18} />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
