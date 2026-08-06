import { fabric } from 'fabric';
import { EventBus } from './EventBus';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  thumbnail: string | null;
  // Future compatibility
  type?: 'vector' | 'group' | 'ai' | 'reference';
  blendMode?: string;
  aiGenerated?: boolean;
}

export class LayerManager {
  private canvas: fabric.Canvas;
  private eventBus: EventBus;
  private layers: Layer[] = [];
  private activeLayerId: string | null = null;
  private thumbnailCache: Record<string, string> = {};

  constructor(canvas: fabric.Canvas, eventBus: EventBus) {
    this.canvas = canvas;
    this.eventBus = eventBus;
    this.initializeDefaultLayer();
  }

  public initializeDefaultLayer() {
    this.layers = [{
      id: `layer-${Date.now()}`,
      name: 'Layer 1',
      visible: true,
      locked: false,
      opacity: 1,
      thumbnail: null,
      type: 'vector'
    }];
    this.activeLayerId = this.layers[0].id;
    this.notifyState();
  }

  // --- CRUD Operations --- //

  public getLayers(): Layer[] {
    return this.layers;
  }

  public getActiveLayerId(): string | null {
    return this.activeLayerId;
  }

  public setActiveLayer(id: string) {
    if (this.layers.find(l => l.id === id)) {
      this.activeLayerId = id;
      this.canvas.discardActiveObject(); // Deselect objects when switching layers
      this.canvas.requestRenderAll();
      this.notifyState();
    }
  }

  public getActiveLayer(): Layer | null {
    return this.layers.find(l => l.id === this.activeLayerId) || null;
  }

