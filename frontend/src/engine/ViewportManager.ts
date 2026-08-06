import { fabric } from 'fabric';
import { EventBus } from './EventBus';

export class ViewportManager {
  private canvas: fabric.Canvas;
  private eventBus: EventBus;

  // Viewport State
  private currentZoom: number = 1;
  private minZoom: number = 0.1;
  private maxZoom: number = 5.0;
  private panX: number = 0;
  private panY: number = 0;

  constructor(canvas: fabric.Canvas, eventBus: EventBus) {
    this.canvas = canvas;
    this.eventBus = eventBus;
    this.bindEvents();
  }

  private bindEvents() {
    this.canvas.on('mouse:wheel', (opt) => {
      const evt = opt.e as WheelEvent;
      if (evt.ctrlKey) {
        // Zoom
        let zoom = this.canvas.getZoom();
        zoom *= 0.999 ** evt.deltaY;
        if (zoom > this.maxZoom) zoom = this.maxZoom;
        if (zoom < this.minZoom) zoom = this.minZoom;
        
        this.canvas.zoomToPoint({ x: evt.offsetX, y: evt.offsetY }, zoom);
        this.updateStateFromCanvas();
        opt.e.preventDefault();
        opt.e.stopPropagation();
      } else {
        // Pan
        const vpt = this.canvas.viewportTransform;
        if (vpt) {
          vpt[4] -= evt.deltaX;
          vpt[5] -= evt.deltaY;
          this.canvas.requestRenderAll();
          this.updateStateFromCanvas();
        }
      }
    });
  }

  public zoomIn() {
    this.setZoom(this.currentZoom * 1.2);
  }

  public zoomOut() {
    this.setZoom(this.currentZoom / 1.2);
  }

  public resetZoom() {
    this.setZoom(1);
    this.panTo(0, 0);
  }

  public setZoom(zoom: number) {
    let z = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
    const center = this.canvas.getCenter();
    this.canvas.zoomToPoint({ x: center.left, y: center.top }, z);
    this.updateStateFromCanvas();
  }

  public panTo(x: number, y: number) {
    const vpt = this.canvas.viewportTransform;
    if (vpt) {
      vpt[4] = x;
      vpt[5] = y;
      this.canvas.requestRenderAll();
      this.updateStateFromCanvas();
    }
  }

  public panBy(dx: number, dy: number) {
    const vpt = this.canvas.viewportTransform;
    if (vpt) {
      vpt[4] += dx;
      vpt[5] += dy;
      this.canvas.requestRenderAll();
      this.updateStateFromCanvas();
    }
  }

  private updateStateFromCanvas() {
    const vpt = this.canvas.viewportTransform;
    if (vpt) {
      this.currentZoom = vpt[0];
      this.panX = vpt[4];
      this.panY = vpt[5];
      this.eventBus.emit('viewport:changed', {
        zoom: this.currentZoom,
        panX: this.panX,
        panY: this.panY
      });
    }
  }

  public screenToWorld(x: number, y: number): { x: number, y: number } {
    const vpt = this.canvas.viewportTransform;
    if (!vpt) return { x, y };
    
    // Reverse the affine transform: x = (X - tx) / scale
    return {
      x: (x - vpt[4]) / vpt[0],
      y: (y - vpt[5]) / vpt[3]
    };
  }

  public worldToScreen(x: number, y: number): { x: number, y: number } {
    const vpt = this.canvas.viewportTransform;
    if (!vpt) return { x, y };
    
    // Apply affine transform
    return {
      x: x * vpt[0] + vpt[4],
      y: y * vpt[3] + vpt[5]
    };
  }

  public getState() {
    return {
      zoom: this.currentZoom,
      panX: this.panX,
      panY: this.panY
    };
  }
}
