import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useWorkspace } from './WorkspaceContext';
import { writingEngineStore } from './writingEngineStore';
import { WritingStudioPanel } from './modes/writing/WritingStudioPanel';
import { WritingExitDialog } from './modes/writing/WritingExitDialog';
import { WritingBottomBar } from './modes/writing/WritingBottomBar';
import { WritingTrackingHUD } from './modes/writing/WritingTrackingHUD';
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
interface WritingUIProps {
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExport: () => void;
  onSaveCloud: () => void;
  onOpenLibrary: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isSavingCloud: boolean;
  isCameraActive: boolean;
  onToggleCamera: () => void;
  /** Normalized palm size (0-1) for tracking quality feedback */
  writingPalmSize?: number;
  /** Whether a hand is currently detected by MediaPipe */
  isHandDetected?: boolean;
  /** Developer mode stats */
  devStats?: { fps: number, state: string, score: number };
}

export const WritingUI: React.FC<WritingUIProps> = (props) => {
  // ── All hooks called unconditionally first ─────────────────────────────
  const { currentModeId, setMode } = useWorkspace();
  const [showExit, setShowExit] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  // Ref to prevent reassigning onRecognition callback every render
  const recognitionCallbackSetRef = useRef(false);

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

  // Reset internal state whenever the workspace mode leaves 'writing'.
  // This guarantees that if the user enters Writing Mode again, showExit
  // starts as false and no stale recognition result is shown.
  useEffect(() => {
    if (currentModeId !== 'writing') {
      setShowExit(false);
      setRecognitionResult(null);
      recognitionCallbackSetRef.current = false;
    }
  }, [currentModeId]);

  // Wire up the recognition callback exactly once per engine instance,
  // not on every render (which would create a new lambda and GC pressure).
  useEffect(() => {
    const engine = writingEngineStore.current;
    if (engine && currentModeId === 'writing') {
      engine.onRecognition = (result: RecognitionResult, _rawStrokes: Stroke[]) => {
        setRecognitionResult(result);
      };
      recognitionCallbackSetRef.current = true;
    }
    return () => {
      // Clean up when Writing Mode exits or engine changes
      const eng = writingEngineStore.current;
      if (eng) eng.onRecognition = null;
    };
  }, [currentModeId]);

  // ── Early return AFTER all hooks ────────────────────────────────────────
  if (currentModeId !== 'writing') return null;

  const engine = writingEngineStore.current;
  if (!engine) return null;

  return (
    <>
      <WritingStudioPanel engine={engine} onExit={handleExitClick} />

      {/* Tracking quality indicator — only shown when tracking is poor or Dev Mode is on */}
      <WritingTrackingHUD
        palmSize={props.writingPalmSize ?? 0}
        isHandDetected={props.isHandDetected ?? false}
        devStats={props.devStats}
      />

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
      <WritingBottomBar
        onUndo={props.onUndo}
        onRedo={props.onRedo}
        onClear={props.onClear}
        onExport={props.onExport}
        onSaveCloud={props.onSaveCloud}
        onOpenLibrary={props.onOpenLibrary}
        canUndo={props.canUndo}
        canRedo={props.canRedo}
        isSavingCloud={props.isSavingCloud}
        isCameraActive={props.isCameraActive}
        onToggleCamera={props.onToggleCamera}
      />
    </>
  );
};