  public createLayer(name?: string, atIndex?: number): Layer {
    const newLayer: Layer = {
      id: `layer-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: name || `Layer ${this.layers.length + 1}`,
      visible: true,
      locked: false,
      opacity: 1,
      thumbnail: null,
      type: 'vector'
    };

    if (atIndex !== undefined) {
      this.layers.splice(atIndex, 0, newLayer);
    } else {
      this.layers.unshift(newLayer); // Add to top of stack
    }

    this.activeLayerId = newLayer.id;
    this.notifyState();
    return newLayer;
  }

  public deleteLayer(id: string) {
    if (this.layers.length <= 1) return; // Must have at least one layer

    // 1. Remove all objects belonging to this layer
    const objectsToRemove = this.canvas.getObjects().filter((obj: any) => obj.layerId === id);
    objectsToRemove.forEach(obj => this.canvas.remove(obj));

    // 2. Remove layer definition
    this.layers = this.layers.filter(l => l.id !== id);
    
    if (this.activeLayerId === id) {
      this.activeLayerId = this.layers[0].id;
    }

    this.renderLayers(); // Force Z-index update and render
    this.notifyState();
  }

  public duplicateLayer(id: string) {
    const sourceLayer = this.layers.find(l => l.id === id);
    if (!sourceLayer) return;

    const sourceIndex = this.layers.findIndex(l => l.id === id);
    const newLayer = this.createLayer(`${sourceLayer.name} Copy`, sourceIndex); // Insert right above

    // Clone all objects
    const objectsToClone = this.canvas.getObjects().filter((obj: any) => obj.layerId === id);
    objectsToClone.forEach(obj => {
      obj.clone((cloned: fabric.Object) => {
        (cloned as any).id = `obj-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        (cloned as any).layerId = newLayer.id;
        this.canvas.add(cloned);
      });
    });

    this.renderLayers();
  }

  public renameLayer(id: string, name: string) {
    const layer = this.layers.find(l => l.id === id);
    if (layer) {
      layer.name = name;
      this.notifyState();
    }
  }

  // --- Properties --- //

  public setLayerVisibility(id: string, visible: boolean) {
    const layer = this.layers.find(l => l.id === id);
    if (!layer) return;
    
    layer.visible = visible;
    const objects = this.canvas.getObjects().filter((obj: any) => obj.layerId === id);
    objects.forEach(obj => {
      obj.visible = visible;
      // If hiding, also deselect it
      if (!visible && this.canvas.getActiveObject() === obj) {
        this.canvas.discardActiveObject();
      }
    });
    
    this.canvas.requestRenderAll();
    this.notifyState();
  }

  public setLayerLock(id: string, locked: boolean) {
    const layer = this.layers.find(l => l.id === id);
    if (!layer) return;

    layer.locked = locked;
    const objects = this.canvas.getObjects().filter((obj: any) => obj.layerId === id);
    objects.forEach(obj => {
      (obj as any).locked = locked;
      obj.selectable = !locked;
      obj.evented = !locked;
      if (locked && this.canvas.getActiveObject() === obj) {
        this.canvas.discardActiveObject();
      }
    });

    this.canvas.requestRenderAll();
    this.notifyState();
  }

  public setLayerOpacity(id: string, opacity: number) {
    const layer = this.layers.find(l => l.id === id);
    if (!layer) return;

    layer.opacity = Math.max(0, Math.min(1, opacity));
    const objects = this.canvas.getObjects().filter((obj: any) => obj.layerId === id);
    objects.forEach((obj: any) => {
      // Fabric doesn't have a multiplier opacity by default.
      // We need to store original opacity on object, then multiply by layer opacity.
      if (obj.originalOpacity === undefined) {
        obj.originalOpacity = obj.opacity;
      }
      obj.set('opacity', obj.originalOpacity * layer.opacity);
    });

    this.canvas.requestRenderAll();
    this.notifyState();
  }

  public reorderLayers(startIndex: number, endIndex: number) {
    const result = Array.from(this.layers);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    this.layers = result;
    this.renderLayers();
    this.notifyState();
  }

  public setLayersState(layers: Layer[], activeId: string) {
    this.layers = layers;
    this.activeLayerId = activeId;
    this.renderLayers();
    this.notifyState();
  }

  // --- Rendering & Z-Index Engine --- //

  public renderLayers() {
    // Fabric.js renders objects based on their order in the getObjects() array (0 is bottom).
    // Our this.layers array has index 0 as the TOP layer visually.
    // We need to sort canvas objects so that objects belonging to layer[N-1] are rendered before layer[0].
    
    const layerOrderMap = new Map<string, number>();
    // Reverse the order so top layer gets highest number
    const reversedLayers = [...this.layers].reverse();
    reversedLayers.forEach((l, idx) => layerOrderMap.set(l.id, idx));

    const objects = this.canvas.getObjects();
    
    // Sort objects by their layer's assigned z-index
    objects.sort((a: any, b: any) => {
      const zA = layerOrderMap.get(a.layerId) || 0;
      const zB = layerOrderMap.get(b.layerId) || 0;
      // If same layer, preserve their original relative z-index (draw order)
      if (zA === zB) {
        return objects.indexOf(a) - objects.indexOf(b);
      }
      return zA - zB;
    });

    // Reconstruct canvas object array
    this.canvas._objects = objects;
    this.canvas.requestRenderAll();
  }

  // --- Thumbnails --- //

  public async generateThumbnails() {
    // Generate thumbnails asynchronously to prevent blocking the UI
    setTimeout(() => {
      this.layers.forEach(layer => {
        // Temporarily hide all other layers to capture this one
        const originalVisibilities = new Map<fabric.Object, boolean>();
        
        this.canvas.getObjects().forEach((obj: any) => {
          originalVisibilities.set(obj, obj.visible);
          obj.visible = obj.layerId === layer.id && layer.visible;
        });

        const dataUrl = this.canvas.toDataURL({
          format: 'png',
          quality: 0.1,
          multiplier: 0.1 // Tiny thumbnail
        });
        
        layer.thumbnail = dataUrl;

        // Restore visibilities
        this.canvas.getObjects().forEach((obj: any) => {
          obj.visible = originalVisibilities.get(obj);
        });
      });
      this.notifyState();
    }, 0);
  }

  private notifyState() {
    this.eventBus.emit('layers:changed', {
      layers: [...this.layers],
      activeLayerId: this.activeLayerId
    });
  }
}
