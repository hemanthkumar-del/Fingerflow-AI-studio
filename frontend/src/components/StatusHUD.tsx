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
      return { text: 'No Hand', color: '#ef4444', icon: <Hand size={14} /> };
    }
    if (gesture === 'PAUSE') {
      return { text: 'PAUSED (Palm)', color: '#f59e0b', icon: <Pause size={14} /> };
    }
    if (gesture === 'PINCH') {
      return { text: 'PINCH (Resize)', color: '#c084fc', icon: <Maximize2 size={14} /> };
    }
    if (gesture === 'DRAW') {
      return tool === 'eraser'
        ? { text: 'ERASING', color: '#ec4899', icon: <Eraser size={14} /> }
        : { text: 'DRAWING', color: '#10b981', icon: <Edit3 size={14} /> };
    }
    return { text: 'HOVERING', color: '#6366f1', icon: <Hand size={14} /> };
  };

  const badge = getGestureBadge();
  const confPercent = Math.round(confidence * 100);

  return (
    <div
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

      <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.15)', margin: '4px 0' }} />

      {/* Diagnostics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <HandMetal size={12} color="#60a5fa" />
          <span>Hands:</span>
          <span style={{ color: '#f8fafc', fontWeight: 600 }}>{handCount} ({primaryHand})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Cpu size={12} color="#818cf8" />
          <span>Conf:</span>
          <span style={{ color: confPercent >= 90 ? '#10b981' : '#f59e0b', fontWeight: 600 }}>{confPercent}%</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Zap size={12} color="#facc15" />
          <span>Vel:</span>
          <span style={{ color: '#f8fafc', fontWeight: 600 }}>{velocity.toFixed(0)} u/s</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <CheckCircle size={12} color={cooldownActive ? '#ef4444' : '#10b981'} />
          <span>Engine:</span>
          <span style={{ color: cooldownActive ? '#ef4444' : '#10b981', fontWeight: 600 }}>
            {cooldownActive ? 'COOLDOWN' : 'READY'}
          </span>
        </div>
        
        {/* Finger State Matrix */}
        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
          <span>Fingers:</span>
          <div style={{ display: 'flex', gap: '2px' }}>
            {[
              { name: 'T', state: fingerState.thumb },
              { name: 'I', state: fingerState.index },
              { name: 'M', state: fingerState.middle },
              { name: 'R', state: fingerState.ring },
              { name: 'P', state: fingerState.pinky },
            ].map((f) => (
              <span
                key={f.name}
                style={{
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: f.state ? '#10b981' : 'rgba(255,255,255,0.1)',
                  color: f.state ? '#000' : '#fff',
                  borderRadius: '3px',
                  fontSize: '0.6rem',
                  fontWeight: 800,
                }}
                title={f.name}
              >
                {f.name}
              </span>
            ))}
          </div>
        </div>

        {/* Candidate Gestures (Intelligence Engine) */}
        {candidateGestures.length > 0 && (
          <div style={{ gridColumn: '1 / -1', color: '#c084fc', fontSize: '0.7rem', fontStyle: 'italic', marginTop: '2px' }}>
            Detecting: {candidateGestures.join(', ')}...
          </div>
        )}
      </div>

      <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.15)', margin: '4px 0' }} />

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
