import React, { useEffect, useState, useRef } from 'react';
import { fabric } from 'fabric';
import { CanvasManager } from '../engine/CanvasManager';

interface MinimapProps {
  engine: CanvasManager;
}

export const Minimap: React.FC<MinimapProps> = ({ engine }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasObjects, setHasObjects] = useState(false);
  
  useEffect(() => {
    const updateMinimap = () => {
      const minimapCanvas = canvasRef.current;
      if (!minimapCanvas) return;
      const ctx = minimapCanvas.getContext('2d');
      if (!ctx) return;
      
      const width = minimapCanvas.width;
      const height = minimapCanvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, width, height);

      // We need to find the bounds of all objects
      const state = engine.viewport.getState();
      const canvas = (engine as any).canvas as fabric.Canvas;
      
      const objects = canvas.getObjects();
      if (objects.length === 0) {
        setHasObjects(prev => prev ? false : prev);
        return;
      }
      setHasObjects(prev => !prev ? true : prev);

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      objects.forEach(obj => {
        const br = obj.getBoundingRect();
        if (br.left < minX) minX = br.left;
        if (br.top < minY) minY = br.top;
        if (br.left + br.width > maxX) maxX = br.left + br.width;
        if (br.top + br.height > maxY) maxY = br.top + br.height;
      });

      // Expand bounds slightly
      const padding = 100;
      minX -= padding; minY -= padding; maxX += padding; maxY += padding;
      const worldW = maxX - minX;
      const worldH = maxY - minY;
      
      // Calculate scale to fit world inside minimap
      const scaleX = width / worldW;
      const scaleY = height / worldH;
      const scale = Math.min(scaleX, scaleY);
      
      const offsetX = (width - worldW * scale) / 2 - minX * scale;
      const offsetY = (height - worldH * scale) / 2 - minY * scale;

      // Draw objects as simple rects
      ctx.fillStyle = '#6366f1';
      objects.forEach(obj => {
        const br = obj.getBoundingRect();
        ctx.fillRect(
          br.left * scale + offsetX, 
          br.top * scale + offsetY, 
          br.width * scale, 
          br.height * scale
        );
      });

      // Draw Viewport Rect
      const vW = canvas.getWidth() / state.zoom;
      const vH = canvas.getHeight() / state.zoom;
      // The panX and panY translate the world. 
      // The top-left of the screen in world coordinates:
      const worldScreenLeft = -state.panX / state.zoom;
      const worldScreenTop = -state.panY / state.zoom;

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        worldScreenLeft * scale + offsetX,
        worldScreenTop * scale + offsetY,
        vW * scale,
        vH * scale
      );
    };

    engine.eventBus.on('viewport:changed', updateMinimap);
    engine.eventBus.on('history:changed', updateMinimap);
    engine.eventBus.on('layer:rendered', updateMinimap);
    
    // Initial render
    updateMinimap();

    return () => {
      engine.eventBus.off('viewport:changed', updateMinimap);
      engine.eventBus.off('history:changed', updateMinimap);
      engine.eventBus.off('layer:rendered', updateMinimap);
    };
  }, [engine]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '100px',
      left: '16px',
      width: '180px',
      height: '120px',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderRadius: '12px',
      border: '1px solid rgba(139, 92, 246, 0.3)',
      overflow: 'hidden',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
      zIndex: 50,
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {!hasObjects && (
        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
          <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>Canvas Overview</div>
          <div>No content yet</div>
        </div>
      )}
      <canvas 
        ref={canvasRef} 
        width={180} 
        height={120} 
        style={{ 
          width: '100%', 
          height: '100%', 
          cursor: 'pointer',
          display: hasObjects ? 'block' : 'none'
        }} 
      />
    </div>
  );
};
