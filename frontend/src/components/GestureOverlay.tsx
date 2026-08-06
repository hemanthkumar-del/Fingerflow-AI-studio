import React, { useEffect, useState } from 'react';

export interface GestureOverlayProps {
  icon: string;
  name: string;
  durationMs: number;
}

export const GestureOverlay: React.FC<GestureOverlayProps> = ({ icon, name, durationMs }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), durationMs);
    return () => clearTimeout(t);
  }, [name, durationMs]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(12px)',
        padding: '2rem 3rem',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      }}
    >
      <div style={{ fontSize: '5rem', marginBottom: '1rem', textShadow: '0 10px 15px rgba(0,0,0,0.5)' }}>
        {icon}
      </div>
      <div style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.05em' }}>
        {name.toUpperCase()}
      </div>

      <style>
        {`
          @keyframes popIn {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
            100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          }
        `}
      </style>
    </div>
  );
};
