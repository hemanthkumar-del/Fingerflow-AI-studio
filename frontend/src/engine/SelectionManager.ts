import { fabric } from 'fabric';
import { EventBus } from './EventBus';

export type SelectionMode = 'select' | 'move' | 'resize' | 'rotate';

export class SelectionManager {
  private canvas: fabric.Canvas;
  private eventBus: EventBus;
  private activeObjects: fabric.Object[] = [];
  private mode: SelectionMode = 'select';

  constructor(canvas: fabric.Canvas, eventBus: EventBus) {
    this.canvas = canvas;
    this.eventBus = eventBus;
    this.initListeners();
  }

  public setMode(mode: SelectionMode) {
    this.mode = mode;
    this.eventBus.emit('selection:mode_changed', this.mode);
  }

  public getMode(): SelectionMode {
    return this.mode;
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

  // --- Alignment Tools --- //

  public alignActiveObjects(alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') {
    const activeSelection = this.canvas.getActiveObject();
    if (!activeSelection) return;

    if (activeSelection.type === 'activeSelection') {
      const group = activeSelection as fabric.Group;
      const groupRect = group.getBoundingRect();
      const objects = group.getObjects();

      objects.forEach(obj => {
        const objRect = obj.getBoundingRect();
        switch (alignment) {
          case 'left':
            obj.set({ left: -(groupRect.width / 2) + (obj.width! * obj.scaleX!) / 2 });
            break;
          case 'center':
            obj.set({ left: 0 });
            break;
          case 'right':
            obj.set({ left: (groupRect.width / 2) - (obj.width! * obj.scaleX!) / 2 });
            break;
          case 'top':
            obj.set({ top: -(groupRect.height / 2) + (obj.height! * obj.scaleY!) / 2 });
            break;
          case 'middle':
            obj.set({ top: 0 });
            break;
          case 'bottom':
            obj.set({ top: (groupRect.height / 2) - (obj.height! * obj.scaleY!) / 2 });
            break;
        }
        obj.setCoords();
      });
    } else {
      // Single object relative to canvas
      switch (alignment) {
        case 'center':
          activeSelection.centerH();
          break;
        case 'middle':
          activeSelection.centerV();
          break;
      }
    }
    
    this.canvas.requestRenderAll();
    // A command should ideally be pushed to history here by the caller
  }
}
