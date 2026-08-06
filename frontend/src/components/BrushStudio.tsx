import React, { useState } from 'react';
import { X, Sliders, Heart, Eraser, PenTool } from 'lucide-react';
import { CanvasManager } from '../engine/CanvasManager';
import { BrushPlugin, BrushPhysics } from '../engine/brushes/BrushPlugin';

interface BrushStudioProps {
  engine: CanvasManager;
  isOpen: boolean;
  onClose: () => void;
}

export const BrushStudio: React.FC<BrushStudioProps> = ({ engine, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'library' | 'settings'>('library');
  const [category, setCategory] = useState<'All' | 'Favorites' | 'Sketching' | 'Painting' | 'FX' | 'Airbrushing'>('All');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['pencil']));
  
  const plugins = engine.brush.getPlugins();
  const config = engine.brush.getConfig();
  const activePlugin = engine.brush.getActivePlugin();

  const handlePhysicsChange = (key: keyof BrushPhysics, value: number) => {
    engine.brush.updatePhysics({ [key]: value });
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavs = new Set(favorites);
    if (newFavs.has(id)) newFavs.delete(id);
    else newFavs.add(id);
    setFavorites(newFavs);
  };

  const renderPhysicsSlider = (label: string, key: keyof BrushPhysics, min = 0, max = 1, step = 0.05) => (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>{label}</span>
        <span style={{ fontSize: '12px', color: '#fff' }}>{Math.round((config.physics[key] || 0) * 100)}%</span>
      </div>
      <input 
        type="range" min={min} max={max} step={step}
        value={config.physics[key] || 0}
        onChange={(e) => handlePhysicsChange(key, parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: '#6366f1' }}
      />
    </div>
  );

  return (
    <div style={{
      position: 'absolute',
      left: isOpen ? 0 : '-360px',
      top: 0,
      bottom: 0,
      width: '360px',
      backgroundColor: '#111827',
      borderRight: '1px solid #374151',
      transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      color: '#fff',
      boxShadow: isOpen ? '10px 0 25px rgba(0,0,0,0.5)' : 'none'
    }}>
      {/* Header */}
      <div style={{ padding: '20px', borderBottom: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PenTool size={20} color="#6366f1" /> Brush Studio
        </h2>
        <button onClick={onClose} style={btnStyle}><X size={20} /></button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #374151' }}>
        <button 
          onClick={() => setActiveTab('library')}
          style={{ ...tabStyle, borderBottomColor: activeTab === 'library' ? '#6366f1' : 'transparent', color: activeTab === 'library' ? '#6366f1' : '#9ca3af' }}
        >
          Library
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          style={{ ...tabStyle, borderBottomColor: activeTab === 'settings' ? '#6366f1' : 'transparent', color: activeTab === 'settings' ? '#6366f1' : '#9ca3af' }}
        >
          <Sliders size={14} style={{ marginRight: '6px' }} /> Settings
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {activeTab === 'library' ? (
          <>
            {/* Categories */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '12px' }}>
              {['All', 'Favorites', 'Sketching', 'Painting', 'FX', 'Airbrushing'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCategory(cat as any)}
                  style={{
                    background: category === cat ? '#374151' : 'transparent',
                    border: '1px solid #4b5563',
                    color: category === cat ? '#fff' : '#9ca3af',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Brush Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {plugins
                .filter(p => category === 'All' || (category === 'Favorites' ? favorites.has(p.id) : p.category === category))
                .map(plugin => (
                <div 
                  key={plugin.id}
                  onClick={() => engine.brush.setActiveBrush(plugin.id)}
                  style={{
                    backgroundColor: config.activeBrushId === plugin.id ? '#1f2937' : 'transparent',
                    border: config.activeBrushId === plugin.id ? '1px solid #6366f1' : '1px solid #374151',
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative'
                  }}
                >
                  <button 
                    onClick={(e) => toggleFavorite(plugin.id, e)}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'transparent', border: 'none', color: favorites.has(plugin.id) ? '#ef4444' : '#4b5563', cursor: 'pointer', padding: 0 }}
                  >
                    <Heart size={14} fill={favorites.has(plugin.id) ? '#ef4444' : 'none'} />
                  </button>
                  <span style={{ fontSize: '24px', marginBottom: '8px' }}>{plugin.icon}</span>
                  <span style={{ fontSize: '14px', fontWeight: 500, textAlign: 'center' }}>{plugin.name}</span>
                  <span style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>{plugin.category}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Active Brush Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <span style={{ fontSize: '32px' }}>{activePlugin?.icon}</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px' }}>{activePlugin?.name}</h3>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>{activePlugin?.category}</span>
              </div>
            </div>

            {/* Core Settings */}
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6366f1' }}>Core Settings</h4>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>Size</span>
                <span style={{ fontSize: '12px', color: '#fff' }}>{config.size}px</span>
              </div>
              <input 
                type="range" min="1" max="100" 
                value={config.size}
                onChange={(e) => engine.brush.setSize(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#6366f1' }}
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>Opacity</span>
                <span style={{ fontSize: '12px', color: '#fff' }}>{Math.round(config.opacity * 100)}%</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.05"
                value={config.opacity}
                onChange={(e) => engine.brush.setOpacity(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#6366f1' }}
              />
            </div>

            {renderPhysicsSlider('Flow', 'flow')}
            {renderPhysicsSlider('Scatter', 'scatter')}
            {renderPhysicsSlider('Hardness', 'hardness')}
            {renderPhysicsSlider('Rotation', 'rotation', 0, 360, 1)}

            {/* Advanced Physics */}
            <h4 style={{ margin: '24px 0 16px 0', fontSize: '14px', color: '#6366f1' }}>Advanced Engine</h4>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>Velocity Sensitivity</span>
                <span style={{ fontSize: '12px', color: '#fff' }}>{Math.round(config.velocitySensitivity * 100)}%</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.05"
                value={config.velocitySensitivity}
                onChange={(e) => engine.brush.updateAdvancedSettings(parseFloat(e.target.value), config.strokeStabilization, config.pressureSimulation)}
                style={{ width: '100%', accentColor: '#10b981' }}
              />
              <p style={{ fontSize: '10px', color: '#6b7280', margin: '4px 0 0 0' }}>Higher values make fast strokes thinner.</p>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>Stroke Stabilization</span>
                <span style={{ fontSize: '12px', color: '#fff' }}>{Math.round(config.strokeStabilization * 100)}%</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.05"
                value={config.strokeStabilization}
                onChange={(e) => engine.brush.updateAdvancedSettings(config.velocitySensitivity, parseFloat(e.target.value), config.pressureSimulation)}
                style={{ width: '100%', accentColor: '#10b981' }}
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>Pressure Simulation</span>
                <span style={{ fontSize: '12px', color: '#fff' }}>{Math.round(config.pressureSimulation * 100)}%</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.05"
                value={config.pressureSimulation}
                onChange={(e) => engine.brush.updateAdvancedSettings(config.velocitySensitivity, config.strokeStabilization, parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981' }}
              />
            </div>

          </>
        )}
      </div>
    </div>
  );
};

const btnStyle = {
  background: 'transparent',
  border: 'none',
  color: '#9ca3af',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex'
};

const tabStyle = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  borderBottom: '2px solid transparent',
  padding: '12px',
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: '14px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
};
