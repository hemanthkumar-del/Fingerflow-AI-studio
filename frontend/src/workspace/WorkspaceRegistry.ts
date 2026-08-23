import { WorkspaceMode } from './WorkspaceMode';

class WorkspaceRegistryImpl {
  private modes: Map<string, WorkspaceMode> = new Map();

  register(mode: WorkspaceMode): void {
    if (this.modes.has(mode.id)) {
      console.warn(`WorkspaceMode with id ${mode.id} is already registered.`);
      return;
    }
    this.modes.set(mode.id, mode);
  }

  get(id: string): WorkspaceMode | undefined {
    return this.modes.get(id);
  }

  getAll(): WorkspaceMode[] {
    return Array.from(this.modes.values());
  }
}

export const WorkspaceRegistry = new WorkspaceRegistryImpl();
