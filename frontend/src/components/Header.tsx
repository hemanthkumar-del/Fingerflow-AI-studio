import React from 'react';
import { Hand, Sparkles, Layers, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="glass-panel" style={{ margin: '1rem', padding: '1rem 2rem', borderRadius: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)', 
            padding: '8px', 
            borderRadius: '10px', 
            display: 'flex', 
            alignItems: 'center' 
          }}>
            <Hand size={24} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              FingerFlow <span style={{ color: '#818cf8' }}>AI</span>
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Real-time Air Canvas & Gesture Generation</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
            <Layers size={16} color="#818cf8" />
            <span>Fabric.js Canvas Engine</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
            <Sparkles size={16} color="#c084fc" />
            <span>Gemini AI</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
            <ShieldCheck size={16} color="#4ade80" />
            <span>Firebase Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
};
