import { CanvasManager } from '../../../engine/CanvasManager';
import { WritingStabilizer } from './WritingStabilizer';
import { WritingSessionManager } from './WritingSessionManager';
import { StrokeSession } from '../../../recognition/StrokeSession';
import type { RecognitionResult } from '../../../recognition/RecognitionResult';
import type { Stroke } from '../../../recognition/Stroke';
import { fabric } from 'fabric';
import { Command } from '../../../engine/Command';

export class EraseObjectsCommand implements Command {
  constructor(private canvas: fabric.Canvas, private objects: fabric.Object[]) {}
  
  execute(): void {
    this.objects.forEach(obj => this.canvas.remove(obj));
    this.canvas.renderAll();
  }
  
  undo(): void {
    this.objects.forEach(obj => this.canvas.add(obj));
    this.canvas.renderAll();
  }
}

/** Points accumulated during the current stroke (for recognition) */
type RawPoint = { x: number; y: number; t?: number };

export class WritingEngine {
  private engine: CanvasManager;
  private stabilizer: WritingStabilizer;
  private sessionManager: WritingSessionManager;
  private strokeSession: StrokeSession;
  
  public isWriting = false;
  public isErasing = false;
  
  public inkColor: string = '#000000';
  public inkSize: number = 4;
  public eraserRadius: number = 60;
  
  // Raw points collected during the current stroke (for recognition pipeline)
  private currentStrokeRawPoints: RawPoint[] = [];
  
  // Recognition result callback (set by WritingUI to show overlay)
  public onRecognition: ((result: RecognitionResult, rawStrokes: Stroke[]) => void) | null = null;
  
  constructor(engine: CanvasManager) {
    this.engine = engine;
    this.stabilizer = new WritingStabilizer();
    this.sessionManager = new WritingSessionManager(engine);
    
    // Initialize recognition pipeline
    this.strokeSession = new StrokeSession((result, rawStrokes) => {
      if (this.onRecognition) {
        this.onRecognition(result, rawStrokes);
      }
    });
    
    // Intercept object additions to tag them
    const canvas = this.engine.getCanvas();
    canvas.on('object:added', this.handleObjectAdded);
    canvas.on('object:removed', this.handleObjectRemoved);
  }
  
  public dispose() {
    this.strokeSession.flush();
    this.strokeSession.reset();
    const canvas = this.engine.getCanvas();
    canvas.off('object:added', this.handleObjectAdded);
    canvas.off('object:removed', this.handleObjectRemoved);
  }

  private handleObjectAdded = (e: fabric.IEvent) => {
    if (e.target && this.isWriting) {
      (e.target as any).set('writingSession', true);
      this.sessionManager.registerObject(e.target);
    }
  }

  private handleObjectRemoved = (e: fabric.IEvent) => {
    if (e.target) {
      this.sessionManager.onObjectRemoved(e.target);
    }
  }

  public getSessionManager() {
    return this.sessionManager;
  }
  
  public getStrokeSession() {
    return this.strokeSession;
  }

  public setSmartRecognition(enabled: boolean) {
    this.strokeSession.setRecognitionEnabled(enabled);
  }
  
  public isSmartRecognitionEnabled(): boolean {
    return this.strokeSession.isRecognitionEnabled();
  }

  public beginStroke(x: number, y: number, timestamp: number) {
    this.isWriting = true;
    this.stabilizer.reset();
    this.currentStrokeRawPoints = [];
    const pt = this.stabilizer.filter(x, y, timestamp);
    
    // Temporarily set brush color and size on engine
    const oldConfig = this.engine.brush.getConfig();
    const oldColor = oldConfig.color;
    const oldSize = oldConfig.size;
    this.engine.brush.setColor(this.inkColor);
    this.engine.brush.setSize(this.inkSize);
    
    this.engine.beginStroke();
    this.engine.updateStroke(pt.x, pt.y, timestamp);
    this.currentStrokeRawPoints.push({ x: pt.x, y: pt.y, t: timestamp });
    
    this.engine.brush.setColor(oldColor);
    this.engine.brush.setSize(oldSize);
  }

  public updateStroke(x: number, y: number, timestamp: number) {
    if (!this.isWriting) return;
    const pt = this.stabilizer.filter(x, y, timestamp);
    
    // Temporarily set brush color and size on engine
    const oldConfig = this.engine.brush.getConfig();
    const oldColor = oldConfig.color;
    const oldSize = oldConfig.size;
    this.engine.brush.setColor(this.inkColor);
    this.engine.brush.setSize(this.inkSize);

    this.engine.updateStroke(pt.x, pt.y, timestamp);
    this.currentStrokeRawPoints.push({ x: pt.x, y: pt.y, t: timestamp });

    this.engine.brush.setColor(oldColor);
    this.engine.brush.setSize(oldSize);
  }

  public endStroke() {
    if (!this.isWriting) return;
    this.engine.endStroke();
    this.isWriting = false;
    
    // Feed completed stroke into recognition pipeline
    if (this.currentStrokeRawPoints.length >= 2) {
      this.strokeSession.onStrokeComplete([...this.currentStrokeRawPoints]);
    }
    this.currentStrokeRawPoints = [];
  }

  public erase(screenX: number, screenY: number) {
    this.isErasing = true;
    const canvas = this.engine.getCanvas();
    const worldPt = this.engine.viewport.screenToWorld(screenX, screenY);
    
    const objectsToErase: fabric.Object[] = [];
    
    canvas.getObjects().forEach(obj => {
      // Basic bounding box center check
      const bound = obj.getBoundingRect();
      const centerX = bound.left + bound.width / 2;
      const centerY = bound.top + bound.height / 2;
      
      const dx = centerX - worldPt.x;
      const dy = centerY - worldPt.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // eraserRadius is in screen space, need to roughly scale to world
      const worldEraserRadius = this.eraserRadius / this.engine.viewport.getState().zoom;
      
      if (dist < worldEraserRadius + Math.max(bound.width, bound.height) / 2) {
          objectsToErase.push(obj);
      }
    });
    
    if (objectsToErase.length > 0) {
      const cmd = new EraseObjectsCommand(canvas, objectsToErase);
      this.engine.history.execute(cmd);
    }
  }

  public stopErasing() {
    this.isErasing = false;
  }
}
