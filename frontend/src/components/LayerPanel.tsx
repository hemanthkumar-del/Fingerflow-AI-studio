import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Unlock, Copy, Trash2, Plus, GripVertical } from 'lucide-react';
import { Layer } from '../engine/LayerManager';
import { CanvasManager } from '../engine/CanvasManager';

interface LayerPanelProps {
  engine: CanvasManager;
  layers: Layer[];
  activeLayerId: string | null;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({ engine, layers, activeLayerId }) => {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    engine.layers.reorderLayers(draggedIdx, index);
    setDraggedIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  return (
    <div style={{
      position: 'absolute',
      right: '20px',
      top: '20px',
      width: '280px',
      backgroundColor: '#111827',
      borderRadius: '12px',
      border: '1px solid #374151',
      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      color: '#fff',
      maxHeight: '70vh'
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #374151',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontWeight: 600
      }}>
        Layers
        <button 
          onClick={() => engine.layers.createLayer()}
          style={{ background: 'transparent', border: 'none', color: '#6366f1', cursor: 'pointer' }}
          title="New Layer"
        >
          <Plus size={18} />
        </button>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
        {layers.map((layer, idx) => (
          <div 
            key={layer.id}
            draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
            onDragEnd={handleDragEnd}
            onClick={() => engine.layers.setActiveLayer(layer.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              backgroundColor: activeLayerId === layer.id ? '#1f2937' : 'transparent',
              border: activeLayerId === layer.id ? '1px solid #6366f1' : '1px solid transparent',
              borderRadius: '8px',
              marginBottom: '4px',
              cursor: 'pointer',
              opacity: draggedIdx === idx ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            <div style={{ cursor: 'grab', marginRight: '8px', color: '#6b7280' }}>
              <GripVertical size={16} />
            </div>

            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#374151',
              borderRadius: '4px',
              marginRight: '12px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }}>
              {layer.thumbnail ? (
                <img src={layer.thumbnail} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>{idx}</div>
              )}
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
              <input 
                type="text" 
                value={layer.name} 
                onChange={(e) => engine.layers.renameLayer(layer.id, e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  width: '100%',
                  outline: 'none',
                  fontSize: '14px',
                  fontWeight: activeLayerId === layer.id ? 600 : 400
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', color: '#9ca3af' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); engine.layers.setLayerLock(layer.id, !layer.locked); }}
                style={{ background: 'transparent', border: 'none', color: layer.locked ? '#fbbf24' : '#9ca3af', cursor: 'pointer', padding: 0 }}
                title={layer.locked ? "Unlock" : "Lock"}
              >
                {layer.locked ? <Lock size={16} /> : <Unlock size={16} />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); engine.layers.setLayerVisibility(layer.id, !layer.visible); }}
                style={{ background: 'transparent', border: 'none', color: layer.visible ? '#9ca3af' : '#4b5563', cursor: 'pointer', padding: 0 }}
                title={layer.visible ? "Hide" : "Show"}
              >
                {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #374151',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Opacity slider for active layer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>Opacity</span>
          <input 
            type="range" 
            min="0" max="1" step="0.05"
            value={layers.find(l => l.id === activeLayerId)?.opacity || 1}
            onChange={(e) => activeLayerId && engine.layers.setLayerOpacity(activeLayerId, parseFloat(e.target.value))}
            style={{ flex: 1 }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '12px', marginLeft: '12px' }}>
          <button 
            onClick={() => activeLayerId && engine.layers.duplicateLayer(activeLayerId)}
            style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
            title="Duplicate Layer"
          >
            <Copy size={16} />
          </button>
          <button 
            onClick={() => activeLayerId && engine.layers.deleteLayer(activeLayerId)}
            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
            title="Delete Layer"
            disabled={layers.length <= 1}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
