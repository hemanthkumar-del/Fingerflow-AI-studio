import React, { useEffect, useState, useLayoutEffect } from 'react';
import { useOnboarding } from './OnboardingProvider';
import { X, ArrowRight, ArrowLeft, Camera, Edit3, Layers, Layout, Hand, Hexagon, MousePointer2, Sparkles, Download, CheckCircle, Lightbulb } from 'lucide-react';
import { GestureGuide } from './GestureGuide';

type TourStepInfo = {
  title: string;
  description: React.ReactNode;
  icon: React.ReactNode;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
};

const TOUR_STEPS: TourStepInfo[] = [
  {
    title: 'Welcome to FingerFlow Studio',
    description: "Let's take a quick tour of your creative workspace.",
    icon: <Sparkles size={24} color="#c084fc" />,
    position: 'center'
  },
  {
    title: 'Set Up Your Camera',
    description: (
      <>
        <p>Keep your hand clearly visible inside the camera frame. Good front-facing lighting gives the most reliable gesture detection.</p>
        <ul style={{ textAlign: 'left', marginTop: '10px', fontSize: '0.9rem', color: '#cbd5e1' }}>
          <li>✓ Avoid very dark rooms.</li>
          <li>✓ Avoid strong backlighting.</li>
          <li>✓ Keep your hand clearly separated from the background.</li>
          <li>✓ Keep your hand comfortably inside the camera frame.</li>
        </ul>
      </>
    ),
    icon: <Camera size={24} color="#60a5fa" />,
    position: 'center'
  },
  {
    title: 'Gesture Status',
    description: "This panel tells you whether your hand is detected and shows the current action.",
    icon: <ActivityIcon />,
    target: 'status-hud',
    position: 'right'
  },
  {
    title: 'Drawing',
    description: "Raise your index finger ☝️ and move your hand to draw naturally on the canvas. Try drawing a small circle.",
    icon: <Edit3 size={24} color="#10b981" />,
    target: 'canvas',
    position: 'center'
  },
  {
    title: 'Gesture Guide',
    description: <GestureGuide isEmbedded />,
    icon: <Hand size={24} color="#f59e0b" />,
    position: 'center'
  },
  {
    title: 'Brush Studio',
    description: "Choose from FingerFlow Studio's procedural brushes like Pencil, Ink, Watercolor, and Neon.",
    icon: <Edit3 size={24} color="#ec4899" />,
    target: 'brushes',
    position: 'top'
  },
  {
    title: 'Layer Studio',
    description: "Layers help you organize your artwork. You can Add, Rename, Hide, Lock, Duplicate, Delete, Reorder, and change Opacity.",
    icon: <Layers size={24} color="#6366f1" />,
    target: 'layers',
    position: 'left'
  },
  {
    title: 'Shape Tools',
    description: "Create precise geometric shapes or enable Smart Shapes to automatically recognize rough sketches.",
    icon: <Hexagon size={24} color="#f59e0b" />,
    target: 'shapes',
    position: 'left'
  },
  {
    title: 'Selection',
    description: "Use Selection Mode to manipulate objects on the canvas. You can Move, Resize, Rotate, Duplicate, and Delete objects.",
    icon: <MousePointer2 size={24} color="#3b82f6" />,
    target: 'selection',
    position: 'left'
  },
  {
    title: 'AI Studio',
    description: "AI Studio helps you work with your artwork using AI-powered assistance.",
    icon: <Sparkles size={24} color="#c084fc" />,
    target: 'ai-studio',
    position: 'left'
  },
  {
    title: 'Infinite Canvas',
    description: "Your workspace is not limited to the screen. Explore your canvas using pan (Open Palm) and zoom (Pinch) gestures, or the minimap.",
    icon: <Layout size={24} color="#10b981" />,
    target: 'canvas',
    position: 'center'
  },
  {
    title: 'Export & Replay',
    description: "Export your work as PNG, JPEG, SVG, PDF, JSON, or FFStudio project format. You can also Replay your drawing session.",
    icon: <Download size={24} color="#60a5fa" />,
    target: 'export',
    position: 'top'
  },
  {
    title: "You're Ready! 🎉",
    description: "Everything is set. Start creating naturally with FingerFlow Studio.",
    icon: <CheckCircle size={24} color="#10b981" />,
    position: 'center'
  }
];

