import { fabric } from 'fabric';
import { EventBus } from './EventBus';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
}

export class LayerManager {
  private canvas: fabric.Canvas;
  private eventBus: EventBus;
  private layers: Layer[] = [];
  private activeLayerId: string | null = null;

  constructor(canvas: fabric.Canvas, eventBus: EventBus) {
    this.canvas = canvas;
    this.eventBus = eventBus;
    this.initializeDefaultLayer();
  }

  private initializeDefaultLayer() {
    // In Fabric, without complex grouping, the whole canvas acts as one layer.
    // In full implementation, this will manage fabric.Group for each layer.
    const defaultLayer: Layer = {
      id: 'layer-1',
      name: 'Layer 1',
      visible: true,
      locked: false,
      opacity: 1
    };
    this.layers = [defaultLayer];
    this.activeLayerId = defaultLayer.id;
    this.notifyState();
  }

  public getActiveLayerId(): string | null {
    return this.activeLayerId;
  }

  // Future: addLayer, removeLayer, reorderLayer, toggleVisibility...

  private notifyState() {
    this.eventBus.emit('layers:changed', {
      layers: this.layers,
      activeLayerId: this.activeLayerId
    });
  }
}
