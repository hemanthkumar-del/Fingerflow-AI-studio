import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, PenTool } from 'lucide-react';
import { WritingEngine } from './WritingEngine';

interface WritingStudioPanelProps {
  engine: WritingEngine;
  onExit: () => void;
}

export const WritingStudioPanel: React.FC<WritingStudioPanelProps> = ({ engine, onExit }) => {
  // Collapsed state
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Settings states
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
    <>
      {/* Trigger Button when collapsed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="glass-panel"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 140, // Ensure it's above canvas elements
            padding: '10px 14px',
            borderRadius: '12px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            backdropFilter: 'blur(12px)',
            pointerEvents: 'auto',
          }}
        >
          <ChevronLeft size={18} />
          <span>✍️ Writing Studio</span>
        </button>
      )}

      {/* Main Collapsible Panel */}
      <div
        className="glass-panel"
        style={{
          position: 'absolute',
          top: '20px',
          right: isOpen ? '20px' : '-350px',
          width: '320px',
          height: 'auto',
          maxHeight: 'calc(100vh - 40px)',
          zIndex: 140,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid #374151',
          boxShadow: '-4px 0 25px rgba(0,0,0,0.5)',
          transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: 'auto',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>✍️</span>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
              Writing Studio
            </span>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Ink Color */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 500 }}>Ink Color</label>
            <input
              type="color"
              value={inkColor}
              onChange={handleColorChange}
              style={{
                width: '36px',
                height: '32px',
                borderRadius: '6px',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'transparent',
                padding: '0'
              }}
            />
          </div>

          {/* Ink Size */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 500 }}>
              <span>Ink Size</span>
              <span style={{ color: '#f8fafc', fontWeight: 600 }}>{inkSize}px</span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              value={inkSize}
              onChange={handleSizeChange}
              style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
            />
          </div>

          {/* Eraser Size */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 500 }}>
              <span>Eraser Radius</span>
              <span style={{ color: '#f8fafc', fontWeight: 600 }}>{eraserRadius}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={eraserRadius}
              onChange={handleEraserChange}
              style={{ width: '100%', accentColor: '#ef4444', cursor: 'pointer' }}
            />
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />

          {/* Smart Recognition Toggle */}
          <div
            onClick={handleSmartRecognitionToggle}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              padding: '10px 12px',
              borderRadius: '8px',
              background: smartRecognition ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${smartRecognition ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255,255,255,0.1)'}`,
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: smartRecognition ? '#a5b4fc' : '#cbd5e1', fontWeight: 500 }}>
              🔤 Smart Recognition
            </span>
            <div
              style={{
                width: '36px',
                height: '20px',
                borderRadius: '10px',
                background: smartRecognition ? '#6366f1' : '#374151',
                position: 'relative',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: smartRecognition ? '18px' : '2px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s ease',
                }}
              />
            </div>
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={handleClear}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                padding: '10px 14px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              }}
            >
              🗑 Clear Notes
            </button>

            <button
              onClick={onExit}
              style={{
                background: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 14px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#4338ca';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#4f46e5';
              }}
            >
              <PenTool size={16} />
              Finish Writing
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
