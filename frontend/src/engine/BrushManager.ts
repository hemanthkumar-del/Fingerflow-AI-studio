import { EventBus } from './EventBus';
import { BrushPlugin, BrushPhysics } from './brushes/BrushPlugin';
import { 
  PencilBrushPlugin, NeonBrushPlugin, CalligraphyBrushPlugin,
  InkBrushPlugin, MarkerBrushPlugin, ChalkBrushPlugin, PixelBrushPlugin,
  WatercolorBrushPlugin, AirbrushPlugin, SprayBrushPlugin, RibbonBrushPlugin, GlowBrushPlugin
} from './brushes/BasicBrushes';

export class BrushManager {
  private eventBus: EventBus;
  private plugins: Map<string, BrushPlugin> = new Map();
  private activeBrushId: string = 'pencil';
  
  private color: string = '#6366f1';
  private size: number = 8;
  private opacity: number = 1;
  private currentPhysics: BrushPhysics;

  // Advanced Settings
  private velocitySensitivity: number = 0.5;
  private strokeStabilization: number = 0.5;
  private pressureSimulation: number = 0.5;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    
    // Register Default Brushes
    this.registerPlugin(PencilBrushPlugin);
    this.registerPlugin(ChalkBrushPlugin);
    this.registerPlugin(PixelBrushPlugin);
    this.registerPlugin(InkBrushPlugin);
    this.registerPlugin(CalligraphyBrushPlugin);
    this.registerPlugin(WatercolorBrushPlugin);
    this.registerPlugin(MarkerBrushPlugin);
    this.registerPlugin(AirbrushPlugin);
    this.registerPlugin(SprayBrushPlugin);
    this.registerPlugin(NeonBrushPlugin);
    this.registerPlugin(GlowBrushPlugin);
    this.registerPlugin(RibbonBrushPlugin);

    const activePlugin = this.plugins.get(this.activeBrushId)!;
    this.currentPhysics = { ...activePlugin.defaultPhysics } as BrushPhysics;
  }

  public registerPlugin(plugin: BrushPlugin) {
    this.plugins.set(plugin.id, plugin);
  }

  public getPlugins(): BrushPlugin[] {
    return Array.from(this.plugins.values());
  }

  public setActiveBrush(id: string) {
    if (this.plugins.has(id)) {
      this.activeBrushId = id;
      const plugin = this.plugins.get(id)!;
      this.currentPhysics = { ...plugin.defaultPhysics } as BrushPhysics;
      this.emitChange();
    }
  }

  public getActivePlugin(): BrushPlugin {
    return this.plugins.get(this.activeBrushId)!;
  }

  public setColor(color: string) {
    this.color = color;
    this.emitChange();
  }

  public setSize(size: number) {
    this.size = Math.max(1, Math.min(100, size));
    this.emitChange();
  }

  public setOpacity(opacity: number) {
    this.opacity = Math.max(0, Math.min(1, opacity));
    this.emitChange();
  }

  public updatePhysics(physicsUpdate: Partial<BrushPhysics>) {
    this.currentPhysics = { ...this.currentPhysics, ...physicsUpdate };
    this.emitChange();
  }

  public updateAdvancedSettings(velocity: number, stabilization: number, pressure: number) {
    this.velocitySensitivity = velocity;
    this.strokeStabilization = stabilization;
    this.pressureSimulation = pressure;
    this.emitChange();
  }

  public getConfig() {
    return {
      activeBrushId: this.activeBrushId,
      color: this.color,
      size: this.size,
      opacity: this.opacity,
      physics: this.currentPhysics,
      velocitySensitivity: this.velocitySensitivity,
      strokeStabilization: this.strokeStabilization,
      pressureSimulation: this.pressureSimulation
    };
  }

  private emitChange() {
    this.eventBus.emit('brush:changed', this.getConfig());
  }
}
