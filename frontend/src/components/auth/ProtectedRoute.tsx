import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { Loader2, Hand } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot_password'>('login');

  if (loading) {
    return (
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
            Authenticating FingerFlow Studio...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authView === 'register') {
      return <RegisterPage onNavigateLogin={() => setAuthView('login')} />;
    }

    if (authView === 'forgot_password') {
      return <ForgotPasswordPage onNavigateLogin={() => setAuthView('login')} />;
    }

    return (
      <LoginPage
        onNavigateRegister={() => setAuthView('register')}
        onNavigateForgotPassword={() => setAuthView('forgot_password')}
      />
    );
  }

  return <>{children}</>;
};
