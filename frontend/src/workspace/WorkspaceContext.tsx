import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { WorkspaceMode } from './WorkspaceMode';
import { WorkspaceRegistry } from './WorkspaceRegistry';
import { CanvasManager } from '../engine/CanvasManager';
import { WorkspaceManager } from './WorkspaceManager';
import { currentModeRef } from './currentModeStore';
import { DocumentManager } from './document/DocumentManager';
import { DocumentMode } from './document/WorkspaceDocument';

// Import modes so they register themselves
import './modes/CanvasWorkspace';
import './modes/WritingWorkspace';

interface WorkspaceContextProps {
  currentModeId: string;
  currentMode: WorkspaceMode | null;
  availableModes: WorkspaceMode[];
  setMode: (id: string) => void;
  isModeActive: (id: string) => boolean;
}

const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ engine: CanvasManager | null, docManager?: DocumentManager | null, children: ReactNode }> = ({ engine, docManager, children }) => {
  const availableModes = WorkspaceRegistry.getAll();
  const [currentModeId, setCurrentModeId] = useState<string>('canvas'); // Default to canvas
  
  const workspaceManager = useMemo(() => {
    if (engine) return new WorkspaceManager(engine);
    return null;
  }, [engine]);

  useEffect(() => {
    currentModeRef.current = currentModeId;
    if (workspaceManager && engine) {
      workspaceManager.activateMode(currentModeId);
    }
    if (docManager) {
      docManager.setActiveMode(currentModeId as DocumentMode);
    }
  }, [workspaceManager, engine, docManager, currentModeId]);

  const setMode = (id: string) => {
    if (WorkspaceRegistry.get(id)) {
      setCurrentModeId(id);
      currentModeRef.current = id;
    }
  };

  const isModeActive = (id: string) => currentModeId === id;

  const currentMode = WorkspaceRegistry.get(currentModeId) || null;

  return (
    <WorkspaceContext.Provider value={{
      currentModeId,
      currentMode,
      availableModes,
      setMode,
      isModeActive
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
