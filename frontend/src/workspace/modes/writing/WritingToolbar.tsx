import React, { useState } from 'react';
import { WritingEngine } from './WritingEngine';

interface WritingToolbarProps {
  engine: WritingEngine;
  onExit: () => void;
}

export const WritingToolbar: React.FC<WritingToolbarProps> = ({ engine, onExit }) => {
  const [inkColor, setInkColor] = useState(engine.inkColor);
  const [inkSize, setInkSize] = useState(engine.inkSize);
  const [eraserRadius, setEraserRadius] = useState(engine.eraserRadius);
  const [smartRecognition, setSmartRecognition] = useState(engine.isSmartRecognitionEnabled());

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInkColor(val);
    engine.inkColor = val;
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setInkSize(val);
    engine.inkSize = val;
  };

  const handleEraserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setEraserRadius(val);
    engine.eraserRadius = val;
  };

  const handleClear = () => {
    engine.getSessionManager().discardSession();
    engine.getStrokeSession().reset();
  };

  const handleSmartRecognitionToggle = () => {
    const next = !smartRecognition;
    setSmartRecognition(next);
    engine.setSmartRecognition(next);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '100px',
      left: '210px',
      background: 'rgba(15, 23, 42, 0.92)',
      color: '#f8fafc',
      padding: '14px 16px',
      borderRadius: '14px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
      border: '1px solid rgba(139, 92, 246, 0.35)',
      backdropFilter: 'blur(12px)',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      minWidth: '200px',
      pointerEvents: 'auto',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
        <span style={{ fontSize: '1.1rem' }}>✍️</span>
        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Writing Mode</span>
      </div>

      {/* Ink Color */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Ink Color</label>
        <input
          type="color"
          value={inkColor}
          onChange={handleColorChange}
          style={{ width: '32px', height: '28px', borderRadius: '6px', cursor: 'pointer', border: 'none', background: 'transparent' }}
        />
      </div>

      {/* Ink Size */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
          <span>Ink Size</span>
          <span style={{ color: '#f8fafc', fontWeight: 600 }}>{inkSize}px</span>
        </div>
        <input
          type="range" min="2" max="20" value={inkSize}
          onChange={handleSizeChange}
          style={{ width: '100%', accentColor: '#6366f1' }}
        />
      </div>

      {/* Eraser Size */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
          <span>Eraser Radius</span>
          <span style={{ color: '#f8fafc', fontWeight: 600 }}>{eraserRadius}px</span>
        </div>
        <input
          type="range" min="20" max="100" value={eraserRadius}
          onChange={handleEraserChange}
          style={{ width: '100%', accentColor: '#ef4444' }}
        />
      </div>

      {/* Smart Recognition Toggle */}
      <div
        onClick={handleSmartRecognitionToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          padding: '6px 8px',
          borderRadius: '8px',
          background: smartRecognition ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${smartRecognition ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255,255,255,0.1)'}`,
          transition: 'all 0.2s ease',
        }}
      >
        <span style={{ fontSize: '0.8rem', color: smartRecognition ? '#a5b4fc' : '#94a3b8' }}>
          🔤 Smart Recognition
        </span>
        <div style={{
          width: '32px', height: '18px', borderRadius: '9px',
          background: smartRecognition ? '#6366f1' : '#374151',
          position: 'relative', transition: 'background 0.2s',
          flexShrink: 0,
        }}>
          <div style={{
            position: 'absolute', top: '2px',
            left: smartRecognition ? '16px' : '2px',
            width: '14px', height: '14px',
            borderRadius: '50%', background: '#fff',
            transition: 'left 0.2s ease',
          }} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={handleClear}
          style={{
            background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5',
            border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px',
            padding: '7px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
          }}
        >
          🗑 Clear Notes
        </button>
        <button
          onClick={onExit}
          style={{
            background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc',
            border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '8px',
            padding: '8px 12px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
          }}
        >
          Finish Writing →
        </button>
      </div>
    </div>
  );
};
