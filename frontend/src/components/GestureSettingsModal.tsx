import React, { useState } from 'react';
import { SettingsManager, GestureSettings } from '../services/gestureSettings';
import { GestureRegistry } from '../services/gestureRegistry';
import { X, Save } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSave: (settings: GestureSettings) => void;
}

export const GestureSettingsModal: React.FC<Props> = ({ onClose, onSave }) => {
  const [settings, setSettings] = useState<GestureSettings>(SettingsManager.getSettings());
  const allGestures = GestureRegistry.getActiveGestures(); // For now, this returns all initialized gestures

  const handleSave = () => {
    SettingsManager.saveSettings(settings);
    onSave(settings);
    onClose();
  };

  const toggleGesture = (id: string) => {
    setSettings(prev => ({
      ...prev,
      enabledGestures: {
        ...prev.enabledGestures,
        [id]: prev.enabledGestures[id] === false ? true : false
      }
    }));
  };

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="glass-panel" style={{
        width: '600px', maxHeight: '80vh', overflowY: 'auto', backgroundColor: '#0f172a',
        borderRadius: '16px', border: '1px solid #334155', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '1.25rem' }}>Gesture Settings</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X /></button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* General Settings */}
          <div>
            <h3 style={{ margin: '0 0 1rem 0', color: '#e2e8f0', fontSize: '1rem' }}>General</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              <input type="checkbox" checked={settings.soundEnabled} onChange={e => setSettings({...settings, soundEnabled: e.target.checked})} />
              Enable Audio Confirmation (Synthetic Beep)
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '1rem' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Confidence Threshold: {settings.confidenceThreshold}%</label>
              <input type="range" min="50" max="100" value={settings.confidenceThreshold} onChange={e => setSettings({...settings, confidenceThreshold: parseInt(e.target.value)})} />
            </div>
          </div>

          {/* Gestures List */}
          <div>
            <h3 style={{ margin: '0 0 1rem 0', color: '#e2e8f0', fontSize: '1rem' }}>Active Gestures</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {allGestures.map(g => (
                <label key={g.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
                  backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <input 
                    type="checkbox" 
                    checked={settings.enabledGestures[g.id] !== false} 
                    onChange={() => toggleGesture(g.id)} 
                  />
                  <div style={{ fontSize: '1.25rem' }}>{g.icon}</div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.9rem' }}>{g.name}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{g.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleSave} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem',
            backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '8px',
            fontWeight: 600, cursor: 'pointer'
          }}>
            <Save size={18} /> Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
