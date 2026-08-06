import React from 'react';

interface SkeletonCardProps {
  count?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="glass-panel"
          style={{
            height: '260px',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'pulse 1.5s infinite ease-in-out',
          }}
        >
          <div style={{ width: '100%', height: '170px', background: 'rgba(255,255,255,0.04)' }} />
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ width: '60%', height: '16px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ width: '40%', height: '12px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }} />
          </div>
        </div>
      ))}
    </>
  );
};
