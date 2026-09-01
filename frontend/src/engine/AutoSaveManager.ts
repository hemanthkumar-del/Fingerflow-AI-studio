import { StorageService } from '../services/storageService';
import { EventBus } from './EventBus';
import { CanvasManager } from './CanvasManager';

export class AutoSaveManager {
  private engine: CanvasManager;
  private currentDrawingId: string | null = null;
  private userId: string;
  private timer: NodeJS.Timeout | null = null;
  private isDirty: boolean = false;
  // Keep a reference to the listener so it can be removed in destroy()
  private onHistoryChanged: () => void;

  constructor(engine: CanvasManager, currentDrawingId: string | null, userId: string) {
    this.engine = engine;
    this.currentDrawingId = currentDrawingId;
    this.userId = userId;

    this.onHistoryChanged = () => {
      this.isDirty = true;
    };
    this.engine.eventBus.on('history:changed', this.onHistoryChanged);

    // Run interval every 30s
    this.timer = setInterval(() => {
      this.triggerSave();
    }, 30000);
  }

  public setDrawingId(id: string | null) {
    this.currentDrawingId = id;
  }

  public async triggerSave() {
    if (!this.isDirty || !this.currentDrawingId) return;

    try {
      this.engine.eventBus.emit('autosave:start', null);
      const state = this.engine.toJSON();
      const canvas = (this.engine as any).canvas;
      const previewUrl = canvas.toDataURL({ format: 'jpeg', quality: 0.5, multiplier: 0.5 });
      
      const brushSettings = { color: '#000', size: 1, tool: 'brush' }; // dummy for auto-save
      
      await StorageService.saveDrawing(
        this.userId,
        this.currentDrawingId, 
        'Auto Save', 
        JSON.stringify(state), 
        previewUrl, 
        brushSettings
      );
      this.isDirty = false;
      this.engine.eventBus.emit('autosave:success', null);
    } catch (error) {
      console.error('AutoSave failed:', error);
      this.engine.eventBus.emit('autosave:error', error);
    }
  }

  public destroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    // Remove the event listener to prevent orphaned subscriptions on re-mount
    this.engine.eventBus.off('history:changed', this.onHistoryChanged);
  }
}
