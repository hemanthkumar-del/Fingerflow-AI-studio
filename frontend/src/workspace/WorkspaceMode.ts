import React from 'react';
import { CanvasManager } from '../engine/CanvasManager';
import { GestureProfile } from './GestureProfile';

/**
 * Interface defining a modular Workspace Mode.
 */
export interface WorkspaceMode {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  
  activate(engine: CanvasManager): void;
  deactivate(engine: CanvasManager): void;
  
  getGestureProfile(): GestureProfile;
  
  // Optional UI components provided by the mode
  getToolbar?(): React.ReactNode;
  
  // Status message logic
  getStatusMessage(gesture: string, tool: string): { text: string; color: string; icon: React.ReactNode };
}
