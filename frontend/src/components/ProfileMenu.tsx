import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, ChevronDown, ShieldCheck } from 'lucide-react';

export const ProfileMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const displayName = user.displayName || user.email?.split('@')[0] || 'Air Canvas User';
  const email = user.email || '';
  const photoURL = user.photoURL;

  // Initials fallback avatar
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* Profile Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          cursor: 'pointer',
          color: '#ffffff',
          transition: 'all 0.2s',
        }}
      >
        {photoURL ? (
          <img
            src={photoURL}
            alt={displayName}
            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {initials}
          </div>
        )}

        <span style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayName}
        </span>
        <ChevronDown size={14} color="#94a3b8" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '240px',
            zIndex: 50,
            padding: '1rem',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
          }}
        >
          {/* User Details */}
          <div style={{ paddingBottom: '0.75rem', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4ade80', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
              <ShieldCheck size={14} />
              <span>Authenticated</span>
            </div>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff', wordBreak: 'break-word' }}>{displayName}</p>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', wordBreak: 'break-word', marginTop: '2px' }}>{email}</p>
          </div>

          {/* Menu Items */}
          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#f87171',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};
