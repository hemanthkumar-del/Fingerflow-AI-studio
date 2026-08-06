import { fabric } from 'fabric';
import { EventBus } from './EventBus';
import { HistoryManager } from './HistoryManager';
import { BrushManager } from './BrushManager';
import { ToolManager } from './ToolManager';
import { LayerManager } from './LayerManager';
import { SelectionManager } from './SelectionManager';
import { AddPathCommand, ClearCanvasCommand } from './commands/CanvasCommands';
import { TransformCommand, TransformState } from './commands/TransformCommands';
import { StrokeSmoother, Point } from '../services/strokeSmoother';
import { SnapManager, ActiveLayerSnapProvider } from './SnapManager';

export interface EngineConfig {
  width: number;
  height: number;
  backgroundColor: string;
}

export class CanvasManager {
  private canvas: fabric.Canvas;
  public eventBus: EventBus;
  public history: HistoryManager;
  public brush: BrushManager;
  public tool: ToolManager;
  public layers: LayerManager;
  public selection: SelectionManager;
  public snapManager: SnapManager;

  // Temporary path handling for gestures
  private currentPoints: Point[] = [];
  private activeTempPaths: fabric.Object[] = [];
  private strokeSmoother: StrokeSmoother;

  constructor(canvasElement: HTMLCanvasElement, config: EngineConfig) {
    this.canvas = new fabric.Canvas(canvasElement, {
      width: config.width,
      height: config.height,
      backgroundColor: config.backgroundColor,
      isDrawingMode: false,
      selection: false,
    });

    this.eventBus = new EventBus();
    this.history = new HistoryManager(this.eventBus);
    this.brush = new BrushManager(this.eventBus);
    this.tool = new ToolManager(this.eventBus);
    this.layers = new LayerManager(this.canvas, this.eventBus);
    this.selection = new SelectionManager(this.canvas, this.eventBus);
    this.strokeSmoother = new StrokeSmoother();
    this.snapManager = new SnapManager(this.canvas);
    this.snapManager.addProvider(new ActiveLayerSnapProvider(this.layers));

    this.bindEvents();
  }

  private transformStateBefore: TransformState | null = null;

  private bindEvents() {
    window.addEventListener('resize', this.handleResize);
    
    // Listen to tool changes to configure Fabric
    this.eventBus.on('tool:changed', (tool) => {
      const isSelect = tool === 'selection';
      this.canvas.selection = isSelect;
      this.canvas.getObjects().forEach(obj => {
        // Only make selectable if on active, unlocked layer
        const layer = this.layers.getLayers().find(l => l.id === (obj as any).layerId);
        const canSelect = isSelect && layer && !layer.locked && layer.visible;
        obj.selectable = !!canSelect;
        obj.evented = !!canSelect;
      });
      if (!isSelect) this.canvas.discardActiveObject();
      this.canvas.requestRenderAll();
    });

    // Capture transform state for Undo/Redo
    this.canvas.on('object:scaling', this.captureTransformStart);
    this.canvas.on('object:rotating', this.captureTransformStart);
    this.canvas.on('object:moving', this.captureTransformStart);
    
    this.canvas.on('object:modified', (e) => {
      const target = e.target;
      if (!target || !this.transformStateBefore) return;
      
      const transformStateAfter: TransformState = {
        left: target.left || 0,
        top: target.top || 0,
        scaleX: target.scaleX || 1,
        scaleY: target.scaleY || 1,
        angle: target.angle || 0
      };

      const cmd = new TransformCommand(target, this.transformStateBefore, transformStateAfter, this.canvas);
      this.history.execute(cmd);
      this.transformStateBefore = null;
    });
  }

  private captureTransformStart = (e: fabric.IEvent) => {
    if (this.transformStateBefore) return; // already captured for this interaction
    const target = e.target;
    if (!target) return;
    
    this.transformStateBefore = {
      left: target.left || 0,
      top: target.top || 0,
      scaleX: target.scaleX || 1,
      scaleY: target.scaleY || 1,
      angle: target.angle || 0
    };
  };

  private handleResize = () => {
    this.canvas.setDimensions({ width: window.innerWidth, height: window.innerHeight });
    this.canvas.requestRenderAll();
  };

  // --- Gesture Drawing Interface --- //

  public beginStroke() {
    const activeLayer = this.layers.getActiveLayer();
    if (!activeLayer || !activeLayer.visible || activeLayer.locked) {
      return; // Block drawing
    }

    this.currentPoints = [];
    if (this.activeTempPaths.length > 0) {
      this.activeTempPaths.forEach(p => this.canvas.remove(p));
      this.activeTempPaths = [];
    }
  }

