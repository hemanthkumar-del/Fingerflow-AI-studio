import React from 'react';
import { Hand, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

export const GestureGuide: React.FC<{ isEmbedded?: boolean }> = ({ isEmbedded = false }) => {
  const containerStyle: React.CSSProperties = isEmbedded ? {} : {
    display: 'flex', flexDirection: 'column', gap: '12px',
    maxHeight: '60vh', overflowY: 'auto', paddingRight: '12px'
  };

  const gestureItems = [
    { icon: '☝️', name: 'Index Finger', action: 'Draw / Move', desc: 'Hold up your index finger to draw or move objects.' },
    { icon: '🖐️', name: 'Open Palm', action: 'Pan Canvas / Dash', desc: 'Use an open palm to pan the infinite canvas.' },
    { icon: '✌️', name: 'Peace Sign', action: 'Selection Mode', desc: 'Switch to selection mode to manipulate objects.' },
    { icon: '🤏', name: 'Pinch', action: 'Resize / Scale', desc: 'Pinch index and thumb to resize objects or change brush size.' },
    { icon: '👌', name: 'OK Sign', action: 'Duplicate', desc: 'Hold OK sign to duplicate the selected object.' },
    { icon: '✊', name: 'Closed Fist', action: 'Delete', desc: 'Close your fist to delete the selected object.' },
    { icon: '👍', name: 'Thumb Up', action: 'Save to Cloud', desc: 'Save your current progress to the cloud.' },
    { icon: '👎', name: 'Thumb Down', action: 'Undo', desc: 'Undo your last action.' },
    { icon: '🖖', name: 'Three Fingers', action: 'Color Picker', desc: 'Activate the color picker mode.' },
    { icon: '🤘', name: 'Rock Sign', action: 'AI Enhance', desc: 'Trigger AI enhancement on your drawing.' },
    { icon: '🤟', name: 'Love Sign', action: 'Export PNG', desc: 'Quickly export your canvas as a PNG.' }
  ];

  const swipeItems = [
    { icon: <ArrowLeft size={16} />, name: 'Swipe Left', action: 'Undo', desc: 'Quickly swipe hand left.' },
    { icon: <ArrowRight size={16} />, name: 'Swipe Right', action: 'Redo', desc: 'Quickly swipe hand right.' },
    { icon: <ArrowUp size={16} />, name: 'Swipe Up', action: 'Open AI', desc: 'Swipe up to open AI Studio.' },
    { icon: <ArrowDown size={16} />, name: 'Swipe Down', action: 'Clear Canvas', desc: 'Swipe down to clear the canvas.' }
  ];

  return (
    <div style={containerStyle}>
      {!isEmbedded && (
        <div style={{
          padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', 
          border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '16px'
        }}>
          <strong>💡 Tip:</strong> Hold your hand steady for a moment when switching gestures.
        </div>
      )}

      <h4 style={{ color: '#c084fc', margin: '0 0 8px 0', fontSize: '1rem' }}>Static Gestures</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
        {gestureItems.map(g => (
          <div key={g.name} style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
            <div style={{ fontSize: '24px', display: 'flex', alignItems: 'center' }}>{g.icon}</div>
            <div>
              <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem' }}>{g.name}</div>
              <div style={{ color: '#a855f7', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>{g.action}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{g.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <h4 style={{ color: '#c084fc', margin: '16px 0 8px 0', fontSize: '1rem' }}>Dynamic Swipes</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
        {swipeItems.map(g => (
          <div key={g.name} style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
            <div style={{ fontSize: '20px', display: 'flex', alignItems: 'center', color: '#60a5fa' }}>{g.icon}</div>
            <div>
              <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem' }}>{g.name}</div>
              <div style={{ color: '#a855f7', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>{g.action}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{g.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
