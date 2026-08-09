import React from 'react';
import { Activity, Hand, Edit3, Eraser, Pause, Maximize2, Cpu, Zap, HandMetal, CheckCircle } from 'lucide-react';
import { GestureType, FingerState } from '../services/gestureClassifier';

interface StatusHUDProps {
  fps: number;
  isHandDetected: boolean;
  gesture: GestureType;
  tool: 'brush' | 'eraser' | 'selection' | 'shape';
  brushColor: string;
  brushSize: number;
  confidence: number;
  fingerState: FingerState;
  velocity: number;
  handCount: number;
  primaryHand: 'Left' | 'Right' | 'None';
  candidateGestures: string[];
  cooldownActive: boolean;
}

export const StatusHUD: React.FC<StatusHUDProps> = ({
  fps,
  isHandDetected,
  gesture,
  tool,
  brushColor,
  brushSize,
  confidence,
  fingerState,
  velocity,
  handCount,
  primaryHand,
  candidateGestures,
  cooldownActive,
}) => {
  const getGestureBadge = () => {
    if (!isHandDetected) {
      return { text: 'Show your hand to begin', color: '#94a3b8', icon: <Hand size={14} /> };
    }
    if (gesture === 'PAUSE' || gesture === 'HOME_DASHBOARD') {
      return { text: 'Open Palm \u2192 Pan canvas', color: '#f59e0b', icon: <Hand size={14} /> };
    }
    if (gesture === 'PINCH') {
      return { text: 'Resize', color: '#c084fc', icon: <Maximize2 size={14} /> };
    }
    if (gesture === 'SELECTION_MODE') {
      return { text: 'Peace \u2192 Select', color: '#6366f1', icon: <Hand size={14} /> };
    }
    if (gesture === 'DRAW') {
      return tool === 'eraser'
        ? { text: 'Index \u2192 Erase', color: '#ec4899', icon: <Eraser size={14} /> }
        : { text: 'Index \u2192 Draw', color: '#10b981', icon: <Edit3 size={14} /> };
    }
    return { text: 'Tracking...', color: '#6366f1', icon: <Activity size={14} /> };
  };

  const badge = getGestureBadge();
  const confPercent = Math.round(confidence * 100);

  return (
    <div
      data-tour="status-hud"
      className="glass-panel"
      style={{
        position: 'fixed',
        top: '80px',
        left: '16px',
        zIndex: 20,
        padding: '0.75rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        fontSize: '0.85rem',
        color: '#f8fafc',
        borderRadius: '12px',
        minWidth: '280px',
        border: '1px solid rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>
        {/* Hand & Gesture Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: badge.color,
            fontWeight: 600,
            fontSize: '0.95rem'
          }}
        >
          {badge.icon}
          <span>{badge.text}</span>
        </div>
      </div>

      {/* Active Brush & Size Indicator */}
      {isHandDetected && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.25rem' }}>
          <div
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: tool === 'eraser' ? '#ffffff' : brushColor,
              border: '2px solid rgba(255,255,255,0.5)',
              boxShadow: `0 0 8px ${brushColor}`,
            }}
          />
          <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#cbd5e1' }}>
            {tool === 'eraser' ? 'Eraser' : 'Brush'}: {brushSize}px
          </span>
        </div>
      )}
    </div>
  );
};
