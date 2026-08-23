import React from 'react';
import { WorkspaceMode } from '../WorkspaceMode';
import { CanvasManager } from '../../engine/CanvasManager';
import { WorkspaceRegistry } from '../WorkspaceRegistry';
import { GestureProfile } from '../GestureProfile';

export class CanvasWorkspaceImpl implements WorkspaceMode {
  id = 'canvas';
  name = 'Canvas Mode';
  icon = '🎨'; // We can use emojis or Lucide icons in a React component context, keeping it simple as string/any here
  description = 'Infinite canvas drawing, shapes, and complex layouts.';

  activate(engine: CanvasManager): void {
    // In v1.0, Canvas Mode is the default baseline. 
    // It doesn't need to do any destructive changes, just make sure 
    // the tool state is ready for canvas drawing.
  }

  deactivate(engine: CanvasManager): void {
    // End any active stroke or transform when leaving canvas mode
    engine.endStroke();
    const canvas = engine.getCanvas();
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }

  getGestureProfile(): GestureProfile {
    return {
      id: 'canvas',
      name: 'Canvas Mode',
      mappings: [
        { gesture: 'DRAW', action: 'Draw/Erase', description: 'Draw or erase strokes' },
        { gesture: 'SELECTION_MODE', action: 'Selection Mode', description: 'Manipulate objects' },
        { gesture: 'PINCH', action: 'Resize', description: 'Scale selected objects or brush' },
        { gesture: 'PAUSE', action: 'Pan', description: 'Pan the infinite canvas' },
        { gesture: 'HOME_DASHBOARD', action: 'Pan', description: 'Pan the infinite canvas' }
      ]
    };
  }

  getStatusMessage(gesture: string, tool: string) {
    if (gesture === 'PAUSE' || gesture === 'HOME_DASHBOARD') {
      return { text: 'Open Palm \u2192 Pan canvas', color: '#f59e0b', icon: null };
    }
    if (gesture === 'PINCH') {
      return { text: 'Resize', color: '#c084fc', icon: null };
    }
    if (gesture === 'SELECTION_MODE') {
      return { text: 'Peace \u2192 Select', color: '#6366f1', icon: null };
    }
    if (gesture === 'DRAW') {
      return tool === 'eraser'
        ? { text: 'Index \u2192 Erase', color: '#ec4899', icon: null }
        : { text: 'Index \u2192 Draw', color: '#10b981', icon: null };
    }
    return { text: 'Tracking...', color: '#6366f1', icon: null };
  }
}

WorkspaceRegistry.register(new CanvasWorkspaceImpl());
