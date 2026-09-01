import React from 'react';
import { SettingsManager } from '../../../services/gestureSettings';

/**
 * WritingTrackingHUD
 *
 * Minimal tracking quality indicator shown in Writing Mode.
 * Displays a colored dot + message based on hand visibility quality.
 *
 * Props:
 *   palmSize: normalized 0–1 value of palm size relative to frame height.
 *             Derived from dist(lm[0], lm[9]) / frameHeight.
 *             0 = no hand / very far, 1 = palm fills screen.
 *   isHandDetected: whether MediaPipe is currently tracking a hand.
 *
 * Quality thresholds:
 *   palmSize > 0.20 → GOOD (green)
 *   palmSize 0.10–0.20 → CLOSE (amber) "Move your hand closer"
 *   palmSize < 0.10 or !isHandDetected → POOR (red)
 *
 * Only shown when tracking quality is not GOOD, to avoid cluttering the canvas.
 */

type TrackingQuality = 'GOOD' | 'CLOSER' | 'NO_HAND';

interface WritingTrackingHUDProps {
  palmSize: number;
  isHandDetected: boolean;
  devStats?: { fps: number, state: string, score: number };
}

export const WritingTrackingHUD: React.FC<WritingTrackingHUDProps> = ({
  palmSize,
  isHandDetected,
  devStats,
}) => {
  const isDevMode = SettingsManager.getSettings().developerMode;

  let quality: TrackingQuality;

  if (!isHandDetected || palmSize < 0.01) {
    quality = 'NO_HAND';
  } else if (palmSize < 0.12) {
    quality = 'CLOSER';
  } else {
    quality = 'GOOD';
  }

  // In GOOD state, show nothing so the canvas stays clean (unless Dev Mode is on)
  if (quality === 'GOOD' && !isDevMode) return null;

  const config = {
    NO_HAND: {
      dot: '#ef4444',
      text: 'No hand detected',
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.35)',
    },
    CLOSER: {
      dot: '#f59e0b',
      text: 'Move closer for better tracking',
      bg: 'rgba(245, 158, 11, 0.10)',
      border: 'rgba(245, 158, 11, 0.35)',
    },
    GOOD: {
      dot: '#22c55e',
      text: 'Tracking Good',
      bg: 'rgba(34, 197, 94, 0.10)',
      border: 'rgba(34, 197, 94, 0.35)',
    },
  }[quality];

  return (
    <div
      style={{
        position: 'fixed',
        top: '60px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        zIndex: 120,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {/* Primary quality indicator pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '20px',
          backgroundColor: config.bg,
          border: `1px solid ${config.border}`,
          backdropFilter: 'blur(8px)',
          transition: 'opacity 0.3s ease',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: config.dot,
            boxShadow: `0 0 6px ${config.dot}`,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: '0.78rem', fontWeight: 500, color: '#e2e8f0', whiteSpace: 'nowrap' }}>
          {config.text}
        </span>
      </div>

      {/* Developer Telemetry Pill */}
      {isDevMode && devStats && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '4px 12px',
            borderRadius: '12px',
            backgroundColor: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(4px)',
            fontSize: '0.7rem',
            fontFamily: 'monospace',
            color: '#94a3b8',
          }}
        >
          <span>FPS: <strong style={{color: devStats.fps < 30 ? '#ef4444' : '#22c55e'}}>{devStats.fps}</strong></span>
          <span>Palm: <strong>{(palmSize * 100).toFixed(1)}%</strong></span>
          <span>Conf: <strong>{(devStats.score * 100).toFixed(0)}%</strong></span>
          <span>State: <strong style={{color: devStats.state === 'WRITE' ? '#3b82f6' : devStats.state === 'ERASE' ? '#ec4899' : '#e2e8f0'}}>{devStats.state}</strong></span>
        </div>
      )}
    </div>
  );
};
