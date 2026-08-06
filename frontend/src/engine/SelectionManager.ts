import { fabric } from 'fabric';
import { EventBus } from './EventBus';

export class SelectionManager {
  private canvas: fabric.Canvas;
  private eventBus: EventBus;
  private activeObjects: fabric.Object[] = [];

  constructor(canvas: fabric.Canvas, eventBus: EventBus) {
    this.canvas = canvas;
    this.eventBus = eventBus;
    this.initListeners();
  }

  private initListeners() {
    this.canvas.on('selection:created', this.handleSelection);
    this.canvas.on('selection:updated', this.handleSelection);
    this.canvas.on('selection:cleared', this.handleSelectionCleared);
  }

  private handleSelection = (e: fabric.IEvent) => {
    this.activeObjects = this.canvas.getActiveObjects();
    this.eventBus.emit('selection:changed', this.activeObjects);
  };

  private handleSelectionCleared = () => {
    this.activeObjects = [];
    this.eventBus.emit('selection:changed', this.activeObjects);
  };

  public getActiveObjects(): fabric.Object[] {
    return this.activeObjects;
  }

  public clearSelection() {
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
  }
}
