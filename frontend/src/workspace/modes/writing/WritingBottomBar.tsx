import React from 'react';
import {
  RotateCcw,
  RotateCw,
  Trash2,
  Camera,
  CameraOff,
  Download,
  UploadCloud,
  FolderKanban,
} from 'lucide-react';

interface WritingBottomBarProps {
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExport: () => void;
  onSaveCloud: () => void;
  onOpenLibrary: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isSavingCloud: boolean;
  isCameraActive: boolean;
  onToggleCamera: () => void;
}

export const WritingBottomBar: React.FC<WritingBottomBarProps> = ({
  onUndo,
  onRedo,
  onClear,
  onExport,
  onSaveCloud,
  onOpenLibrary,
  canUndo,
  canRedo,
  isSavingCloud,
  isCameraActive,
  onToggleCamera,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: 'rgba(15, 23, 42, 0.9)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
      }}
    >
      <button
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo"
        style={{
          background: 'transparent',
          border: 'none',
          color: canUndo ? '#ffffff' : '#64748b',
          padding: '8px',
          cursor: canUndo ? 'pointer' : 'not-allowed',
        }}
      >
        <RotateCcw size={18} />
      </button>

      <button
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo"
        style={{
          background: 'transparent',
          border: 'none',
          color: canRedo ? '#ffffff' : '#64748b',
          padding: '8px',
          cursor: canRedo ? 'pointer' : 'not-allowed',
        }}
      >
        <RotateCw size={18} />
      </button>

      <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />

      <button
        onClick={onSaveCloud}
        disabled={isSavingCloud}
        title="Save to Cloud"
        style={{
          background: isSavingCloud ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
          border: 'none',
          color: '#4ade80',
          padding: '8px',
          cursor: 'pointer',
        }}
      >
        <UploadCloud size={18} />
      </button>

      <button
        onClick={onOpenLibrary}
        title="My Cloud Drawings"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#c084fc',
          padding: '8px',
          cursor: 'pointer',
        }}
      >
        <FolderKanban size={18} />
      </button>

      <button
        onClick={onExport}
        title="Download / Snapshot"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#818cf8',
          padding: '8px',
          cursor: 'pointer',
        }}
      >
        <Download size={18} />
      </button>

      <button
        onClick={onClear}
        title="Clear Notes"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#f87171',
          padding: '8px',
          cursor: 'pointer',
        }}
      >
        <Trash2 size={18} />
      </button>

      <button
        onClick={onToggleCamera}
        title={isCameraActive ? 'Turn Camera Off' : 'Turn Camera On'}
        style={{
          background: 'transparent',
          border: 'none',
          color: isCameraActive ? '#9ca3af' : '#ef4444',
          padding: '8px',
          cursor: 'pointer',
        }}
      >
        {isCameraActive ? <Camera size={18} /> : <CameraOff size={18} />}
      </button>
    </div>
  );
};
