import { DocumentManager } from '../workspace/document/DocumentManager';

export class AutoSaveManager {
  private docManager: DocumentManager;
  private timer: NodeJS.Timeout | null = null;

  constructor(docManager: DocumentManager) {
    this.docManager = docManager;

    // Run interval every 30s
    this.timer = setInterval(() => {
      this.triggerSave();
    }, 30000);
  }

  public setDrawingId(id: string | null) {
    // Kept for signature compatibility but not strictly needed 
    // as DocumentManager holds the ID.
  }

  public async triggerSave() {
    if (this.docManager.getStatus() !== 'dirty') return;

    try {
      this.docManager.eventBus.emit('autosave:start', null);
      
      const success = await this.docManager.saveDocument();
      
      if (success) {
        this.docManager.eventBus.emit('autosave:success', null);
      } else {
        this.docManager.eventBus.emit('autosave:error', new Error('Failed to save document'));
      }
    } catch (error) {
      console.error('AutoSave failed:', error);
      this.docManager.eventBus.emit('autosave:error', error);
    }
  }

  public destroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
