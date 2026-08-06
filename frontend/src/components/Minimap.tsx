import React, { useEffect, useState, useRef } from 'react';
import { fabric } from 'fabric';
import { CanvasManager } from '../engine/CanvasManager';

interface MinimapProps {
  engine: CanvasManager;
}

export const Minimap: React.FC<MinimapProps> = ({ engine }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
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
      if (objects.length === 0) return;

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
      position: 'absolute',
      bottom: '24px',
      left: '24px',
      width: '150px',
      height: '100px',
      backgroundColor: '#1f2937',
      borderRadius: '8px',
      border: '1px solid #374151',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      zIndex: 50
    }}>
      <canvas ref={canvasRef} width={150} height={100} style={{ width: '100%', height: '100%', cursor: 'pointer' }} />
    </div>
  );
};
