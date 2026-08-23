import React from 'react';
import { useWorkspace } from './WorkspaceContext';

export const ModeSwitcher: React.FC = () => {
  const { currentModeId, setMode, availableModes } = useWorkspace();

  return (
    <div style={{
      position: 'absolute',
      top: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100,
      display: 'flex',
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(12px)',
      borderRadius: '24px',
      padding: '4px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      pointerEvents: 'auto'
    }}>
      {availableModes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => setMode(mode.id)}
          title={mode.description}
          style={{
            background: currentModeId === mode.id ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            color: currentModeId === mode.id ? '#ffffff' : '#94a3b8',
            border: currentModeId === mode.id ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent',
            padding: '6px 16px',
            borderRadius: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            fontWeight: currentModeId === mode.id ? 600 : 500,
            transition: 'all 0.2s ease',
          }}
        >
          <span>{mode.icon}</span>
          <span>{mode.name}</span>
        </button>
      ))}
    </div>
  );
};
