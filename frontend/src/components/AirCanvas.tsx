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
import { AISidebar } from './AISidebar';
import { Toast, ToastMessage } from './common/Toast';
import { GestureOverlay, GestureOverlayProps } from './GestureOverlay';
import { GestureSettingsModal } from './GestureSettingsModal';
import { SettingsManager } from '../services/gestureSettings';
import { StorageService, DrawingRecord } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { VideoOff, RefreshCw } from 'lucide-react';

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
  const fabricInstanceRef = useRef<fabric.Canvas | null>(null);

  // Drawing state
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
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
  const [gestureOverlay, setGestureOverlay] = useState<GestureOverlayProps | null>(null);

  // History Stack for Undo/Redo
  const [historyStack, setHistoryStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

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

  // 1. Initialize Fabric.js Canvas
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const fabricCanvas = new fabric.Canvas(fabricCanvasRef.current, {
      width,
      height,
      backgroundColor: '#090d16',
      isDrawingMode: false,
      selection: false,
    });

    fabricInstanceRef.current = fabricCanvas;

    // Load initial vector drawing JSON if reopening an existing drawing
    if (initialDrawing?.fabricJson) {
      fabricCanvas.loadFromJSON(initialDrawing.fabricJson, () => {
        fabricCanvas.renderAll();
        const state = JSON.stringify(fabricCanvas.toJSON());
        setHistoryStack([state]);
      });
    } else {
      const initialState = JSON.stringify(fabricCanvas.toJSON());
      setHistoryStack([initialState]);
    }

    const handleResize = () => {
      fabricCanvas.setDimensions({ width: window.innerWidth, height: window.innerHeight });
      fabricCanvas.renderAll();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      fabricCanvas.dispose();
    };
  }, []);

  // Save state helper for undo/redo stack
  const saveCanvasState = useCallback(() => {
    if (!fabricInstanceRef.current) return;
    const json = JSON.stringify(fabricInstanceRef.current.toJSON());
    setHistoryStack((prev) => [...prev, json]);
    setRedoStack([]);
  }, []);

  // Undo Action
  const handleUndo = useCallback(() => {
    if (historyStack.length <= 1 || !fabricInstanceRef.current) return;

    const currentState = historyStack[historyStack.length - 1];
    const previousState = historyStack[historyStack.length - 2];

    setRedoStack((prev) => [...prev, currentState]);
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));

    fabricInstanceRef.current.loadFromJSON(previousState, () => {
      fabricInstanceRef.current?.renderAll();
    });
  }, [historyStack]);

  // Redo Action
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0 || !fabricInstanceRef.current) return;

    const nextState = redoStack[redoStack.length - 1];

    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setHistoryStack((prev) => [...prev, nextState]);

    fabricInstanceRef.current.loadFromJSON(nextState, () => {
      fabricInstanceRef.current?.renderAll();
    });
  }, [redoStack]);

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
    if (!fabricInstanceRef.current || !user) return;
    try {
      setIsSavingCloud(true);
      const fabricJson = JSON.stringify(fabricInstanceRef.current.toJSON());
      const imageB64 = fabricInstanceRef.current.toDataURL({ format: 'png', quality: 0.9 });

      const savedRecord = await StorageService.saveDrawing(
        user.uid,
        activeDrawingId,
        drawingTitle,
        fabricJson,
        imageB64,
        { color: brushColor, size: brushSize, tool }
      );

      setActiveDrawingId(savedRecord.id);
      showToast('success', 'Drawing saved to cloud!');
    } catch (error) {
      showToast('error', 'Cloud save failed. Saved to local storage.');
    } finally {
      setIsSavingCloud(false);
    }
  }, [user, activeDrawingId, drawingTitle, brushColor, brushSize, tool]);

  // Export Canvas Action
  const handleExport = useCallback(() => {
    if (!fabricInstanceRef.current) return;
    const dataUrl = fabricInstanceRef.current.toDataURL({ format: 'png', quality: 1.0 });
    const link = document.createElement('a');
    link.download = `fingerflow-sketch-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    showToast('success', 'Sketch exported as PNG image!');
  }, []);

  // Clear Canvas Action
  const handleClear = useCallback(() => {
    if (!fabricInstanceRef.current) return;
    fabricInstanceRef.current.clear();
    fabricInstanceRef.current.setBackgroundColor('#090d16', () => {
      fabricInstanceRef.current?.renderAll();
      saveCanvasState();
      showToast('info', 'Canvas cleared.');
    });
  }, [saveCanvasState]);

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

        // Smooth point using One Euro + Kalman Filter
        const smoothedPoint = strokeSmootherRef.current.filter(indexX, indexY, now);

        // Draw pointer tracking circle on overlay HUD
        ctx.beginPath();
        ctx.arc(smoothedPoint.x, smoothedPoint.y, tool === 'eraser' ? brushSize * 1.5 : brushSize / 2 + 4, 0, 2 * Math.PI);
        ctx.fillStyle = tool === 'eraser' ? 'rgba(236, 72, 153, 0.4)' : `${brushColor}70`;
        ctx.strokeStyle = tool === 'eraser' ? '#ec4899' : brushColor;
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        // Perform Gesture Logic
        if (gestureResult.gesture === 'DRAW') {
          currentPointsRef.current.push(smoothedPoint);

          if (fabricInstanceRef.current && currentPointsRef.current.length > 1) {
            const svgPath = StrokeSmoother.pointsToSvgPath(currentPointsRef.current);

            // Remove temporary path
            if (activePathRef.current) {
              fabricInstanceRef.current.remove(activePathRef.current);
            }

            // Create new smooth Fabric Path
            const pathColor = tool === 'eraser' ? '#090d16' : brushColor;
            const pathWidth = tool === 'eraser' ? brushSize * 3 : brushSize;

            const path = new fabric.Path(svgPath, {
              stroke: pathColor,
              strokeWidth: pathWidth,
              fill: '',
              strokeLineCap: 'round',
              strokeLineJoin: 'round',
              selectable: false,
              evented: false,
            });

            activePathRef.current = path;
            fabricInstanceRef.current.add(path);
            fabricInstanceRef.current.renderAll();
          }
        } else {
          // Finalize path when exiting DRAW mode
          if (currentPointsRef.current.length > 0) {
            activePathRef.current = null;
            currentPointsRef.current = [];
            strokeSmootherRef.current.reset();
            saveCanvasState();
          }

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
        if (currentPointsRef.current.length > 0) {
          activePathRef.current = null;
          currentPointsRef.current = [];
          strokeSmootherRef.current.reset();
          saveCanvasState();
        }
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
  }, [isCameraActive, tool, brushColor, brushSize, saveCanvasState]);

  const getCanvasImage = useCallback((): string | null => {
    if (!fabricInstanceRef.current) return null;
    return fabricInstanceRef.current.toDataURL({ format: 'png', quality: 1.0 });
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

      <AISidebar getCanvasImage={getCanvasImage} />

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
        canUndo={historyStack.length > 1}
        canRedo={redoStack.length > 0}
        isCameraActive={isCameraActive}
        onToggleCamera={() => setIsCameraActive((prev) => !prev)}
      />

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
  );
};
