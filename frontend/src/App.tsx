import React, { useState } from 'react';
import { AirCanvas } from './components/AirCanvas';
import { Header } from './components/Header';
import { Palette, Cpu, Database, UploadCloud, PlayCircle } from 'lucide-react';
import './App.css';

export const App: React.FC = () => {
  const [isStudioActive, setIsStudioActive] = useState<boolean>(true);
  const [backendStatus] = useState<string>('Operational');

  if (isStudioActive) {
    return <AirCanvas />;
  }

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        <h1 className="hero-title">FingerFlow AI Air Canvas</h1>
        <p className="hero-subtitle">
          Next-generation air drawing platform powered by MediaPipe hand tracking, Fabric.js vector canvas, FastAPI, Firebase, and Gemini AI.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button className="btn-primary" onClick={() => setIsStudioActive(true)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlayCircle size={18} />
              <span>Launch Studio (Air Canvas Ready)</span>
            </div>
          </button>
        </div>

        <div className="status-grid">
          <div className="glass-panel status-card">
            <Palette className="status-icon" />
            <h3 style={{ color: '#ffffff' }}>Fabric.js Canvas</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>High-performance vector rendering & gesture drawing pipeline active.</p>
            <span className="status-badge">Phase 2 Active</span>
          </div>

          <div className="glass-panel status-card">
            <Cpu className="status-icon" />
            <h3 style={{ color: '#ffffff' }}>FastAPI Backend</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>REST API & Gemini AI generation endpoint ready.</p>
            <span className="status-badge">{backendStatus}</span>
          </div>

          <div className="glass-panel status-card">
            <Database className="status-icon" />
            <h3 style={{ color: '#ffffff' }}>Firebase Services</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Authentication, Firestore database, and Cloud Storage SDK integrated.</p>
            <span className="status-badge">Phase 1 Configured</span>
          </div>

          <div className="glass-panel status-card">
            <UploadCloud className="status-icon" />
            <h3 style={{ color: '#ffffff' }}>Docker & CI/CD</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Multi-stage Docker containers and GitHub Actions pipeline ready.</p>
            <span className="status-badge">Phase 1 Configured</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
