import React from 'react';
import { Camera, Check, X } from 'lucide-react';

export const CameraTips: React.FC = () => {
  return (
    <div>
      <div style={{
        padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', 
        border: '1px solid rgba(59, 130, 246, 0.3)', marginBottom: '24px',
        display: 'flex', alignItems: 'center', gap: '16px'
      }}>
        <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '12px', borderRadius: '50%' }}>
          <Camera size={24} color="#60a5fa" />
        </div>
        <div>
          <h4 style={{ margin: '0 0 4px 0', color: '#f8fafc', fontSize: '1rem' }}>Camera & Lighting</h4>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.4 }}>
            For the smoothest experience, make sure your hand is clearly visible. Good lighting directly affects gesture stability.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '16px' }}>
          <h5 style={{ margin: '0 0 12px 0', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={18} /> Good Conditions
          </h5>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.8 }}>
            <li>Front-facing light</li>
            <li>Clear hand visibility</li>
            <li>Contrasting background</li>
            <li>Hand inside camera frame</li>
            <li>Moderate distance from camera</li>
          </ul>
        </div>

        <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', padding: '16px' }}>
          <h5 style={{ margin: '0 0 12px 0', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <X size={18} /> Avoid
          </h5>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.8 }}>
            <li>Very dark rooms</li>
            <li>Strong light behind your hand</li>
            <li>Rapidly moving hand outside the frame</li>
            <li>Hand blending into background</li>
            <li>Covering fingers with other objects</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
