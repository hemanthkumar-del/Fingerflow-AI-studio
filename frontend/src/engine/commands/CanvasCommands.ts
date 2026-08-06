import { Command } from '../Command';
import { fabric } from 'fabric';
import { LayerManager } from '../LayerManager';

export class AddPathCommand implements Command {
  private objects: fabric.Object[];

  constructor(
    private canvas: fabric.Canvas, 
    pathOrPaths: fabric.Object | fabric.Object[], 
    private layers: LayerManager
  ) {
    this.objects = Array.isArray(pathOrPaths) ? pathOrPaths : [pathOrPaths];
  }

  execute() {
    this.objects.forEach(obj => this.canvas.add(obj));
    this.layers.renderLayers();
  }

  undo() {
    this.objects.forEach(obj => this.canvas.remove(obj));
    this.canvas.requestRenderAll();
  }
}

export class ClearCanvasCommand implements Command {
  private previousState: any;

  constructor(private canvas: fabric.Canvas) {
    this.previousState = this.canvas.toJSON();
  }

  execute() {
    this.canvas.clear();
    this.canvas.setBackgroundColor('#090d16', () => this.canvas.renderAll());
  }

  undo() {
    this.canvas.loadFromJSON(this.previousState, () => {
      this.canvas.renderAll();
    });
  }
}
