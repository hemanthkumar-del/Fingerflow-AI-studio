import React from 'react';

interface WritingCursorProps {
  x: number;
  y: number;
  visible: boolean;
  mode: 'write' | 'erase' | 'idle';
  eraserRadius: number;
}

export const WritingCursor: React.FC<WritingCursorProps> = ({ x, y, visible, mode, eraserRadius }) => {
  if (!visible) return null;

  if (mode === 'erase') {
    return (
      <div
        style={{
          position: 'absolute',
          left: x - eraserRadius,
          top: y - eraserRadius,
          width: eraserRadius * 2,
          height: eraserRadius * 2,
          borderRadius: '50%',
          border: '2px solid rgba(255, 0, 0, 0.8)',
          backgroundColor: 'rgba(255, 0, 0, 0.2)',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(0, 0)', // ensure no extra offset
        }}
      />
    );
  }

  if (mode === 'write') {
    return (
      <div
        style={{
          position: 'absolute',
          left: x - 4,
          top: y - 4,
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#000',
          border: '1px solid #fff',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      />
    );
  }

  // idle
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 4,
        top: y - 4,
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: 'rgba(100, 100, 100, 0.5)',
        border: '1px solid #fff',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
};
