import React, { useState } from 'react';
import { validateEnvironment } from '../../config/envValidation';
import { AlertTriangle, X, Terminal } from 'lucide-react';

export const EnvBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState<boolean>(false);
  const { isValid, missingVars } = validateEnvironment();

  if (isValid || dismissed) return null;

  return (
    <div
      className="glass-panel"
      style={{
        position: 'fixed',
        top: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 90,
        width: '90%',
        maxWidth: '650px',
        padding: '0.85rem 1.25rem',
        borderRadius: '14px',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        color: '#ffffff',
        fontSize: '0.825rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
      }}
    >
      <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontWeight: 700, marginBottom: '2px' }}>
          <Terminal size={14} />
          <span>Vercel Deployment Environment Checklist</span>
        </div>
        <p style={{ color: '#cbd5e1', lineHeight: 1.4 }}>
          Running in demo mode. Add these environment variables in your Vercel Project Settings:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
          {missingVars.map((v) => (
            <span
              key={v}
              style={{
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#facc15',
                border: '1px solid rgba(250, 204, 21, 0.3)',
              }}
            >
              {v}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={() => setDismissed(true)}
        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
