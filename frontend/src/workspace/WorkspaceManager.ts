import { CanvasManager } from '../engine/CanvasManager';
import { WorkspaceMode } from './WorkspaceMode';
import { WorkspaceRegistry } from './WorkspaceRegistry';

export class WorkspaceManager {
  private currentMode: WorkspaceMode | null = null;

  constructor(private engine: CanvasManager) {}

  activateMode(id: string): boolean {
    const mode = WorkspaceRegistry.get(id);
    if (!mode) {
      console.error(`Cannot activate unknown workspace mode: ${id}`);
      return false;
    }

    if (this.currentMode?.id === id) {
      return true; // Already active
    }

    // Deactivate current mode if exists
    if (this.currentMode) {
      this.currentMode.deactivate(this.engine);
    }

    // Activate new mode
    this.currentMode = mode;
    this.currentMode.activate(this.engine);
    
    return true;
  }

  getCurrentMode(): WorkspaceMode | null {
    return this.currentMode;
  }
}
