import { Command } from '../Command';
import { fabric } from 'fabric';

export class AddPathCommand implements Command {
  constructor(private canvas: fabric.Canvas, private path: fabric.Path) {}

  execute() {
    this.canvas.add(this.path);
    this.canvas.renderAll();
  }

  undo() {
    this.canvas.remove(this.path);
    this.canvas.renderAll();
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
