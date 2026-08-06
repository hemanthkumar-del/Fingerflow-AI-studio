import React, { useEffect, useState } from 'react';
import { CanvasManager } from '../engine/CanvasManager';
import { SettingsManager } from '../services/gestureSettings';

interface DebugPanelProps {
  engine: CanvasManager;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ engine }) => {
  const [visible, setVisible] = useState(false);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    // Check if dev mode is enabled
    const checkSettings = () => {
      const settings = SettingsManager.getSettings();
      setVisible(settings.developerMode || false);
    };
    checkSettings();

    let frameId: number;
    let lastTime = performance.now();
    let frames = 0;
    
    const loop = () => {
      if (!visible) {
        frameId = requestAnimationFrame(loop);
        return;
      }

      const now = performance.now();
      frames++;
      if (now - lastTime >= 1000) {
        const fps = Math.round((frames * 1000) / (now - lastTime));
        frames = 0;
        lastTime = now;
        
        const canvas = (engine as any).canvas as fabric.Canvas;
        const vpt = engine.viewport.getState();
        const activeLayer = engine.layers.getActiveLayerId();
        
        // Approx memory usage if available
        const memory = (performance as any).memory ? Math.round((performance as any).memory.usedJSHeapSize / 1048576) + ' MB' : 'N/A';
        
        setStats({
          fps,
          frameTime: (1000 / fps).toFixed(1) + ' ms',
          memory,
          zoom: vpt.zoom.toFixed(3),
          pan: `x: ${vpt.panX.toFixed(0)} y: ${vpt.panY.toFixed(0)}`,
          activeLayer,
          objects: canvas.getObjects().length,
          tool: engine.tool.getTool(),
          brush: engine.brush.getActivePlugin().id,
          shape: engine.shape.getActivePlugin().id,
        });
      }
      
      frameId = requestAnimationFrame(loop);
    };
    
    frameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(frameId);
  }, [engine, visible]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '16px',
      right: '16px',
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: '#34d399',
      padding: '12px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 9999,
      pointerEvents: 'none',
      border: '1px solid #064e3b',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      minWidth: '200px'
    }}>
      <div style={{ fontWeight: 'bold', color: '#10b981', marginBottom: '8px', borderBottom: '1px solid #064e3b', paddingBottom: '4px' }}>
        DEVELOPER MODE
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>FPS:</span> <span>{stats.fps}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Frame Time:</span> <span>{stats.frameTime}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Memory:</span> <span>{stats.memory}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Zoom:</span> <span>{stats.zoom}x</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Pan:</span> <span>{stats.pan}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Objects:</span> <span>{stats.objects}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Layer ID:</span> <span style={{ textOverflow: 'ellipsis', maxWidth: '100px', overflow: 'hidden', whiteSpace: 'nowrap' }}>{stats.activeLayer}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Tool:</span> <span>{stats.tool}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Brush:</span> <span>{stats.brush}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Shape:</span> <span>{stats.shape}</span>
      </div>
    </div>
  );
};
