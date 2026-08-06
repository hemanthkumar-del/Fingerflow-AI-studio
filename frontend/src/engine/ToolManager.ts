import { EventBus } from './EventBus';

export type ToolType = 'brush' | 'eraser' | 'selection' | 'shape';

export class ToolManager {
  private eventBus: EventBus;
  private activeTool: ToolType = 'brush';

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  public setTool(tool: ToolType) {
    if (this.activeTool === tool) return;
    this.activeTool = tool;
    this.eventBus.emit('tool:changed', this.activeTool);
  }

  public getTool(): ToolType {
    return this.activeTool;
  }
}
