import React, { useEffect, useState } from 'react';
import { Move, Maximize, RotateCw, Copy, Trash2, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { CanvasManager } from '../engine/CanvasManager';
import { SelectionMode } from '../engine/SelectionManager';

interface SelectionToolbarProps {
  engine: CanvasManager;
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({ engine }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mode, setMode] = useState<SelectionMode>('select');
  const [isMulti, setIsMulti] = useState(false);

  useEffect(() => {
    if (!engine) return;

    const updateUI = (activeObjects: any[]) => {
      if (activeObjects.length > 0) {
        setIsMulti(activeObjects.length > 1);
        
        // Calculate bounding box of selection to position toolbar
        const canvas = engine.getCanvas();
        const activeSelection = canvas.getActiveObject();
        if (activeSelection) {
          const rect = activeSelection.getBoundingRect();
          // Position above the selection
          setPosition({
            top: Math.max(10, rect.top - 60),
            left: rect.left + rect.width / 2 - 150 // approximate center
          });
          setVisible(true);
        }
      } else {
        setVisible(false);
      }
    };

    engine.eventBus.on('selection:changed', updateUI);
    engine.eventBus.on('selection:mode_changed', setMode);

    // Initial check
    updateUI(engine.selection.getActiveObjects());

    return () => {
      engine.eventBus.off('selection:changed', updateUI);
      engine.eventBus.off('selection:mode_changed', setMode);
    };
  }, [engine]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'absolute',
      top: position.top,
      left: position.left,
      backgroundColor: '#1f2937',
      borderRadius: '8px',
      padding: '8px',
      display: 'flex',
      gap: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      border: '1px solid #374151',
      zIndex: 40,
      color: '#fff',
      transition: 'top 0.1s, left 0.1s'
    }}>
      {/* Modes */}
      <div style={{ display: 'flex', gap: '4px', borderRight: '1px solid #4b5563', paddingRight: '8px' }}>
        <button 
          onClick={() => engine.selection.setMode('move')}
          style={{ background: mode === 'move' ? '#6366f1' : 'transparent', border: 'none', color: '#fff', borderRadius: '4px', padding: '6px', cursor: 'pointer' }}
          title="Move Mode (Index Finger)"
        >
          <Move size={16} />
        </button>
        <button 
          onClick={() => engine.selection.setMode('resize')}
          style={{ background: mode === 'resize' ? '#6366f1' : 'transparent', border: 'none', color: '#fff', borderRadius: '4px', padding: '6px', cursor: 'pointer' }}
          title="Resize Mode (Pinch)"
        >
          <Maximize size={16} />
        </button>
        <button 
          onClick={() => engine.selection.setMode('rotate')}
          style={{ background: mode === 'rotate' ? '#6366f1' : 'transparent', border: 'none', color: '#fff', borderRadius: '4px', padding: '6px', cursor: 'pointer' }}
          title="Rotate Mode (Index Circle)"
        >
          <RotateCw size={16} />
        </button>
      </div>

      {/* Alignment (Only if multi-selected or if we support single align to canvas) */}
      <div style={{ display: 'flex', gap: '4px', borderRight: '1px solid #4b5563', paddingRight: '8px', opacity: isMulti ? 1 : 0.5, pointerEvents: isMulti ? 'auto' : 'none' }}>
        <button onClick={() => engine.selection.alignActiveObjects('left')} style={btnStyle} title="Align Left"><AlignLeft size={16} /></button>
        <button onClick={() => engine.selection.alignActiveObjects('center')} style={btnStyle} title="Align Center"><AlignCenter size={16} /></button>
        <button onClick={() => engine.selection.alignActiveObjects('right')} style={btnStyle} title="Align Right"><AlignRight size={16} /></button>
        <button onClick={() => engine.selection.alignActiveObjects('middle')} style={btnStyle} title="Align Middle"><AlignJustify size={16} /></button>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {/* We would wire duplicate here, assuming engine.duplicateActive() exists. For now just delete is implemented fully. */}
        <button 
          onClick={() => {
            const objects = engine.selection.getActiveObjects();
            const cmd = new (require('../engine/commands/TransformCommands').DeleteObjectCommand)(engine.getCanvas(), objects);
            engine.history.execute(cmd);
          }}
          style={{ background: 'transparent', border: 'none', color: '#ef4444', borderRadius: '4px', padding: '6px', cursor: 'pointer' }}
          title="Delete (Fist)"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

const btnStyle = {
  background: 'transparent', 
  border: 'none', 
  color: '#9ca3af', 
  borderRadius: '4px', 
  padding: '6px', 
  cursor: 'pointer'
};