// Helper icon
function ActivityIcon() {
  return <Lightbulb size={24} color="#facc15" />;
}

export const GuidedTour: React.FC = () => {
  const { isTourActive, currentStep, totalSteps, nextStep, prevStep, skipTour } = useOnboarding();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const stepInfo = TOUR_STEPS[currentStep - 1];

  const updateTargetPosition = () => {
    if (stepInfo?.target) {
      const el = document.querySelector(`[data-tour="${stepInfo.target}"]`);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  };

  useLayoutEffect(() => {
    if (isTourActive) {
      updateTargetPosition();
      // Slight delay for UI rendering transitions
      const t = setTimeout(updateTargetPosition, 300);
      window.addEventListener('resize', updateTargetPosition);
      return () => {
        clearTimeout(t);
        window.removeEventListener('resize', updateTargetPosition);
      };
    }
  }, [isTourActive, currentStep]);

  if (!isTourActive || !stepInfo) return null;

  const isCenter = !stepInfo.target || stepInfo.position === 'center';

  // Calculate tooltip style based on target position
  let tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 99999,
    width: '380px',
    maxWidth: '90vw',
    backgroundColor: 'rgba(15, 23, 42, 0.98)',
    border: '1px solid rgba(139, 92, 246, 0.4)',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(139, 92, 246, 0.2)',
    color: '#f8fafc',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  if (isCenter || !targetRect) {
    tooltipStyle.top = '50%';
    tooltipStyle.left = '50%';
    tooltipStyle.transform = 'translate(-50%, -50%)';
  } else {
    // Contextual positioning relative to targetRect
    const gap = 16;
    if (stepInfo.position === 'right') {
      tooltipStyle.left = `${targetRect.right + gap}px`;
      tooltipStyle.top = `${targetRect.top}px`;
    } else if (stepInfo.position === 'left') {
      tooltipStyle.left = `${targetRect.left - 380 - gap}px`;
      tooltipStyle.top = `${targetRect.top}px`;
    } else if (stepInfo.position === 'top') {
      tooltipStyle.left = `${targetRect.left + (targetRect.width / 2) - 190}px`;
      tooltipStyle.top = `${targetRect.top - 200 - gap}px`;
    } else if (stepInfo.position === 'bottom') {
      tooltipStyle.left = `${targetRect.left + (targetRect.width / 2) - 190}px`;
      tooltipStyle.top = `${targetRect.bottom + gap}px`;
    }

    // Boundary constraints
    tooltipStyle.maxHeight = '90vh';
    tooltipStyle.overflowY = 'auto';
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 99990, pointerEvents: 'auto',
    }}>
      {/* Dimmed Background Overlay with cutout for target */}
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && !isCenter && (
              <rect
                x={targetRect.left - 4}
                y={targetRect.top - 4}
                width={targetRect.width + 8}
                height={targetRect.height + 8}
                fill="black"
                rx={8}
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#tour-mask)" />
      </svg>

      {/* Target Highlight Outline */}
      {targetRect && !isCenter && (
        <div style={{
          position: 'absolute',
          top: targetRect.top - 4,
          left: targetRect.left - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8,
          border: '2px solid #a855f7',
          borderRadius: '8px',
          boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)',
          pointerEvents: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      )}

      {/* Tooltip Card */}
      <div style={tooltipStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '10px' }}>
              {stepInfo.icon}
            </div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>{stepInfo.title}</h3>
          </div>
          <button onClick={skipTour} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          {stepInfo.description}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            Step {currentStep} of {totalSteps}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                style={{
                  background: 'rgba(255,255,255,0.1)', border: 'none', color: '#f8fafc',
                  padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                <ArrowLeft size={16} /> Back
              </button>
            )}
            <button
              onClick={nextStep}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none', color: '#ffffff',
                padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px'
              }}
            >
              {currentStep === totalSteps ? 'Start Creating' : 'Next'} {currentStep < totalSteps && <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
