import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const getToastIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={18} color="#4ade80" />;
      case 'error':
        return <AlertCircle size={18} color="#f87171" />;
      default:
        return <Info size={18} color="#818cf8" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'rgba(74, 222, 128, 0.4)';
      case 'error':
        return 'rgba(239, 68, 68, 0.4)';
      default:
        return 'rgba(129, 140, 248, 0.4)';
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 100,
        padding: '0.85rem 1.25rem',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        border: `1px solid ${getBorderColor()}`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        color: '#ffffff',
        fontSize: '0.875rem',
        fontWeight: 600,
      }}
    >
      {getToastIcon()}
      <span>{toast.text}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '2px',
          marginLeft: '0.5rem',
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
