export const DOCUMENT_SCHEMA_VERSION = 1;

export type DocumentMode = 'canvas' | 'writing';
export type DocumentStatus = 'clean' | 'dirty' | 'saving' | 'saved' | 'error';

export interface WorkspaceDocument {
  metadata: {
    id: string;
    title: string;
    createdAt: number;
    updatedAt: number;
    version: number;
    activeMode: DocumentMode;
  };
  
  canvas: {
    // The existing Fabric/CanvasManager serialization goes here
    fabricState: any; 
  };

  writing: {
    // Any writing-specific settings or non-canvas state
    settings?: {
      inkColor?: string;
      inkSize?: number;
      eraserRadius?: number;
      smartRecognitionEnabled?: boolean;
    };
  };
}
