import { CanvasManager } from '../../engine/CanvasManager';
import { WorkspaceDocument, DOCUMENT_SCHEMA_VERSION, DocumentMode, DocumentStatus } from './WorkspaceDocument';
import { StorageService } from '../../services/storageService';
import { EventBus } from '../../engine/EventBus';

export class DocumentManager {
  private document: WorkspaceDocument;
  private engine: CanvasManager;
  private userId: string | null = null;
  public status: DocumentStatus = 'clean';
  public eventBus: EventBus = new EventBus();

  constructor(engine: CanvasManager) {
    this.engine = engine;
    this.document = this.createEmptyDocument();
    
    // Listen to canvas changes to mark document as dirty
    this.engine.eventBus.on('history:changed', () => {
      this.markDirty();
    });
  }

  public setUserId(userId: string) {
    this.userId = userId;
  }

  public getDocument(): WorkspaceDocument {
    return this.document;
  }

  public getStatus(): DocumentStatus {
    return this.status;
  }

  private createEmptyDocument(id?: string, title?: string): WorkspaceDocument {
    return {
      metadata: {
        id: id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: title || 'Untitled Workspace',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: DOCUMENT_SCHEMA_VERSION,
        activeMode: 'canvas',
      },
      canvas: {
        fabricState: null,
      },
      writing: {}
    };
  }

  public createDocument(title?: string): WorkspaceDocument {
    this.document = this.createEmptyDocument(undefined, title);
    this.engine.clear();
    this.setStatus('clean');
    this.eventBus.emit('document:loaded', this.document);
    return this.document;
  }

  public renameDocument(newTitle: string) {
    if (this.document.metadata.title !== newTitle) {
      this.document.metadata.title = newTitle;
      this.document.metadata.updatedAt = Date.now();
      this.markDirty();
      this.eventBus.emit('document:renamed', newTitle);
    }
  }

  public setActiveMode(mode: DocumentMode) {
    if (this.document.metadata.activeMode !== mode) {
      this.document.metadata.activeMode = mode;
      this.document.metadata.updatedAt = Date.now();
      // Not marking as dirty just for mode change unless it's necessary.
      this.eventBus.emit('document:mode_changed', mode);
    }
  }

  public markDirty() {
    if (this.status !== 'dirty') {
      this.setStatus('dirty');
    }
  }

  private setStatus(status: DocumentStatus) {
    this.status = status;
    this.eventBus.emit('document:status_changed', status);
  }

  public serializeDocument(): string {
    // Refresh canvas state
    this.document.canvas.fabricState = this.engine.toJSON();
    this.document.metadata.updatedAt = Date.now();
    return JSON.stringify(this.document);
  }

  public deserializeDocument(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      
      // Migration / Validation check
      if (parsed.metadata && parsed.metadata.version) {
        // It's a WorkspaceDocument
        this.document = parsed as WorkspaceDocument;
        if (this.document.canvas.fabricState) {
          this.engine.loadFromJSON(this.document.canvas.fabricState);
        }
      } else {
        // Legacy fallback: assume the whole JSON is raw Fabric state
        this.document = this.createEmptyDocument();
        this.document.canvas.fabricState = parsed;
        this.engine.loadFromJSON(parsed);
      }
      
      this.setStatus('clean');
      this.eventBus.emit('document:loaded', this.document);
      return true;
    } catch (error) {
      console.error('Failed to parse document JSON:', error);
      this.setStatus('error');
      return false;
    }
  }

  public async saveDocument(): Promise<boolean> {
    if (!this.userId) {
      console.error('Cannot save document: No user ID');
      return false;
    }

    this.setStatus('saving');
    try {
      const jsonStr = this.serializeDocument();
      
      // Get preview
      const canvas = (this.engine as any).canvas;
      const previewUrl = canvas.toDataURL({ format: 'jpeg', quality: 0.5, multiplier: 0.5 });
      const brushSettings = { color: '#000', size: 1, tool: 'brush' };
      
      await StorageService.saveDrawing(
        this.userId,
        this.document.metadata.id,
        this.document.metadata.title,
        jsonStr, // We store the whole WorkspaceDocument JSON in the 'fabricJson' field
        previewUrl,
        brushSettings
      );
      
      this.setStatus('saved');
      
      // After a few seconds, if status is still 'saved', reset to 'clean' or leave it
      setTimeout(() => {
        if (this.status === 'saved') {
          this.setStatus('clean');
        }
      }, 3000);
      
      return true;
    } catch (error) {
      console.error('Failed to save document:', error);
      this.setStatus('error');
      return false;
    }
  }

  public async loadDocument(id: string): Promise<boolean> {
    // Actually loading from StorageService requires a method to fetch by ID.
    // If not readily available in StorageService, we might rely on the host UI to pass the JSON.
    // For now, let's assume the UI fetches the DrawingRecord and calls deserializeDocument.
    return false;
  }
}
