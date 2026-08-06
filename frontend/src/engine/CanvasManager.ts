import { fabric } from 'fabric';
import { EventBus } from './EventBus';
import { HistoryManager } from './HistoryManager';
import { BrushManager } from './BrushManager';
import { ToolManager } from './ToolManager';
import { LayerManager } from './LayerManager';
import { SelectionManager } from './SelectionManager';
import { AddPathCommand, ClearCanvasCommand } from './commands/CanvasCommands';
import { StrokeSmoother, Point } from '../services/strokeSmoother';

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

    this.bindEvents();
  }

  private bindEvents() {
    window.addEventListener('resize', this.handleResize);
    
    // Listen to tool changes to configure Fabric
    this.eventBus.on('tool:changed', (tool) => {
      this.canvas.selection = tool === 'selection';
      this.canvas.getObjects().forEach(obj => {
        obj.selectable = tool === 'selection';
        obj.evented = tool === 'selection';
      });
      this.canvas.requestRenderAll();
    });
  }

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
}
