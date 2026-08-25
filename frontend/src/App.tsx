import React, { useState, lazy, Suspense } from 'react';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { EnvBanner } from './components/common/EnvBanner';
import { DrawingRecord } from './services/storageService';
import { Loader2, Hand } from 'lucide-react';
import { OnboardingProvider } from './components/onboarding/OnboardingProvider';
import { WelcomeModal } from './components/onboarding/WelcomeModal';
import { GuidedTour } from './components/onboarding/GuidedTour';
import './App.css';

// Lazy-loaded components for optimal bundle performance
const AirCanvas = lazy(() =>
  import('./components/AirCanvas').then((module) => ({ default: module.AirCanvas }))
);
const MyDrawingsPage = lazy(() =>
  import('./components/drawings/MyDrawingsPage').then((module) => ({ default: module.MyDrawingsPage }))
);

const PageLoader: React.FC = () => (
  <div
    style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#090d16',
      gap: '1rem',
    }}
  >
    <div
      style={{
        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        padding: '16px',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)',
      }}
    >
      <Hand size={36} color="#ffffff" />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#818cf8' }}>
      <Loader2 size={22} className="animate-spin" />
      <span style={{ fontWeight: 600, fontSize: '0.95rem', letterSpacing: '0.02em' }}>
        Loading FingerFlow Studio...
      </span>
    </div>
  </div>
);

export const App: React.FC = () => {
  const [view, setView] = useState<'studio' | 'gallery'>('studio');
  const [editingDrawing, setEditingDrawing] = useState<DrawingRecord | null>(null);

  const handleReopenDrawing = (drawing: DrawingRecord) => {
    setEditingDrawing(drawing);
    setView('studio');
  };

  return (
    <OnboardingProvider>
      <ProtectedRoute>
        <EnvBanner />
        <WelcomeModal />
        <GuidedTour />
        <Suspense fallback={<PageLoader />}>
          {view === 'studio' ? (
            <AirCanvas
              initialDrawing={editingDrawing}
              onOpenMyDrawings={() => setView('gallery')}
            />
          ) : (
            <MyDrawingsPage
              onBackToStudio={() => {
                setEditingDrawing(null);
                setView('studio');
              }}
              onReopenDrawing={handleReopenDrawing}
            />
          )}
        </Suspense>
      </ProtectedRoute>
    </OnboardingProvider>
  );
};

export default App;
