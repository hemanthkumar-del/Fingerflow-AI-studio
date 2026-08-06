import React, { useState, useEffect } from 'react';
import { Settings, X } from 'lucide-react';
import { SettingsManager, GestureSettings } from '../services/gestureSettings';
import { CanvasManager } from '../engine/CanvasManager';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  engine: CanvasManager | null;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({ isOpen, onClose, engine }) => {
  const [settings, setSettings] = useState<GestureSettings>(SettingsManager.getSettings());

  useEffect(() => {
    if (isOpen) {
      setSettings(SettingsManager.getSettings());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    SettingsManager.saveSettings(settings);
    // Force a full page reload or emit event to apply settings cleanly (specifically dev mode)
    window.location.reload(); 
  };

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
        width: '400px',
        color: 'white',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={24} /> Workspace Preferences
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={settings.developerMode || false}
              onChange={(e) => setSettings({ ...settings, developerMode: e.target.checked })}
            />
            Enable Developer Mode (Debug Panel)
          </label>
          <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px', marginLeft: '24px' }}>
            Displays real-time FPS, memory usage, coordinates, and engine metrics.
          </p>
        </div>

        <button 
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            marginTop: '16px'
          }}
        >
          Save & Reload Workspace
        </button>
      </div>
    </div>
  );
};
