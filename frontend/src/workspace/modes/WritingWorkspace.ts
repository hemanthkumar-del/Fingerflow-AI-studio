import { WorkspaceMode } from '../WorkspaceMode';
import { CanvasManager } from '../../engine/CanvasManager';
import { WorkspaceRegistry } from '../WorkspaceRegistry';
import { GestureProfile } from '../GestureProfile';
import { writingGestureProfile } from './writing/WritingGestureProfile';
import { WritingEngine } from './writing/WritingEngine';
import { WritingIndexDetector } from './writing/WritingIndexDetector';
import { writingEngineStore } from '../writingEngineStore';
import { writingDetectorStore } from '../writingDetectorStore';

export class WritingWorkspaceImpl implements WorkspaceMode {
  id = 'writing';
  name = 'Writing Mode';
  icon = '✍️';
  description = 'High accuracy handwriting and note taking.';

  private writingEngine: WritingEngine | null = null;
  private writingDetector: WritingIndexDetector | null = null;

  activate(engine: CanvasManager): void {
    this.writingEngine = new WritingEngine(engine);
    writingEngineStore.current = this.writingEngine;

    this.writingDetector = new WritingIndexDetector();
    writingDetectorStore.current = this.writingDetector;
  }

  deactivate(_engine: CanvasManager): void {
    if (this.writingEngine) {
      if (this.writingEngine.isWriting) {
        this.writingEngine.endStroke();
      }
      this.writingEngine.dispose();
      this.writingEngine = null;
      writingEngineStore.current = null;
    }

    if (this.writingDetector) {
      this.writingDetector.reset();
      this.writingDetector = null;
      writingDetectorStore.current = null;
    }
  }

  getGestureProfile(): GestureProfile {
    return writingGestureProfile;
  }

  getStatusMessage(gesture: string, _tool: string) {
    if (gesture === 'DRAW') {
      return { text: 'Index → Write', color: '#10b981', icon: null };
    }
    if (gesture === 'PAUSE' || gesture === 'HOME_DASHBOARD') {
      return { text: 'Open Palm → Erase', color: '#f59e0b', icon: null };
    }
    return { text: 'Writing Mode Active', color: '#6366f1', icon: null };
  }
}

WorkspaceRegistry.register(new WritingWorkspaceImpl());
