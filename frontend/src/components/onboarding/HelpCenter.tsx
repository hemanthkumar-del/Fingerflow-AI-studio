import React, { useState } from 'react';
import { X, Play, BookOpen, Camera, Hand, Rocket } from 'lucide-react';
import { GestureGuide } from './GestureGuide';
import { CameraTips } from './CameraTips';
import { useOnboarding } from './OnboardingProvider';

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpCenter: React.FC<HelpCenterProps> = ({ isOpen, onClose }) => {
  const { replayTour } = useOnboarding();
  const [activeTab, setActiveTab] = useState<'quick' | 'camera' | 'gestures'>('quick');

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    }}>
      <div className="glass-panel" style={{
        background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '16px', width: '900px', height: '600px', maxWidth: '95vw', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        color: '#f8fafc', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BookOpen size={24} color="#a855f7" />
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>FingerFlow Studio Help</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar Tabs */}
          <div style={{
            width: '240px', borderRight: '1px solid rgba(255,255,255,0.1)',
            padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(0,0,0,0.2)'
          }}>
            <TabButton active={activeTab === 'quick'} onClick={() => setActiveTab('quick')} icon={<Rocket size={18} />} label="Quick Start" />
            <TabButton active={activeTab === 'gestures'} onClick={() => setActiveTab('gestures')} icon={<Hand size={18} />} label="Gesture Guide" />
            <TabButton active={activeTab === 'camera'} onClick={() => setActiveTab('camera')} icon={<Camera size={18} />} label="Camera & Lighting" />

            <div style={{ flex: 1 }} />
            
            <button
              onClick={() => {
                onClose();
                replayTour();
              }}
              style={{
                marginTop: 'auto', padding: '0.875rem', borderRadius: '8px',
                border: '1px solid rgba(168, 85, 247, 0.4)', background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(168, 85, 247, 0.2)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)'}
            >
              <Play size={16} fill="currentColor" />
              Replay Guided Tour
            </button>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
            {activeTab === 'quick' && (
              <div>
                <h3 style={{ margin: '0 0 1rem 0', color: '#f8fafc' }}>Quick Start Workflow</h3>
                <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  FingerFlow Studio is designed to let you create artwork seamlessly without touching a mouse or keyboard.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Step num={1} text="Allow camera access when prompted." />
                  <Step num={2} text="Make sure your hand is visible and tracking is stable." />
                  <Step num={3} text="Raise your index finger (☝️) to begin drawing." />
                  <Step num={4} text="Use natural gestures to pan the canvas or resize." />
                  <Step num={5} text="Make peace (✌️) to select and manipulate objects." />
                  <Step num={6} text="Choose procedural brushes from the Brush Studio." />
                  <Step num={7} text="Organize your complex artwork with layers." />
                  <Step num={8} text="Use shapes and Smart Shapes to perfect geometry." />
                  <Step num={9} text="Try AI Studio to enhance your sketches automatically." />
                  <Step num={10} text="Export your finished artwork or save it to the cloud." />
                </div>
              </div>
            )}
            {activeTab === 'gestures' && <GestureGuide />}
            {activeTab === 'camera' && <CameraTips />}
          </div>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
      background: active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
      border: active ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
      color: active ? '#818cf8' : '#94a3b8',
      borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: active ? 600 : 500,
      transition: 'all 0.2s'
    }}
  >
    {icon}
    {label}
  </button>
);

const Step = ({ num, text }: { num: number, text: string }) => (
  <div style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
    <div style={{ 
      width: '24px', height: '24px', borderRadius: '50%', background: '#3b82f6', color: 'white', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0 
    }}>
      {num}
    </div>
    <div style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.4 }}>{text}</div>
  </div>
);
