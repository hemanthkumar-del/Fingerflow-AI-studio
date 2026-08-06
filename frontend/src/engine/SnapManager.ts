import { fabric } from 'fabric';
import { LayerManager } from './LayerManager';

export interface SnapProvider {
  snap(target: fabric.Object, canvas: fabric.Canvas, threshold: number): { x?: number, y?: number };
}

export class ActiveLayerSnapProvider implements SnapProvider {
  constructor(private layerManager: LayerManager) {}

  snap(target: fabric.Object, canvas: fabric.Canvas, threshold: number): { x?: number, y?: number } {
    const activeLayerId = this.layerManager.getActiveLayerId();
    if (!activeLayerId) return {};

    const activeLayer = this.layerManager.getActiveLayer();
    if (!activeLayer || !activeLayer.visible || activeLayer.locked) return {};

    // Get all other objects on the active layer that are visible and not locked
    const snapCandidates = canvas.getObjects().filter((obj: any) => 
      obj !== target && 
      obj.layerId === activeLayerId &&
      obj.visible && 
      !obj.locked
    );

    let snapX: number | undefined = undefined;
    let snapY: number | undefined = undefined;

    const targetCenter = target.getCenterPoint();
    let minDistX = threshold + 1;
    let minDistY = threshold + 1;

    for (const obj of snapCandidates) {
      const objCenter = obj.getCenterPoint();

      // Check X snap
      const distX = Math.abs(targetCenter.x - objCenter.x);
      if (distX < threshold && distX < minDistX) {
        minDistX = distX;
        snapX = objCenter.x;
      }

      // Check Y snap
      const distY = Math.abs(targetCenter.y - objCenter.y);
      if (distY < threshold && distY < minDistY) {
        minDistY = distY;
        snapY = objCenter.y;
      }
    }

    return { x: snapX, y: snapY };
  }
}

export class SnapManager {
  private providers: SnapProvider[] = [];
  private threshold: number = 10; // pixels

  constructor(private canvas: fabric.Canvas) {
    this.canvas.on('object:moving', this.handleObjectMoving);
  }

  public addProvider(provider: SnapProvider) {
    this.providers.push(provider);
  }

  private handleObjectMoving = (e: fabric.IEvent) => {
    const target = e.target;
    if (!target) return;

    let finalSnapX: number | undefined = undefined;
    let finalSnapY: number | undefined = undefined;

    for (const provider of this.providers) {
      const { x, y } = provider.snap(target, this.canvas, this.threshold);
      if (x !== undefined && finalSnapX === undefined) finalSnapX = x;
      if (y !== undefined && finalSnapY === undefined) finalSnapY = y;
    }

    // Apply snap by adjusting left/top based on center point diff
    if (finalSnapX !== undefined || finalSnapY !== undefined) {
      const center = target.getCenterPoint();
      let dx = 0;
      let dy = 0;

      if (finalSnapX !== undefined) dx = finalSnapX - center.x;
      if (finalSnapY !== undefined) dy = finalSnapY - center.y;

      target.set({
        left: (target.left || 0) + dx,
        top: (target.top || 0) + dy
      });
      target.setCoords();
      
      // We could also draw smart hover highlight snap lines here...
      // For now, Fabric handles the position update.
    }
  }
}
