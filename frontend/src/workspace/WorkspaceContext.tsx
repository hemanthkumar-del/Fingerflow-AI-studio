import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { WorkspaceMode } from './WorkspaceMode';
import { WorkspaceRegistry } from './WorkspaceRegistry';
import { CanvasManager } from '../engine/CanvasManager';
import { WorkspaceManager } from './WorkspaceManager';

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

export const WorkspaceProvider: React.FC<{ engine: CanvasManager | null, children: ReactNode }> = ({ engine, children }) => {
  const availableModes = WorkspaceRegistry.getAll();
  const [currentModeId, setCurrentModeId] = useState<string>('canvas'); // Default to canvas
  
  const workspaceManager = useMemo(() => {
    if (engine) return new WorkspaceManager(engine);
    return null;
  }, [engine]);

  useEffect(() => {
    if (workspaceManager && engine) {
      workspaceManager.activateMode(currentModeId);
    }
  }, [workspaceManager, engine, currentModeId]);

  const setMode = (id: string) => {
    if (WorkspaceRegistry.get(id)) {
      setCurrentModeId(id);
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
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
