import { Command } from '../Command';
import { fabric } from 'fabric';

export interface TransformState {
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
  angle: number;
}

export class TransformCommand implements Command {
  constructor(
    private target: fabric.Object,
    private before: TransformState,
    private after: TransformState,
    private canvas: fabric.Canvas
  ) {}

  execute() {
    this.target.set({
      left: this.after.left,
      top: this.after.top,
      scaleX: this.after.scaleX,
      scaleY: this.after.scaleY,
      angle: this.after.angle
    });
    this.target.setCoords();
    this.canvas.requestRenderAll();
  }

  undo() {
    this.target.set({
      left: this.before.left,
      top: this.before.top,
      scaleX: this.before.scaleX,
      scaleY: this.before.scaleY,
      angle: this.before.angle
    });
    this.target.setCoords();
    this.canvas.requestRenderAll();
  }
}

export class DeleteObjectCommand implements Command {
  constructor(private canvas: fabric.Canvas, private objects: fabric.Object[]) {}

  execute() {
    this.canvas.discardActiveObject();
    this.objects.forEach(obj => this.canvas.remove(obj));
    this.canvas.requestRenderAll();
  }

  undo() {
    this.objects.forEach(obj => {
      this.canvas.add(obj);
      // We don't need to manually re-sort here if the LayerManager's renderLayers is called.
      // But we don't have direct access to LayerManager here. We'll emit an event or assume 
      // the caller will call renderLayers() if needed. Actually we can just add it back.
    });
    // Reselect
    if (this.objects.length === 1) {
      this.canvas.setActiveObject(this.objects[0]);
    } else {
      const group = new fabric.ActiveSelection(this.objects, { canvas: this.canvas });
      this.canvas.setActiveObject(group);
    }
    this.canvas.requestRenderAll();
  }
}
