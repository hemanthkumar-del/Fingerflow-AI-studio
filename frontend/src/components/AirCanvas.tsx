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
import { SettingsManager } from '../services/gestureSettings';
import { StorageService, DrawingRecord } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { VideoOff, RefreshCw } from 'lucide-react';

import { CanvasManager } from '../engine/CanvasManager';
import { AutoSaveManager } from '../engine/AutoSaveManager';
import { ReplayEngine } from '../engine/ReplayEngine';

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

  // Sync tool and brush settings to engine
  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.tool.setTool(tool);
    engineRef.current.brush.setColor(brushColor);
    engineRef.current.brush.setSize(brushSize);
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
      // FPS Counter calculation
      const now = performance.now();
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;
      frameTimesRef.current.push(delta);
      if (frameTimesRef.current.length > 30) frameTimesRef.current.shift();
      const avgDelta = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
      const currentFps = Math.min(60, Math.round(1000 / (avgDelta || 16.6)));
      setFps(currentFps);

      const overlay = overlayCanvasRef.current;
      if (!overlay) return;
      const ctx = overlay.getContext('2d');
      if (!ctx) return;

      const w = overlay.width;
      const h = overlay.height;

      ctx.clearRect(0, 0, w, h);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        setIsHandDetected(true);
        
        // Mirror X for all landmarks in all hands
        const mirroredHands = results.multiHandLandmarks.map(hand => 
          hand.map(lm => ({ x: 1 - lm.x, y: lm.y, z: lm.z }))
        );

        // Classify Gesture using Phase 8 Intelligence Engine
        const gestureResult = gestureEngineRef.current.update(mirroredHands, results.multiHandedness, now);
        
        gestureRef.current = gestureResult.gesture;
        setCurrentGesture(gestureResult.gesture);
        setConfidence(gestureResult.confidence);
        setFingerState(gestureResult.fingerState);
        setVelocity(gestureResult.velocity);
        setHandCount(gestureResult.handCount);
        setPrimaryHand(gestureResult.primaryHand);
        setCandidateGestures(gestureResult.candidateGestures);
        setCooldownActive(gestureResult.cooldownActive);

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
            // Add other logical hooks when those features are fully built in the UI
            default: break;
          }
        }

        const primaryLandmarks = mirroredHands[0];

        // Index tip position in canvas coordinates
        const indexX = primaryLandmarks[8].x * w;
        const indexY = primaryLandmarks[8].y * h;

        // Perform Gesture Logic using CanvasManager
        if (gestureResult.gesture === 'SELECTION_MODE') {
          if (tool !== 'selection') {
            setTool('selection');
            showToast('info', 'Selection Mode Active');
          }
        }

        if (tool === 'selection') {
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
            ctx.beginPath();
            ctx.arc(smoothedPoint.x, smoothedPoint.y, tool === 'eraser' ? brushSize * 1.5 : brushSize / 2 + 4, 0, 2 * Math.PI);
            ctx.fillStyle = tool === 'eraser' ? 'rgba(236, 72, 153, 0.4)' : `${brushColor}70`;
            ctx.strokeStyle = tool === 'eraser' ? '#ec4899' : brushColor;
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
          ctx.beginPath();
          ctx.arc(smoothedPoint.x, smoothedPoint.y, tool === 'eraser' ? brushSize * 1.5 : brushSize / 2 + 4, 0, 2 * Math.PI);
          ctx.fillStyle = tool === 'eraser' ? 'rgba(236, 72, 153, 0.4)' : `${brushColor}70`;
          ctx.strokeStyle = tool === 'eraser' ? '#ec4899' : brushColor;
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
        setIsHandDetected(false);
        setCurrentGesture('NONE');
        setHandCount(0);
        setPrimaryHand('None');
        engineRef.current?.endStroke();
        engineRef.current?.beginStroke();
      }
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await hands.send({ image: videoRef.current });
        }
      },
      width: 1280,
      height: 720,
    });

    camera.start();

    return () => {
      camera.stop();
      hands.close();
    };
  }, [isCameraActive, tool, brushColor, brushSize]);

  const getCanvasImage = useCallback((): string | null => {
    if (!engineRef.current) return null;
    return engineRef.current.toDataURL({ format: 'png', quality: 1.0 });
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#090d16' }}>
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
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
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
          <BrushStudio
            engine={engineRef.current}
            isOpen={showBrushStudio}
            onClose={() => setShowBrushStudio(false)}
          />
          <ShapeToolbar engine={engineRef.current} />
          <Minimap engine={engineRef.current} />
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
        </>
      )}

      <FloatingToolbar
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
      />

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

      {engineRef.current && (
        <>
          <StudioSidebar 
            engine={engineRef.current}
            layers={layers}
            activeLayerId={activeLayerId}
            getCanvasImage={getCanvasImage}
          />
          <SelectionToolbar engine={engineRef.current} />
        </>
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
  );
};
