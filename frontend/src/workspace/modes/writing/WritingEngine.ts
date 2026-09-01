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
    // Use requestRenderAll (async/batched) instead of renderAll (synchronous)
    (this.canvas as any).requestRenderAll?.() ?? this.canvas.renderAll();
  }
  
  undo(): void {
    this.objects.forEach(obj => this.canvas.add(obj));
    (this.canvas as any).requestRenderAll?.() ?? this.canvas.renderAll();
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

  // Saved pre-writing brush config so we only swap once per stroke, not every frame
  private savedBrushColor: string | null = null;
  private savedBrushSize: number | null = null;

  // Erase throttle: limit to max ~20fps to avoid O(n) object scan every camera frame
  private lastEraseTime: number = 0;
  private static readonly ERASE_THROTTLE_MS = 50; // 20fps
  
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
    // Restore brush if we're mid-stroke
    this._restoreBrush();
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

  /** Save the current brush config and apply writing ink settings. Called once on stroke begin. */
  private _applyWritingBrush() {
    if (this.savedBrushColor !== null) return; // Already applied
    const config = this.engine.brush.getConfig();
    this.savedBrushColor = config.color;
    this.savedBrushSize = config.size;
    this.engine.brush.setColor(this.inkColor);
    this.engine.brush.setSize(this.inkSize);
  }

  /** Restore the pre-writing brush config. Called once on stroke end. */
  private _restoreBrush() {
    if (this.savedBrushColor === null) return;
    this.engine.brush.setColor(this.savedBrushColor);
    this.engine.brush.setSize(this.savedBrushSize ?? this.inkSize);
    this.savedBrushColor = null;
    this.savedBrushSize = null;
  }

  public beginStroke(x: number, y: number, timestamp: number) {
    this.isWriting = true;
    this.stabilizer.reset();
    this.currentStrokeRawPoints = [];

    // Apply writing ink ONCE at stroke begin (not every frame)
    this._applyWritingBrush();
    
    const pt = this.stabilizer.filter(x, y, timestamp);
    this.engine.beginStroke();
    this.engine.updateStroke(pt.x, pt.y, timestamp);
    this.currentStrokeRawPoints.push({ x: pt.x, y: pt.y, t: timestamp });
  }

  public updateStroke(x: number, y: number, timestamp: number) {
    if (!this.isWriting) return;
    const pt = this.stabilizer.filter(x, y, timestamp);
    // Brush is already configured for writing — no per-frame swap needed
    this.engine.updateStroke(pt.x, pt.y, timestamp);
    this.currentStrokeRawPoints.push({ x: pt.x, y: pt.y, t: timestamp });
  }

  public endStroke() {
    if (!this.isWriting) return;
    this.engine.endStroke();
    this.isWriting = false;
    
    // Restore original brush settings ONCE at stroke end
    this._restoreBrush();
    
    // Feed completed stroke into recognition pipeline
    if (this.currentStrokeRawPoints.length >= 2) {
      this.strokeSession.onStrokeComplete([...this.currentStrokeRawPoints]);
    }
    this.currentStrokeRawPoints = [];
  }

  public erase(screenX: number, screenY: number) {
    this.isErasing = true;
    
    // Throttle to ~20fps to avoid O(n) object scan every camera frame
    const now = performance.now();
    if (now - this.lastEraseTime < WritingEngine.ERASE_THROTTLE_MS) return;
    this.lastEraseTime = now;
    
    const canvas = this.engine.getCanvas();
    const worldPt = this.engine.viewport.screenToWorld(screenX, screenY);
    
    const objectsToErase: fabric.Object[] = [];
    
    canvas.getObjects().forEach(obj => {
      const bound = obj.getBoundingRect();
      const centerX = bound.left + bound.width / 2;
      const centerY = bound.top + bound.height / 2;
      
      const dx = centerX - worldPt.x;
      const dy = centerY - worldPt.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // eraserRadius is in screen space, roughly scale to world
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
