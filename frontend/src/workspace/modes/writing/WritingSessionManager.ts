import { fabric } from 'fabric';
import { CanvasManager } from '../../../engine/CanvasManager';

export class WritingSessionManager {
  private engine: CanvasManager;
  private sessionObjects: fabric.Object[] = [];

  constructor(engine: CanvasManager) {
    this.engine = engine;
  }

  public registerObject(obj: fabric.Object) {
    // Tag object so we know it belongs to this session
    (obj as any).set('writingSession', true);
    this.sessionObjects.push(obj);
  }

  public onObjectAdded(obj: fabric.Object) {
    if ((obj as any).get('writingSession')) {
      if (!this.sessionObjects.includes(obj)) {
         this.sessionObjects.push(obj);
      }
    }
  }

  public onObjectRemoved(obj: fabric.Object) {
    this.sessionObjects = this.sessionObjects.filter(o => o !== obj);
  }

  public discardSession() {
    const canvas = this.engine.getCanvas();
    this.sessionObjects.forEach(obj => {
      canvas.remove(obj);
    });
    this.sessionObjects = [];
    canvas.renderAll();
  }

  public commitSession() {
    // Keep objects, but remove the tag so they are just regular canvas objects now
    this.sessionObjects.forEach(obj => {
      (obj as any).set('writingSession', false);
    });
    this.sessionObjects = [];
  }
  
  public getSessionObjects(): fabric.Object[] {
      return [...this.sessionObjects];
  }
}

