import React from 'react';
import { WorkspaceMode } from '../WorkspaceMode';
import { CanvasManager } from '../../engine/CanvasManager';
import { WorkspaceRegistry } from '../WorkspaceRegistry';
import { GestureProfile } from '../GestureProfile';

export class WritingWorkspaceImpl implements WorkspaceMode {
  id = 'writing';
  name = 'Writing Mode';
  icon = '✍️';
  description = 'Handwriting recognition and document creation (Coming Soon).';

  activate(engine: CanvasManager): void {
    // Placeholder for Phase 10.1
    // We do NOT modify the existing canvas state to preserve data.
  }

  deactivate(engine: CanvasManager): void {
    // Placeholder for Phase 10.1
  }

  getGestureProfile(): GestureProfile {
    return {
      id: 'writing',
      name: 'Writing Mode',
      mappings: [
        { gesture: 'DRAW', action: 'Write', description: 'Write text' },
        { gesture: 'PAUSE', action: 'Erase', description: 'Erase text' }
      ]
    };
  }

  getStatusMessage(gesture: string, tool: string) {
    if (gesture === 'DRAW') {
      return { text: 'Index \u2192 Write (Placeholder)', color: '#10b981', icon: null };
    }
    if (gesture === 'PAUSE' || gesture === 'HOME_DASHBOARD') {
      return { text: 'Open Palm \u2192 Erase (Placeholder)', color: '#f59e0b', icon: null };
    }
    return { text: 'Writing Mode Active', color: '#6366f1', icon: null };
  }
}

WorkspaceRegistry.register(new WritingWorkspaceImpl());
