import React, { useState } from 'react';
import { useWorkspace } from './WorkspaceContext';
import { writingEngineStore } from './writingEngineStore';
import { WritingToolbar } from './modes/writing/WritingToolbar';
import { WritingExitDialog } from './modes/writing/WritingExitDialog';

export const WritingUI: React.FC = () => {
  const { currentModeId, setMode } = useWorkspace();
  const [showExit, setShowExit] = useState(false);
  
  if (currentModeId !== 'writing') return null;
  
  const engine = writingEngineStore.current;
  if (!engine) return null;
  
  const handleExitClick = () => {
    setShowExit(true);
  };
  
  const handleSave = () => {
    engine.getSessionManager().commitSession();
    setShowExit(false);
    setMode('canvas');
  };
  
  const handleDiscard = () => {
    engine.getSessionManager().discardSession();
    setShowExit(false);
    setMode('canvas');
  };
  
  const handleCancel = () => {
    setShowExit(false);
  };

  return (
    <>
      <WritingToolbar engine={engine} onExit={handleExitClick} />
      {showExit && (
        <WritingExitDialog 
          onSave={handleSave} 
          onDiscard={handleDiscard} 
          onCancel={handleCancel} 
        />
      )}
    </>
  );
};
