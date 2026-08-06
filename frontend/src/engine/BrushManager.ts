import { EventBus } from './EventBus';

export class BrushManager {
  private eventBus: EventBus;
  private color: string = '#6366f1';
  private size: number = 8;
  private opacity: number = 1;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  public setColor(color: string) {
    this.color = color;
    this.eventBus.emit('brush:changed', this.getConfig());
  }

  public setSize(size: number) {
    this.size = Math.max(2, Math.min(50, size));
    this.eventBus.emit('brush:changed', this.getConfig());
  }

  public setOpacity(opacity: number) {
    this.opacity = opacity;
    this.eventBus.emit('brush:changed', this.getConfig());
  }

  public getConfig() {
    return {
      color: this.color,
      size: this.size,
      opacity: this.opacity
    };
  }
}
