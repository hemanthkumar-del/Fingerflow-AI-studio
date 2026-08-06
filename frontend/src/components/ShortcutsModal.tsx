import React from 'react';
import { X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#1f2937',
        padding: '24px',
        borderRadius: '12px',
        width: '500px',
        color: 'white',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Command size={24} /> Keyboard & Gestures
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <h3 style={{ color: '#9ca3af', fontSize: '14px', textTransform: 'uppercase', marginBottom: '12px' }}>Keyboard</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Command Palette</span>
              <kbd style={{ background: '#374151', padding: '2px 6px', borderRadius: '4px' }}>Ctrl + K</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Undo</span>
              <kbd style={{ background: '#374151', padding: '2px 6px', borderRadius: '4px' }}>Ctrl + Z</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Redo</span>
              <kbd style={{ background: '#374151', padding: '2px 6px', borderRadius: '4px' }}>Ctrl + Y</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Zoom In/Out</span>
              <kbd style={{ background: '#374151', padding: '2px 6px', borderRadius: '4px' }}>Ctrl + Scroll</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Pan Canvas</span>
              <kbd style={{ background: '#374151', padding: '2px 6px', borderRadius: '4px' }}>Scroll</kbd>
            </div>
          </div>

          <div>
            <h3 style={{ color: '#9ca3af', fontSize: '14px', textTransform: 'uppercase', marginBottom: '12px' }}>Gestures</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Draw</span>
              <span>☝️ Index Point</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Erase</span>
              <span>✊ Closed Fist</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Select Object</span>
              <span>✌️ Peace</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Pan Canvas</span>
              <span>🖐️ Open Palm</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Cloud Save</span>
              <span>👍 Thumb Up</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
