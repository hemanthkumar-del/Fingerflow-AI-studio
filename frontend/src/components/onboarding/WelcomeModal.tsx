import React from 'react';
import { useOnboarding } from './OnboardingProvider';
import { Sparkles, ArrowRight } from 'lucide-react';

export const WelcomeModal: React.FC = () => {
  const { showWelcome, startTour, skipTour } = useOnboarding();

  if (!showWelcome) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div className="glass-panel" style={{
        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '24px',
        padding: '2.5rem',
        maxWidth: '440px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 92, 246, 0.2)',
        color: '#f8fafc'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)'
        }}>
          <Sparkles size={32} color="#ffffff" />
        </div>
        
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: '#ffffff' }}>
          Welcome to FingerFlow Studio 👋
        </h2>
        
        <p style={{ fontSize: '1.1rem', color: '#c084fc', fontWeight: 600, marginBottom: '1.25rem' }}>
          Create naturally with gestures and AI.
        </p>
        
        <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '2.5rem' }}>
          FingerFlow Studio lets you draw, edit, organize and create on an infinite canvas using natural hand gestures. 
          Let's take a quick tour of your new creative workspace.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            onClick={startTour}
            style={{
              padding: '0.875rem',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Start Guided Tour
            <ArrowRight size={18} />
          </button>
          
          <button
            onClick={skipTour}
            style={{
              padding: '0.875rem',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent',
              color: '#94a3b8',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};
