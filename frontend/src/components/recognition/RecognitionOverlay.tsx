import React, { useEffect, useState } from 'react';
import type { RecognitionResult } from '../../recognition/RecognitionResult';
import { getRecognitionStatus } from '../../recognition/RecognitionResult';

interface RecognitionOverlayProps {
  result: RecognitionResult | null;
  onAccept: (character: string) => void;
  onDismiss: () => void;
}

/**
 * A non-blocking floating overlay that shows the recognition result.
 * Positioned near the recognized character's bounding box.
 */
export const RecognitionOverlay: React.FC<RecognitionOverlayProps> = ({
  result,
  onAccept,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (result && result.confidence > 0) {
      setVisible(true);
      // Auto-dismiss after 4 seconds if no interaction
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [result]);

  if (!visible || !result || result.confidence === 0 || !result.character) return null;

  const status = getRecognitionStatus(result.confidence);
  if (status === 'low' || status === 'none') return null;

  // Position the overlay above the recognized character's bounding box
  const left = result.boundingBox.left + result.boundingBox.width / 2;
  const top = result.boundingBox.top - 20; // 20px above the character

  const confPercent = Math.round(result.confidence * 100);

  const statusColor = status === 'high' ? '#10b981' : '#f59e0b';

  return (
    <div
      style={{
        position: 'fixed',
        left: Math.max(10, Math.min(window.innerWidth - 200, left)),
        top: Math.max(10, top),
        zIndex: 9000,
        pointerEvents: 'auto',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: `1px solid ${statusColor}`,
          borderRadius: '12px',
          padding: '10px 14px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(12px)',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          minWidth: '120px',
        }}
      >
        {/* Main recognized character + confidence */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              fontFamily: 'Georgia, serif',
              color: statusColor,
            }}
          >
            {result.character}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                color: statusColor,
                fontWeight: 600,
              }}
            >
              ✓ {confPercent}%
            </span>
            <button
              onClick={() => {
                onAccept(result.character);
                setVisible(false);
              }}
              style={{
                background: statusColor,
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '3px 8px',
                cursor: 'pointer',
                fontSize: '0.7rem',
                fontWeight: 600,
              }}
            >
              Accept
            </button>
          </div>
        </div>

        {/* Alternatives (medium confidence) */}
        {status === 'medium' && result.alternatives.length > 0 && (
          <div>
            <div
              style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: '4px' }}
            >
              Alternatives:
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {result.alternatives.slice(0, 3).map(alt => (
                <button
                  key={alt.character}
                  onClick={() => {
                    onAccept(alt.character);
                    setVisible(false);
                  }}
                  title={`${Math.round(alt.confidence * 100)}%`}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontFamily: 'Georgia, serif',
                    color: '#f8fafc',
                    fontWeight: 600,
                  }}
                >
                  {alt.character}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dismiss */}
        <button
          onClick={() => {
            setVisible(false);
            onDismiss();
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            fontSize: '0.65rem',
            cursor: 'pointer',
            textAlign: 'right',
          }}
        >
          Keep handwriting ↩
        </button>
      </div>
    </div>
  );
};
