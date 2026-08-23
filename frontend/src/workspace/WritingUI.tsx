import React, { useState, useCallback } from 'react';
import { useWorkspace } from './WorkspaceContext';
import { writingEngineStore } from './writingEngineStore';
import { WritingToolbar } from './modes/writing/WritingToolbar';
import { WritingExitDialog } from './modes/writing/WritingExitDialog';
import { RecognitionOverlay } from '../components/recognition/RecognitionOverlay';
import type { RecognitionResult } from '../recognition/RecognitionResult';
import type { Stroke } from '../recognition/Stroke';

export const WritingUI: React.FC = () => {
  const { currentModeId, setMode } = useWorkspace();
  const [showExit, setShowExit] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  
  if (currentModeId !== 'writing') return null;
  
  const engine = writingEngineStore.current;
  if (!engine) return null;
  
  // Wire up the recognition callback once
  engine.onRecognition = (result: RecognitionResult, rawStrokes: Stroke[]) => {
    setRecognitionResult(result);
  };
  
  const handleExitClick = () => {
    engine.getStrokeSession().flush();
    setShowExit(true);
  };
  
  const handleSave = () => {
    engine.getSessionManager().commitSession();
    engine.getStrokeSession().reset();
    setShowExit(false);
    setMode('canvas');
  };
  
  const handleDiscard = () => {
    engine.getSessionManager().discardSession();
    engine.getStrokeSession().reset();
    setShowExit(false);
    setMode('canvas');
  };
  
  const handleCancel = () => {
    setShowExit(false);
  };

  const handleAcceptRecognition = useCallback((character: string) => {
    // For Phase 10.2: simply display accepted character in console and dismiss
    // Phase 10.3+ will place a Fabric text object at the stroke bounding box position
    console.info(`[Smart Recognition] Accepted: "${character}"`);
    setRecognitionResult(null);
  }, []);
  
  const handleDismissRecognition = useCallback(() => {
    setRecognitionResult(null);
  }, []);

  return (
    <>
      <WritingToolbar engine={engine} onExit={handleExitClick} />
      
      <RecognitionOverlay
        result={recognitionResult}
        onAccept={handleAcceptRecognition}
        onDismiss={handleDismissRecognition}
      />
      
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
