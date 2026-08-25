import React, { useState, useCallback } from 'react';
import { useWorkspace } from './WorkspaceContext';
import { writingEngineStore } from './writingEngineStore';
import { WritingToolbar } from './modes/writing/WritingToolbar';
import { WritingExitDialog } from './modes/writing/WritingExitDialog';
import { RecognitionOverlay } from '../components/recognition/RecognitionOverlay';
import type { RecognitionResult } from '../recognition/RecognitionResult';
import type { Stroke } from '../recognition/Stroke';

/**
 * WritingUI — renders all Writing Mode UI overlays.
 *
 * RULES OF HOOKS COMPLIANCE:
 * All hooks (useState, useCallback, useWorkspace) are called unconditionally
 * at the top of the component. The early return for non-writing mode comes AFTER
 * all hooks have been called. This is required by React's Rules of Hooks.
 */
export const WritingUI: React.FC = () => {
  // ── All hooks called unconditionally first ─────────────────────────────
  const { currentModeId, setMode } = useWorkspace();
  const [showExit, setShowExit] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);

  const handleExitClick = useCallback(() => {
    const engine = writingEngineStore.current;
    if (engine) engine.getStrokeSession().flush();
    setShowExit(true);
  }, []);

  const handleSave = useCallback(() => {
    const engine = writingEngineStore.current;
    if (engine) {
      engine.getSessionManager().commitSession();
      engine.getStrokeSession().reset();
    }
    setShowExit(false);
    setMode('canvas');
  }, [setMode]);

  const handleDiscard = useCallback(() => {
    const engine = writingEngineStore.current;
    if (engine) {
      engine.getSessionManager().discardSession();
      engine.getStrokeSession().reset();
    }
    setShowExit(false);
    setMode('canvas');
  }, [setMode]);

  const handleCancel = useCallback(() => {
    setShowExit(false);
  }, []);

  const handleAcceptRecognition = useCallback((character: string) => {
    console.info(`[Smart Recognition] Accepted: "${character}"`);
    setRecognitionResult(null);
  }, []);

  const handleDismissRecognition = useCallback(() => {
    setRecognitionResult(null);
  }, []);

  // ── Early return AFTER all hooks ────────────────────────────────────────
  if (currentModeId !== 'writing') return null;

  const engine = writingEngineStore.current;
  if (!engine) return null;

  // Wire up the recognition callback to React state setter
  engine.onRecognition = (result: RecognitionResult, _rawStrokes: Stroke[]) => {
    setRecognitionResult(result);
  };

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
