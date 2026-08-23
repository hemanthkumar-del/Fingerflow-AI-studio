import React from 'react';
import { WorkspaceMode } from '../WorkspaceMode';
import { CanvasManager } from '../../engine/CanvasManager';
import { WorkspaceRegistry } from '../WorkspaceRegistry';
import { GestureProfile } from '../GestureProfile';
import { writingGestureProfile } from './writing/WritingGestureProfile';
import { WritingEngine } from './writing/WritingEngine';
import { writingEngineStore } from '../writingEngineStore';

export class WritingWorkspaceImpl implements WorkspaceMode {
  id = 'writing';
  name = 'Writing Mode';
  icon = '✍️';
  description = 'High accuracy handwriting and note taking.';

  private writingEngine: WritingEngine | null = null;

  activate(engine: CanvasManager): void {
    this.writingEngine = new WritingEngine(engine);
    writingEngineStore.current = this.writingEngine;
  }

  deactivate(engine: CanvasManager): void {
    if (this.writingEngine) {
      if (this.writingEngine.isWriting) {
        this.writingEngine.endStroke();
      }
      this.writingEngine.dispose();
      this.writingEngine = null;
      writingEngineStore.current = null;
    }
  }

  getGestureProfile(): GestureProfile {
    return writingGestureProfile;
  }

  getStatusMessage(gesture: string, tool: string) {
    if (gesture === 'DRAW') {
      return { text: 'Index \u2192 Write', color: '#10b981', icon: null };
    }
    if (gesture === 'PAUSE' || gesture === 'HOME_DASHBOARD') {
      return { text: 'Open Palm \u2192 Erase', color: '#f59e0b', icon: null };
    }
    return { text: 'Writing Mode Active', color: '#6366f1', icon: null };
  }
}

WorkspaceRegistry.register(new WritingWorkspaceImpl());
