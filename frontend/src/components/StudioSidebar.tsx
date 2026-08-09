import React, { useState } from 'react';
import { Layers, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { LayerPanel } from './LayerPanel';
import { AISidebar } from './AISidebar';
import { CanvasManager } from '../engine/CanvasManager';
import { Layer } from '../engine/LayerManager';

interface StudioSidebarProps {
  engine: CanvasManager;
  layers: Layer[];
  activeLayerId: string | null;
  getCanvasImage: () => string | null;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  engine,
  layers,
  activeLayerId,
  getCanvasImage,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'layers' | 'ai'>('layers');

  return (
    <>
      {/* Toggle Button when collapsed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="glass-panel"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 40,
            padding: '10px 14px',
            borderRadius: '12px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            backdropFilter: 'blur(12px)',
          }}
        >
          <ChevronLeft size={18} />
          <span>Studio</span>
        </button>
      )}

      {/* Main Collapsible Sidebar */}
      <div
        className="glass-panel"
        style={{
          position: 'absolute',
          top: '20px',
          right: isOpen ? '20px' : '-350px',
          width: '320px',
          height: 'calc(100vh - 120px)', // Leave space for bottom toolbar
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid #374151',
          boxShadow: '-4px 0 25px rgba(0,0,0,0.5)',
          transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar Header & Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
            <button
              onClick={() => setActiveTab('layers')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'layers' ? '#374151' : 'transparent',
                color: activeTab === 'layers' ? '#ffffff' : '#9ca3af',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              <Layers size={16} />
              Layers
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'ai' ? '#4f46e5' : 'transparent',
                color: activeTab === 'ai' ? '#ffffff' : '#9ca3af',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              <Sparkles size={16} />
              AI Studio
            </button>
          </div>
          
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '6px',
              marginLeft: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Sidebar Content Area */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {/* We render both so state isn't lost when switching tabs */}
          <div style={{ display: activeTab === 'layers' ? 'block' : 'none', width: '100%', height: '100%' }}>
            <LayerPanel engine={engine} layers={layers} activeLayerId={activeLayerId} />
          </div>
          <div style={{ display: activeTab === 'ai' ? 'block' : 'none', width: '100%', height: '100%' }}>
            <AISidebar getCanvasImage={getCanvasImage} />
          </div>
        </div>
      </div>
    </>
  );
};
