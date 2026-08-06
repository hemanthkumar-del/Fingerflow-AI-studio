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
  private activeTempPath: fabric.Path | null = null;
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
    if (this.activeTempPath) {
      this.canvas.remove(this.activeTempPath);
      this.activeTempPath = null;
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
      if (this.activeTempPath) {
        this.canvas.remove(this.activeTempPath);
      }

      const svgPath = StrokeSmoother.pointsToSvgPath(this.currentPoints);
      const isEraser = this.tool.getTool() === 'eraser';
      const config = this.brush.getConfig();
      
      const pathColor = isEraser ? '#090d16' : config.color;
      const pathWidth = isEraser ? config.size * 3 : config.size;

      this.activeTempPath = new fabric.Path(svgPath, {
        stroke: pathColor,
        strokeWidth: pathWidth,
        fill: '',
        strokeLineCap: 'round',
        strokeLineJoin: 'round',
        selectable: false,
        evented: false,
        opacity: config.opacity
      });

      // Tag Metadata for Layering and Export
      (this.activeTempPath as any).id = `path-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      (this.activeTempPath as any).layerId = activeLayer.id;
      (this.activeTempPath as any).createdAt = timestamp;
      (this.activeTempPath as any).brushType = this.tool.getTool();
      (this.activeTempPath as any).aiGenerated = false;

      this.canvas.add(this.activeTempPath);
      this.layers.renderLayers(); // Ensure it renders at correct z-index
    }
    return smoothed;
  }

  public endStroke() {
    if (this.activeTempPath && this.currentPoints.length > 1) {
      // Create a final command for history
      const finalPath = this.activeTempPath;
      this.activeTempPath = null;
      
      // We don't need to add it again, it's already added, but we want the command to track it.
      // Actually, if we just push the AddPathCommand, and then execute it, it will be added again.
      // So we remove it first, then execute command.
      this.canvas.remove(finalPath);
      const cmd = new AddPathCommand(this.canvas, finalPath);
      this.history.execute(cmd);
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
