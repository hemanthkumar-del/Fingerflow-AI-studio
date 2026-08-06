import React, { useEffect, useState } from 'react';
import { CanvasManager } from '../engine/CanvasManager';
import { ShapeConfig, ShapePlugin } from '../engine/shapes/ShapePlugin';
import { Square, Circle, Triangle, Minus, ArrowUpRight, Star } from 'lucide-react';

interface ShapeToolbarProps {
  engine: CanvasManager;
}

const SHAPE_ICONS: Record<string, React.ReactNode> = {
  'rect': <Square size={16} />,
  'circle': <Circle size={16} />,
  'triangle': <Triangle size={16} />,
  'line': <Minus size={16} />,
  'arrow': <ArrowUpRight size={16} />,
  'star': <Star size={16} />,
};

export const ShapeToolbar: React.FC<ShapeToolbarProps> = ({ engine }) => {
  const [config, setConfig] = useState<ShapeConfig & { activeShapeId: string }>(engine.shape.getConfig());

  useEffect(() => {
    const onShapeChanged = (newConfig: ShapeConfig & { activeShapeId: string }) => {
      setConfig(newConfig);
    };
    engine.eventBus.on('shape:changed', onShapeChanged);
    return () => {
      engine.eventBus.off('shape:changed', onShapeChanged);
    };
  }, [engine]);

  const plugins = engine.shape.getPlugins();

  return (
    <div style={{
      position: 'absolute',
      bottom: '100px', // Right above the floating toolbar
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px',
      backgroundColor: 'rgba(17, 24, 39, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      zIndex: 50,
      pointerEvents: 'auto',
    }}>
      {plugins.map((plugin) => (
        <button
          key={plugin.id}
          onClick={() => {
            engine.shape.setActiveShape(plugin.id);
            engine.tool.setTool('shape');
          }}
          style={{
            background: config.activeShapeId === plugin.id && engine.tool.getTool() === 'shape' ? '#4f46e5' : 'transparent',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          title={plugin.name}
        >
          {SHAPE_ICONS[plugin.id] || <span>{plugin.icon}</span>}
        </button>
      ))}

      <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)' }} />

      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fff', fontSize: '12px', cursor: 'pointer' }}>
        <input 
          type="checkbox" 
          checked={config.fill} 
          onChange={(e) => engine.shape.setFill(e.target.checked)} 
        />
        Fill
      </label>
      
      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fff', fontSize: '12px', cursor: 'pointer' }}>
        <input 
          type="checkbox" 
          checked={engine.smartShapesEnabled} 
          onChange={(e) => {
            engine.smartShapesEnabled = e.target.checked;
            engine.eventBus.emit('shape:changed', engine.shape.getConfig()); // trigger re-render
          }} 
        />
        Smart Shapes
      </label>
    </div>
  );
};
