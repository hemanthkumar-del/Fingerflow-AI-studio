import React from 'react';
import { X, ExternalLink, RefreshCw } from 'lucide-react';

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutDialog: React.FC<AboutDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: '#111827',
        padding: '32px',
        borderRadius: '16px',
        width: '450px',
        color: 'white',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid #374151',
        position: 'relative'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎨</div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, background: 'linear-gradient(to right, #4f46e5, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            FingerFlow Studio
          </h1>
          <p style={{ margin: '8px 0', fontSize: '14px', color: '#9ca3af', fontWeight: 600 }}>Version 1.0.0</p>
          <p style={{ margin: 0, fontSize: '16px', color: '#e5e7eb', fontStyle: 'italic' }}>
            "Create Naturally with Gestures and AI."
          </p>
        </div>

        <p style={{ fontSize: '14px', color: '#d1d5db', lineHeight: 1.6, marginBottom: '24px', textAlign: 'center' }}>
          A professional AI-powered gesture drawing studio built with modern web technologies.
        </p>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '1px', marginBottom: '12px' }}>Technology Stack</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['React', 'TypeScript', 'Fabric.js', 'MediaPipe', 'Firebase', 'FastAPI', 'Gemini AI'].map(tech => (
              <span key={tech} style={{ background: '#1f2937', padding: '4px 10px', borderRadius: '4px', fontSize: '13px', color: '#d1d5db', border: '1px solid #374151' }}>
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '24px', borderTop: '1px solid #374151', paddingTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: '#d1d5db' }}>GitHub Repository</span>
            <a href="https://github.com/hemanthkumar-del/ai_canvas" target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
              View <ExternalLink size={14} />
            </a>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: '#d1d5db' }}>Documentation</span>
            <a href="https://github.com/hemanthkumar-del/ai_canvas#readme" target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
              Read <ExternalLink size={14} />
            </a>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#d1d5db' }}>License</span>
            <span style={{ color: '#9ca3af', fontSize: '14px' }}>MIT License</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
          <button 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid #4b5563', color: '#d1d5db', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
            onClick={() => alert("FingerFlow Studio is up to date. (v1.0.0)")}
          >
            <RefreshCw size={16} /> Check for Updates
          </button>
        </div>
      </div>
    </div>
  );
};
