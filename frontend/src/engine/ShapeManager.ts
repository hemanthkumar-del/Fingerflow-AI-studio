import { EventBus } from './EventBus';
import { ShapePlugin, ShapeConfig } from './shapes/ShapePlugin';
import { RectShape, CircleShape, TriangleShape, LineShape, ArrowShape, StarShape } from './shapes/BasicShapes';

export class ShapeManager {
  private eventBus: EventBus;
  private plugins: Map<string, ShapePlugin> = new Map();
  private activeShapeId: string = 'rect';
  
  private color: string = '#6366f1';
  private size: number = 4;
  private opacity: number = 1;
  private fill: boolean = false;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    
    this.registerPlugin(RectShape);
    this.registerPlugin(CircleShape);
    this.registerPlugin(TriangleShape);
    this.registerPlugin(LineShape);
    this.registerPlugin(ArrowShape);
    this.registerPlugin(StarShape);
  }

  public registerPlugin(plugin: ShapePlugin) {
    this.plugins.set(plugin.id, plugin);
  }

  public getPlugins(): ShapePlugin[] {
    return Array.from(this.plugins.values());
  }

  public setActiveShape(id: string) {
    if (this.plugins.has(id)) {
      this.activeShapeId = id;
      this.emitChange();
    }
  }

  public getActivePlugin(): ShapePlugin {
    return this.plugins.get(this.activeShapeId)!;
  }

  public setColor(color: string) {
    this.color = color;
    this.emitChange();
  }

  public setSize(size: number) {
    this.size = Math.max(1, Math.min(50, size));
    this.emitChange();
  }

  public setOpacity(opacity: number) {
    this.opacity = Math.max(0, Math.min(1, opacity));
    this.emitChange();
  }

  public setFill(fill: boolean) {
    this.fill = fill;
    this.emitChange();
  }

  public getConfig(): ShapeConfig & { activeShapeId: string } {
    return {
      activeShapeId: this.activeShapeId,
      color: this.color,
      size: this.size,
      opacity: this.opacity,
      fill: this.fill
    };
  }

  private emitChange() {
    this.eventBus.emit('shape:changed', this.getConfig());
  }
}
