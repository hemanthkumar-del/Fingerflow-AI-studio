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
      return { text: 'Pan Canvas', color: '#f59e0b', icon: <Hand size={14} /> };
    }
    if (gesture === 'PINCH') {
      return { text: 'Resize', color: '#c084fc', icon: <Maximize2 size={14} /> };
    }
    if (gesture === 'SELECTION_MODE') {
      return { text: 'Selection Mode', color: '#6366f1', icon: <Hand size={14} /> };
    }
    if (gesture === 'DRAW') {
      return tool === 'eraser'
        ? { text: 'Erase', color: '#ec4899', icon: <Eraser size={14} /> }
        : { text: 'Draw', color: '#10b981', icon: <Edit3 size={14} /> };
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
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        zIndex: 20,
        padding: '0.75rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        fontSize: '0.85rem',
        color: '#f8fafc',
        borderRadius: '12px',
        minWidth: '280px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>
        {/* FPS Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={16} color={fps >= 45 ? '#10b981' : '#f59e0b'} />
          <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.95rem' }}>
            {fps} <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>FPS</span>
          </span>
        </div>

        {/* Hand & Gesture Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '4px 10px',
            borderRadius: '9999px',
            backgroundColor: `${badge.color}20`,
            border: `1px solid ${badge.color}50`,
            color: badge.color,
            fontWeight: 600,
          }}
        >
          {badge.icon}
          <span>{badge.text}</span>
        </div>
      </div>



      {/* Active Brush & Size Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
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
    </div>
  );
};
