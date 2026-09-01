import React, { useEffect, useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import * as mpHands from '@mediapipe/hands';
import * as mpCamera from '@mediapipe/camera_utils';

// Safe constructor extraction for Vite production build
const Hands = mpHands.Hands || (window as any).Hands || (mpHands as any).default?.Hands;
const Camera = mpCamera.Camera || (window as any).Camera || (mpCamera as any).default?.Camera;
import { GestureEngine, GestureType, Landmark, FingerState } from '../services/gestureClassifier';
import { StrokeSmoother, Point } from '../services/strokeSmoother';
import { StatusHUD } from './StatusHUD';
import { FloatingToolbar } from './FloatingToolbar';
import { StudioSidebar } from './StudioSidebar';
import { Toast, ToastMessage } from './common/Toast';
import { GestureOverlay, GestureOverlayProps } from './GestureOverlay';
import { GestureSettingsModal } from './GestureSettingsModal';
import { SelectionToolbar } from './SelectionToolbar';
import { BrushStudio } from './BrushStudio';
import { ShapeToolbar } from './ShapeToolbar';
import { Minimap } from './Minimap';
import { ExportModal } from './ExportModal';
import { DebugPanel } from './DebugPanel';
import { CommandPalette } from './CommandPalette';
import { ShortcutsModal } from './ShortcutsModal';
import { PreferencesModal } from './PreferencesModal';
import { AboutDialog } from './AboutDialog';
import { HelpCenter } from './onboarding/HelpCenter';
import { SettingsManager } from '../services/gestureSettings';
import { StorageService, DrawingRecord } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { VideoOff, RefreshCw } from 'lucide-react';

import { CanvasManager } from '../engine/CanvasManager';
import { AutoSaveManager } from '../engine/AutoSaveManager';
import { ReplayEngine } from '../engine/ReplayEngine';

import { WorkspaceProvider } from '../workspace/WorkspaceContext';
import { ModeSwitcher } from '../workspace/ModeSwitcher';
import { currentModeRef } from '../workspace/currentModeStore';
import { writingEngineStore } from '../workspace/writingEngineStore';
import { writingDetectorStore } from '../workspace/writingDetectorStore';
import { WritingUI } from '../workspace/WritingUI';
import { CanvasUI } from '../workspace/CanvasUI';

interface AirCanvasProps {
  initialDrawing?: DrawingRecord | null;
  onOpenMyDrawings?: () => void;
}

export const AirCanvas: React.FC<AirCanvasProps> = ({ initialDrawing, onOpenMyDrawings }) => {
  const { user } = useAuth();
  // Canvas & Video element refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<CanvasManager | null>(null);
  const autoSaveRef = useRef<AutoSaveManager | null>(null);
  const replayRef = useRef<ReplayEngine | null>(null);

  // Drawing state
  const [tool, setTool] = useState<'brush' | 'eraser' | 'selection' | 'shape'>('brush');
  const [brushColor, setBrushColor] = useState<string>('#6366f1');
  const [brushSize, setBrushSize] = useState<number>(8);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);

  // Status HUD state
  const [fps, setFps] = useState<number>(60);
  const [isHandDetected, setIsHandDetected] = useState<boolean>(false);
  const [currentGesture, setCurrentGesture] = useState<GestureType>('NONE');
  const [confidence, setConfidence] = useState<number>(0);
  const [velocity, setVelocity] = useState<number>(0);
  const [fingerState, setFingerState] = useState<FingerState>({
    thumb: false, index: false, middle: false, ring: false, pinky: false,
  });
  const [handCount, setHandCount] = useState<number>(0);
  const [primaryHand, setPrimaryHand] = useState<'Left' | 'Right' | 'None'>('None');
  const [candidateGestures, setCandidateGestures] = useState<string[]>([]);
  const [cooldownActive, setCooldownActive] = useState<boolean>(false);
  
  // Settings & Overlay state
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showBrushStudio, setShowBrushStudio] = useState<boolean>(false);
  const [showExport, setShowExport] = useState<boolean>(false);
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);
  const [showPreferences, setShowPreferences] = useState<boolean>(false);
  const [showAbout, setShowAbout] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [gestureOverlay, setGestureOverlay] = useState<GestureOverlayProps | null>(null);

  // History State
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);

  // Layers State
  const [layers, setLayers] = useState<any[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);

  // Internal refs for smooth gesture tracking loop without React state rerender lag
  const gestureEngineRef = useRef<GestureEngine>(new GestureEngine());
  const strokeSmootherRef = useRef<StrokeSmoother>(new StrokeSmoother());
  const currentPointsRef = useRef<Point[]>([]);
  const activePathRef = useRef<fabric.Path | null>(null);
  const gestureRef = useRef<GestureType>('NONE');

  // FPS Calculation refs
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());

  // Performance: throttle HUD React setState to avoid 600 re-renders/second
  // HUD state is read every frame but we only push to React every ~150ms or on gesture change
  const lastHudUpdateRef = useRef<number>(0);
  const lastGestureTypeRef = useRef<GestureType>('NONE');
  const lastHandDetectedRef = useRef<boolean>(false);

  // Stale-closure-safe refs for tool/brush inside camera loop
  // These are kept in sync by the tool/brush useEffect below
  const toolRef = useRef<'brush' | 'eraser' | 'selection' | 'shape'>('brush');
  const brushColorRef = useRef<string>('#6366f1');
  const brushSizeRef = useRef<number>(8);

  // Writing Mode tracking quality (palm size normalized to frame height)
  // Updated inside the MediaPipe loop; read by WritingTrackingHUD via state throttle
  const writingPalmSizeRef = useRef<number>(0);
  const [writingPalmSize, setWritingPalmSize] = useState<number>(0);
  const [writingDevStats, setWritingDevStats] = useState({ fps: 0, state: 'IDLE', score: 0 });
  const lastTrackingUpdateRef = useRef<number>(0);

  // Drawing Metadata & Cloud Saving state
  const [activeDrawingId, setActiveDrawingId] = useState<string | null>(initialDrawing?.id || null);
  const [drawingTitle, setDrawingTitle] = useState<string>(initialDrawing?.title || 'Untitled Air Sketch');
  const [isSavingCloud, setIsSavingCloud] = useState<boolean>(false);

  // 1. Initialize Modular Canvas Engine
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const engine = new CanvasManager(fabricCanvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#090d16',
    });
    engineRef.current = engine;
    
    const autoSave = new AutoSaveManager(engine, activeDrawingId, user?.uid || 'local');
    autoSaveRef.current = autoSave;
    
    const replay = new ReplayEngine(engine);
    replayRef.current = replay;

    // Load initial drawing if provided state changes
    const onHistoryChanged = (state: any) => {
      setCanUndo(state.canUndo);
      setCanRedo(state.canRedo);
    };

    const updateLayers = (state: any) => {
      setLayers(state.layers);
      setActiveLayerId(state.activeLayerId);
    };

    engine.eventBus.on('history:changed', onHistoryChanged);
    engine.eventBus.on('layers:changed', updateLayers);

    return () => {
      autoSaveRef.current?.destroy();
      engine.eventBus.off('history:changed', onHistoryChanged);
      engine.eventBus.off('layers:changed', updateLayers);
      engine.dispose();
    };
  }, []);

  // Sync tool and brush settings to engine AND to stale-closure-safe refs
  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.tool.setTool(tool);
    engineRef.current.brush.setColor(brushColor);
    engineRef.current.brush.setSize(brushSize);
    // Keep refs in sync so the MediaPipe loop can read without stale closure issues
    toolRef.current = tool;
    brushColorRef.current = brushColor;
    brushSizeRef.current = brushSize;
  }, [tool, brushColor, brushSize]);

  // Undo Action
  const handleUndo = useCallback(() => {
    engineRef.current?.history.undo();
  }, []);

  // Redo Action
  const handleRedo = useCallback(() => {
    engineRef.current?.history.redo();
  }, []);

  // Toast Notification state
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [cameraError, setCameraError] = useState<boolean>(false);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToast({ id: Date.now().toString(), type, text });
  };

  const playConfirmationSound = useCallback(() => {
    const settings = SettingsManager.getSettings();
    if (!settings.soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); // A6
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.error('Audio play failed', e);
    }
  }, []);

  // Save Drawing to Cloud Storage & Firestore
  const handleSaveCloud = useCallback(async () => {
    if (!engineRef.current || !user) return;
    try {
      setIsSavingCloud(true);
      const fabricJson = JSON.stringify(engineRef.current.toJSON());
      const imageB64 = engineRef.current.toDataURL({ format: 'png', quality: 0.9 });

      const savedRecord = await StorageService.saveDrawing(
        user.uid,
        activeDrawingId,
        drawingTitle,
        fabricJson,
        imageB64,
        { color: brushColor, size: brushSize, tool }
      );

      setActiveDrawingId(savedRecord.id);
      autoSaveRef.current?.setDrawingId(savedRecord.id);
      showToast('success', 'Drawing saved to cloud!');
    } catch (error) {
      showToast('error', 'Cloud save failed. Saved to local storage.');
    } finally {
      setIsSavingCloud(false);
    }
  }, [user, activeDrawingId, drawingTitle, brushColor, brushSize, tool]);

  // Export Canvas Action
  const handleExport = useCallback(() => {
    if (!engineRef.current) return;
    const dataUrl = engineRef.current.toDataURL({ format: 'png', quality: 1.0 });
    const link = document.createElement('a');
    link.download = `fingerflow-sketch-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    showToast('success', 'Sketch exported as PNG image!');
  }, []);

  // Clear Canvas Action
  const handleClear = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.clear();
    showToast('info', 'Canvas cleared.');
  }, []);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing inside input elements
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveCloud();
      } else if (e.key.toLowerCase() === 'b') {
        setTool('brush');
      } else if (e.key.toLowerCase() === 'e') {
        setTool('eraser');
      } else if (e.key.toLowerCase() === 'c') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleSaveCloud, handleClear]);

  // 2. Initialize MediaPipe Hands & Video Stream Pipeline
  useEffect(() => {
    if (!videoRef.current || !overlayCanvasRef.current || !isCameraActive) return;

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2, // Multi-hand architecture
      modelComplexity: 1,
      minDetectionConfidence: 0.65,
      minTrackingConfidence: 0.65,
    });

    hands.onResults((results: mpHands.Results) => {
      // FPS Counter calculation (always runs for accuracy)
      const now = performance.now();
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;
      frameTimesRef.current.push(delta);
      if (frameTimesRef.current.length > 30) frameTimesRef.current.shift();
      const avgDelta = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
      const currentFps = Math.min(60, Math.round(1000 / (avgDelta || 16.6)));
      // Only push FPS to React every 500ms (it's a display metric, not real-time critical)
      if (now - lastHudUpdateRef.current > 500) {
        setFps(currentFps);
      }

      const overlay = overlayCanvasRef.current;
      if (!overlay) return;
      const ctx = overlay.getContext('2d');
      if (!ctx) return;

      const w = overlay.width;
      const h = overlay.height;

      ctx.clearRect(0, 0, w, h);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        // Only push handDetected=true to React if it changed
        if (!lastHandDetectedRef.current) {
          setIsHandDetected(true);
          lastHandDetectedRef.current = true;
        }
        
        // Mirror X for all landmarks in all hands
        const mirroredHands = results.multiHandLandmarks.map(hand => 
          hand.map(lm => ({ x: 1 - lm.x, y: lm.y, z: lm.z }))
        );

        const primaryLandmarks = mirroredHands[0];

        // Index tip position in canvas coordinates
        const indexX = primaryLandmarks[8].x * w;
        const indexY = primaryLandmarks[8].y * h;
        const palmX = primaryLandmarks[9].x * w;
        const palmY = primaryLandmarks[9].y * h;

        // ---- WRITING MODE INTERCEPT ----
        // Skip GestureEngine classification entirely in Writing Mode —
        // Writing Mode only needs WritingIndexDetector (no gesture analysis needed).
        if (currentModeRef.current === 'writing') {
          const wEngine = writingEngineStore.current;
          const detector = writingDetectorStore.current;

          // Calculate palm size (normalized to frame height) for tracking quality indicator
          // dist(WRIST[0], MIDDLE_MCP[9]) / frame height gives a scale-invariant palm size estimate
          const palmLm0 = primaryLandmarks[0];
          const palmLm9 = primaryLandmarks[9];
          const rawPalmDist = Math.sqrt(
            Math.pow((palmLm0.x - palmLm9.x) * w, 2) +
            Math.pow((palmLm0.y - palmLm9.y) * h, 2)
          );
          const normalizedPalmSize = rawPalmDist / h;
          writingPalmSizeRef.current = normalizedPalmSize;

          if (wEngine && detector) {
            // Use the dedicated geometric detector on raw landmarks.
            const writingState = detector.update(primaryLandmarks);

            if (writingState === 'WRITE') {
              // ── Index finger writing ──────────────────────────────────
              if (wEngine.isErasing) {
                wEngine.stopErasing();
              }
              if (!wEngine.isWriting) {
                wEngine.beginStroke(indexX, indexY, now);
              } else {
                wEngine.updateStroke(indexX, indexY, now);
              }

              // Fingertip cursor
              ctx.beginPath();
              ctx.arc(indexX, indexY, wEngine.inkSize / 2 + 3, 0, 2 * Math.PI);
              ctx.fillStyle = wEngine.inkColor;
              ctx.globalAlpha = 0.85;
              ctx.strokeStyle = 'rgba(255,255,255,0.9)';
              ctx.lineWidth = 1.5;
              ctx.fill();
              ctx.stroke();
              ctx.globalAlpha = 1.0;

            } else if (writingState === 'ERASE') {
              // ── Palm eraser ───────────────────────────────────────────
              if (wEngine.isWriting) {
                wEngine.endStroke();
              }
              wEngine.erase(palmX, palmY);

              // Eraser circle indicator
              ctx.beginPath();
              ctx.arc(palmX, palmY, wEngine.eraserRadius, 0, 2 * Math.PI);
              ctx.fillStyle = 'rgba(255, 50, 50, 0.15)';
              ctx.strokeStyle = 'rgba(255, 80, 80, 0.9)';
              ctx.lineWidth = 2;
              ctx.fill();
              ctx.stroke();

            } else {
              // ── IDLE — neither writing nor erasing ───────────────────
              if (wEngine.isWriting) {
                wEngine.endStroke();
              }
              if (wEngine.isErasing) {
                wEngine.stopErasing();
              }

              // Subtle hand-presence indicator
              ctx.beginPath();
              ctx.arc(indexX, indexY, 5, 0, 2 * Math.PI);
              ctx.fillStyle = 'rgba(148, 163, 184, 0.45)';
              ctx.fill();
            }
          }
          // Throttle writing HUD update to ~5 times/sec (200ms) to prevent re-renders
          if (now - lastTrackingUpdateRef.current > 200) {
            lastTrackingUpdateRef.current = now;
            setWritingPalmSize(writingPalmSizeRef.current);
            // Developer Mode stats
            const score = results.multiHandedness && results.multiHandedness.length > 0 ? results.multiHandedness[0].score : 0;
            setWritingDevStats({
              fps: currentFps,
              state: detector ? (detector as any).currentState || 'IDLE' : 'IDLE',
              score: score
            });
          }
          return; // Skip all Canvas Mode logic
        }
        // ---- END WRITING MODE INTERCEPT ----

        // ── Canvas Mode only: Classify Gesture using Phase 8 Intelligence Engine ──
        // This block is SKIPPED in Writing Mode (already returned above).
        const gestureResult = gestureEngineRef.current.update(mirroredHands, results.multiHandedness, now);
        gestureRef.current = gestureResult.gesture;

        // Throttle HUD updates: push to React every ~150ms OR immediately on gesture change.
        // This eliminates ~600 re-renders/sec down to ~7/sec for the HUD.
        const gestureChanged = gestureResult.gesture !== lastGestureTypeRef.current;
        const hudUpdateDue = (now - lastHudUpdateRef.current) > 150;
        if (gestureChanged || hudUpdateDue) {
          lastGestureTypeRef.current = gestureResult.gesture;
          lastHudUpdateRef.current = now;
          setCurrentGesture(gestureResult.gesture);
          setConfidence(gestureResult.confidence);
          setFingerState(gestureResult.fingerState);
          setVelocity(gestureResult.velocity);
          setHandCount(gestureResult.handCount);
          setPrimaryHand(gestureResult.primaryHand);
          setCandidateGestures(gestureResult.candidateGestures);
          setCooldownActive(gestureResult.cooldownActive);
          setFps(currentFps);
        }

        // Handle Action Trigger (from GestureRegistry)
        if (gestureResult.actionTriggered) {
          const action = gestureResult.actionTriggered;
          playConfirmationSound();
          setGestureOverlay({ icon: action.icon, name: action.name, durationMs: SettingsManager.getSettings().confirmationDurationMs });

          switch (action.action) {
            case 'UNDO': handleUndo(); break;
            case 'REDO': handleRedo(); break;
            case 'SAVE_CLOUD': handleSaveCloud(); break;
            case 'EXPORT_PNG': handleExport(); break;
            case 'CLEAR_CANVAS': handleClear(); break;
            case 'ERASER_MODE': setTool('eraser'); break;
            default: break;
          }
        }

        // Perform Gesture Logic using CanvasManager
        if (gestureResult.gesture === 'SELECTION_MODE') {
          if (toolRef.current !== 'selection') {
            setTool('selection');
            showToast('info', 'Selection Mode Active');
          }
        }

        if (toolRef.current === 'selection') {
          // Handle Selection/Transform Gestures
          const activeSelection = engineRef.current?.getCanvas().getActiveObject();
          const mode = engineRef.current?.selection.getMode() || 'select';

          if (gestureResult.gesture === 'DRAW') {
            // Act as mouse move
            if (activeSelection) {
              // Calculate delta and translate
              const smoothedPoint = strokeSmootherRef.current.filter(indexX, indexY, now);
              if (currentPointsRef.current.length > 0) {
                const prev = currentPointsRef.current[currentPointsRef.current.length - 1];
                const dx = smoothedPoint.x - prev.x;
                const dy = smoothedPoint.y - prev.y;

                if (mode === 'move') {
                  activeSelection.set({ left: (activeSelection.left || 0) + dx, top: (activeSelection.top || 0) + dy });
                  activeSelection.setCoords();
                  engineRef.current?.getCanvas().requestRenderAll();
                } else if (mode === 'rotate') {
                  // Basic rotation: delta X controls angle
                  activeSelection.set({ angle: (activeSelection.angle || 0) + dx * 0.5 });
                  activeSelection.setCoords();
                  engineRef.current?.getCanvas().requestRenderAll();
                }
              }
              currentPointsRef.current.push(smoothedPoint);
            } else {
              // Find target and select it
              const target = engineRef.current?.findTargetObject(indexX, indexY);
              if (target) {
                engineRef.current?.getCanvas().setActiveObject(target);
                engineRef.current?.getCanvas().requestRenderAll();
              }
            }
          } else if (gestureResult.gesture === 'PINCH' && activeSelection && gestureResult.pinchDistance !== undefined) {
             if (mode === 'resize') {
               // Pinch to resize - Precision mode threshold
               const deltaPinch = gestureResult.pinchDistance - (currentPointsRef.current[0]?.x || gestureResult.pinchDistance); // using points[0].x as temp storage for prev distance
               // We would need a more robust pinch delta tracker across frames
               // For now, mapping pinch distance directly to scale.
               const scale = Math.max(0.1, gestureResult.pinchDistance * 5); 
               activeSelection.set({ scaleX: scale, scaleY: scale });
               activeSelection.setCoords();
               engineRef.current?.getCanvas().requestRenderAll();
             }
          } else if (gestureResult.gesture === 'DUPLICATE_MODE' && activeSelection) {
             if (!cooldownActive) {
               // Duplicate
               activeSelection.clone((cloned: any) => {
                 cloned.set({ left: (cloned.left || 0) + 20, top: (cloned.top || 0) + 20 });
                 engineRef.current?.getCanvas().add(cloned);
                 engineRef.current?.getCanvas().setActiveObject(cloned);
                 engineRef.current?.getCanvas().requestRenderAll();
               });
               setCooldownActive(true);
               setTimeout(() => setCooldownActive(false), 1000);
               showToast('success', 'Object Duplicated');
             }
          } else if (gestureResult.gesture === 'DELETE_MODE' && activeSelection) {
             if (!cooldownActive) {
               const DeleteCommand = require('../engine/commands/TransformCommands').DeleteObjectCommand;
               const cmd = new DeleteCommand(engineRef.current?.getCanvas(), engineRef.current?.selection.getActiveObjects());
               engineRef.current?.history.execute(cmd);
               setCooldownActive(true);
               setTimeout(() => setCooldownActive(false), 1000);
               showToast('info', 'Object Deleted');
             }
          } else {
            // Reset temp state
            currentPointsRef.current = [];
            // If they release draw over an object, we trigger object:modified manually
            if (activeSelection) {
              engineRef.current?.getCanvas().fire('object:modified', { target: activeSelection });
            }
          }

          // Hover cursor
          const smoothedPoint = strokeSmootherRef.current.filter(indexX, indexY, now);
          ctx.beginPath();
          ctx.arc(smoothedPoint.x, smoothedPoint.y, 6, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';
          ctx.strokeStyle = '#6366f1';
          ctx.lineWidth = 2;
          ctx.fill();
          ctx.stroke();

        } else if (gestureResult.gesture === 'DRAW') {
          const smoothedPoint = engineRef.current?.updateStroke(indexX, indexY, now);
          
          if (smoothedPoint) {
            // Draw pointer tracking circle on overlay HUD
            // Use refs for tool/brushColor/brushSize (stale-closure-safe)
            const currentTool = toolRef.current;
            const currentColor = brushColorRef.current;
            const currentSize = brushSizeRef.current;
            ctx.beginPath();
            ctx.arc(smoothedPoint.x, smoothedPoint.y, currentTool === 'eraser' ? currentSize * 1.5 : currentSize / 2 + 4, 0, 2 * Math.PI);
            ctx.fillStyle = currentTool === 'eraser' ? 'rgba(236, 72, 153, 0.4)' : `${currentColor}70`;
            ctx.strokeStyle = currentTool === 'eraser' ? '#ec4899' : currentColor;
            ctx.lineWidth = 2;
            ctx.fill();
            ctx.stroke();
          }
        } else {
          // Finalize path when exiting DRAW mode
          engineRef.current?.endStroke();
          engineRef.current?.beginStroke(); // Ready for next

          // Pointer overlay when not drawing (HOVER)
          const smoothedPoint = strokeSmootherRef.current.filter(indexX, indexY, now);
          const currentTool = toolRef.current;
          const currentColor = brushColorRef.current;
          const currentSize = brushSizeRef.current;
          ctx.beginPath();
          ctx.arc(smoothedPoint.x, smoothedPoint.y, currentTool === 'eraser' ? currentSize * 1.5 : currentSize / 2 + 4, 0, 2 * Math.PI);
          ctx.fillStyle = currentTool === 'eraser' ? 'rgba(236, 72, 153, 0.4)' : `${currentColor}70`;
          ctx.strokeStyle = currentTool === 'eraser' ? '#ec4899' : currentColor;
          ctx.lineWidth = 2;
          ctx.fill();
          ctx.stroke();

          // Handle Pinch Gesture (Dynamic Brush Size)
          if (gestureResult.gesture === 'PINCH' && gestureResult.pinchDistance !== undefined) {
            const newSize = Math.max(2, Math.min(50, Math.round(gestureResult.pinchDistance * 120)));
            setBrushSize(newSize);
          }
        }
      } else {
        // Hand lost — only push state change if it was previously detected
        if (lastHandDetectedRef.current) {
          setIsHandDetected(false);
          setCurrentGesture('NONE');
          setHandCount(0);
          setPrimaryHand('None');
          lastHandDetectedRef.current = false;
          lastGestureTypeRef.current = 'NONE';
        }
        engineRef.current?.endStroke();
        engineRef.current?.beginStroke();
        // Notify the writing detector that tracking was lost this frame
        if (currentModeRef.current === 'writing') {
          writingDetectorStore.current?.update(null);
        }
      }
    });

    // 640x480 is sufficient for hand landmark accuracy at arm's-length camera distance.
    // Using 1280x720 doubles the MediaPipe pixel processing cost with no landmark gain.
    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await hands.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480,
    });

    camera.start();

    return () => {
      camera.stop();
      hands.close();
    };
  // Only restart camera when camera activation changes.
  // tool/brushColor/brushSize are now read via refs inside the loop (no stale closure).
  }, [isCameraActive]);

  const getCanvasImage = useCallback((): string | null => {
    if (!engineRef.current) return null;
    return engineRef.current.toDataURL({ format: 'png', quality: 1.0 });
  }, []);

  return (
    <WorkspaceProvider engine={engineRef.current}>
      <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#090d16' }}>
        <ModeSwitcher />
        <WritingUI 
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClear={handleClear}
          onExport={handleExport}
          onSaveCloud={handleSaveCloud}
          onOpenLibrary={onOpenMyDrawings || (() => {})}
          canUndo={canUndo}
          canRedo={canRedo}
          isSavingCloud={isSavingCloud}
          isCameraActive={isCameraActive}
          onToggleCamera={() => setIsCameraActive((prev) => !prev)}
          writingPalmSize={writingPalmSize}
          isHandDetected={isHandDetected}
          devStats={writingDevStats}
        />
        {/* Hidden/Background Video Element for MediaPipe Processing */}
      <video
        ref={videoRef}
        style={{
          display: 'none',
          transform: 'scaleX(-1)', // Mirrored video feed
        }}
        playsInline
      />

      {/* Fabric.js Interactive Vector Canvas */}
      <div data-tour="canvas" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        <canvas ref={fabricCanvasRef} />
      </div>

      {/* Overlay Canvas for Real-time Hand Landmark Pointer HUD */}
      <canvas
        ref={overlayCanvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />

      {/* HUD, Toolbar, & AI Sidebar Overlays */}
      <StatusHUD
        fps={fps}
        isHandDetected={isHandDetected}
        gesture={currentGesture}
        tool={tool}
        brushColor={brushColor}
        brushSize={brushSize}
        confidence={confidence}
        fingerState={fingerState}
        velocity={velocity}
        handCount={handCount}
        primaryHand={primaryHand}
        candidateGestures={candidateGestures}
        cooldownActive={cooldownActive}
      />

      {engineRef.current && (
        <>
          <DebugPanel engine={engineRef.current} />
          
          <ExportModal 
            engine={engineRef.current}
            isOpen={showExport}
            onClose={() => setShowExport(false)}
          />
          
          <CommandPalette 
            engine={engineRef.current}
            onExport={() => setShowExport(true)}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onClear={handleClear}
          />
          
          <ShortcutsModal 
            isOpen={showShortcuts}
            onClose={() => setShowShortcuts(false)}
          />
          
          <PreferencesModal 
            isOpen={showPreferences}
            onClose={() => setShowPreferences(false)}
            engine={engineRef.current}
          />
          
          <AboutDialog 
            isOpen={showAbout}
            onClose={() => setShowAbout(false)}
          />
          
          <HelpCenter
            isOpen={showHelp}
            onClose={() => setShowHelp(false)}
          />
        </>
      )}

      {engineRef.current && (
        <CanvasUI
          engine={engineRef.current}
          layers={layers}
          activeLayerId={activeLayerId}
          getCanvasImage={getCanvasImage}
          tool={tool}
          setTool={setTool}
          brushColor={brushColor}
          setBrushColor={setBrushColor}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClear={handleClear}
          onExport={handleExport}
          onSaveCloud={handleSaveCloud}
          onOpenMyDrawings={onOpenMyDrawings || (() => {})}
          isSavingCloud={isSavingCloud}
          canUndo={canUndo}
          canRedo={canRedo}
          isCameraActive={isCameraActive}
          onToggleCamera={() => setIsCameraActive((prev) => !prev)}
          onOpenBrushStudio={() => setShowBrushStudio(true)}
          showBrushStudio={showBrushStudio}
          setShowBrushStudio={setShowBrushStudio}
        />
      )}

      <div style={{ position: 'fixed', top: '16px', left: '16px', display: 'flex', gap: '8px', zIndex: 100 }}>
        <button 
          onClick={() => setShowPreferences(true)}
          style={{ background: '#1f2937', color: 'white', padding: '8px', borderRadius: '8px', border: '1px solid #374151', cursor: 'pointer' }}
          title="Preferences"
        >
          ⚙️
        </button>
        <button 
          onClick={() => setShowShortcuts(true)}
          style={{ background: '#1f2937', color: 'white', padding: '8px', borderRadius: '8px', border: '1px solid #374151', cursor: 'pointer' }}
          title="Shortcuts"
        >
          ⌨️
        </button>
        <button 
          onClick={() => setShowHelp(true)}
          style={{ background: '#1f2937', color: 'white', padding: '8px', borderRadius: '8px', border: '1px solid #374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Help Center"
        >
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#a855f7', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>?</span>
        </button>
        <button 
          onClick={() => {
             const engine = engineRef.current;
             const replay = replayRef.current;
             if (engine && replay) {
                 replay.startReplay(engine.history.getCommands());
             }
          }}
          style={{ background: '#1f2937', color: 'white', padding: '8px', borderRadius: '8px', border: '1px solid #374151', cursor: 'pointer' }}
          title="Replay Session"
        >
          ▶️
        </button>
        <button 
          onClick={() => setShowAbout(true)}
          style={{ background: '#1f2937', color: 'white', padding: '8px', borderRadius: '8px', border: '1px solid #374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="About FingerFlow Studio"
        >
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#60a5fa', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>ℹ</span>
        </button>
      </div>

      {gestureOverlay && (
        <GestureOverlay 
          icon={gestureOverlay.icon} 
          name={gestureOverlay.name} 
          durationMs={gestureOverlay.durationMs} 
        />
      )}

      {showSettings && (
        <GestureSettingsModal 
          onClose={() => setShowSettings(false)}
          onSave={() => setShowSettings(false)}
        />
      )}



      <button 
        onClick={() => setShowSettings(true)}
        style={{
          position: 'absolute', top: '1rem', right: '1rem', zIndex: 20,
          background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#cbd5e1', padding: '0.75rem', borderRadius: '50%', cursor: 'pointer',
          backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        title="Gesture Settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
      </button>

      <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    </WorkspaceProvider>
  );
};
