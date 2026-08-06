import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from './AuthLayout';
import { Mail, KeyRound, AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigateLogin: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigateLogin }) => {
  const { resetPassword, formatAuthError } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your email to receive a password reset link">
      {error && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.25rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#4ade80',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}
          >
            <CheckCircle2 size={24} />
          </div>
          <h4 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Check Your Inbox
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            We've sent a password reset link to <strong style={{ color: '#ffffff' }}>{email}</strong>.
          </p>
          <button
            onClick={onNavigateLogin}
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', width: '100%', justifyContent: 'center' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Sign In</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(0,0,0,0.3)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem',
              width: '100%',
              padding: '12px',
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
            <span>{loading ? 'Sending Reset Link...' : 'Send Reset Link'}</span>
          </button>

          <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', marginTop: '1rem' }}>
            Remembered your password?{' '}
            <button
              type="button"
              onClick={onNavigateLogin}
              style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 600, cursor: 'pointer' }}
            >
              Back to Sign In
            </button>
          </p>
        </form>
      )}
    </AuthLayout>
  );
};