  public updateStroke(x: number, y: number, timestamp: number) {
    const activeLayer = this.layers.getActiveLayer();
    if (!activeLayer || !activeLayer.visible || activeLayer.locked) {
      return null; // Block drawing
    }
    const smoothed = this.strokeSmoother.filter(x, y, timestamp);
    this.currentPoints.push(smoothed);

    if (this.currentPoints.length > 1) {
      if (this.activeTempPaths.length > 0) {
        this.activeTempPaths.forEach(p => this.canvas.remove(p));
        this.activeTempPaths = [];
      }

      const isEraser = this.tool.getTool() === 'eraser';
      const config = this.brush.getConfig();
      
      // Calculate velocity for the stroke end
      const last = this.currentPoints[this.currentPoints.length - 1];
      const prev = this.currentPoints[this.currentPoints.length - 2];
      const dx = last.x - prev.x;
      const dy = last.y - prev.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const velocityScale = isEraser ? 1 : Math.max(0.1, 1 - (dist / 100) * config.velocitySensitivity);

      let paths: fabric.Object[] = [];
      
      if (isEraser) {
        // Eraser logic
        const svgPath = StrokeSmoother.pointsToSvgPath(this.currentPoints);
        const eraserPath = new fabric.Path(svgPath, {
          stroke: '#090d16',
          strokeWidth: config.size * 3,
          fill: '',
          strokeLineCap: 'round',
          strokeLineJoin: 'round',
          selectable: false,
          evented: false,
        });
        paths = [eraserPath];
      } else {
        const plugin = this.brush.getActivePlugin();
        const result = plugin.createPath(
          this.currentPoints, 
          config.color, 
          config.size, 
          config.opacity, 
          config.physics,
          velocityScale
        );
        if (result) {
          paths = Array.isArray(result) ? result : [result];
        }
      }

      paths.forEach(p => {
        p.set({ selectable: false, evented: false });
        this.canvas.add(p);
      });
      this.activeTempPaths = paths;
      this.canvas.requestRenderAll();
    }

    return smoothed;
  }

  public endStroke() {
    if (this.currentPoints.length > 1 && this.activeTempPaths.length > 0) {
      const activeLayerId = this.layers.getActiveLayerId();
      if (!activeLayerId) return;

      this.activeTempPaths.forEach(path => {
        // Stamp metadata onto each object created by the plugin
        (path as any).layerId = activeLayerId;
        (path as any).createdAt = Date.now();
        (path as any).brushType = this.tool.getTool();
        (path as any).id = `path-${Date.now()}-${Math.floor(Math.random()*1000)}`;
        (path as any).aiGenerated = false;
        
        path.set({
          selectable: this.tool.getTool() === 'selection',
          evented: this.tool.getTool() === 'selection'
        });
      });

      // Clear temp array but keep objects on canvas
      const pathsToSave = [...this.activeTempPaths];
      this.activeTempPaths = [];
      
      pathsToSave.forEach(p => this.canvas.remove(p));
      const command = new AddPathCommand(this.canvas, pathsToSave, this.layers);
      this.history.execute(command);
    }
    this.currentPoints = [];
    this.strokeSmoother.reset();
  }

  // --- Utility Methods --- //

  public clear() {
    const cmd = new ClearCanvasCommand(this.canvas);
    this.history.execute(cmd);
  }

  public toJSON() {
    return {
      fabric: this.canvas.toJSON(['id', 'layerId', 'createdAt', 'brushType', 'aiGenerated', 'locked', 'hidden']),
      layers: {
        list: this.layers.getLayers(),
        activeId: this.layers.getActiveLayerId()
      }
    };
  }

  public loadFromJSON(json: any, callback?: () => void) {
    if (json.layers) {
      this.layers.setLayersState(json.layers.list, json.layers.activeId);
    }
    const fabricJson = json.fabric || json; // Fallback for old saves
    
    this.canvas.loadFromJSON(fabricJson, () => {
      this.layers.renderLayers();
      if (callback) callback();
    });
  }

  public toDataURL(options: any): string {
    return this.canvas.toDataURL(options);
  }

  public dispose() {
    window.removeEventListener('resize', this.handleResize);
    this.canvas.dispose();
  }

  // --- Gesture Transformation Integration --- //

  // Find topmost visible, unlocked object intersecting (x,y)
  public findTargetObject(x: number, y: number): fabric.Object | null {
    let found: fabric.Object | null = null;
    // getObjects is ordered from bottom to top visually in Fabric
    const objects = this.canvas.getObjects();
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      const layer = this.layers.getLayers().find(l => l.id === (obj as any).layerId);
      if (layer && !layer.locked && layer.visible && obj.containsPoint(new fabric.Point(x, y))) {
        found = obj;
        break;
      }
    }
    return found;
  }

  public getCanvas(): fabric.Canvas {
    return this.canvas;
  }
}
