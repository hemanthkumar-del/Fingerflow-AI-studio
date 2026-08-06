import React from 'react';
import {
  Edit3,
  Eraser,
  RotateCcw,
  RotateCw,
  Trash2,
  Camera,
  CameraOff,
  Sliders,
  Download,
  UploadCloud,
  FolderKanban,
} from 'lucide-react';

interface FloatingToolbarProps {
  tool: 'brush' | 'eraser';
  setTool: (tool: 'brush' | 'eraser') => void;
  brushColor: string;
  setBrushColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExport: () => void;
  onSaveCloud: () => void;
  onOpenMyDrawings: () => void;
  isSavingCloud?: boolean;
  canUndo: boolean;
  canRedo: boolean;
  isCameraActive: boolean;
  onToggleCamera: () => void;
}

const PRESET_COLORS = [
  '#6366f1', // Indigo / Purple
  '#38bdf8', // Light Blue
  '#34d399', // Emerald Green
  '#facc15', // Yellow
  '#f43f5e', // Rose / Pink
  '#a855f7', // Purple
  '#ffffff', // White
];

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  tool,
  setTool,
  brushColor,
  setBrushColor,
  brushSize,
  setBrushSize,
  onUndo,
  onRedo,
  onClear,
  onExport,
  onSaveCloud,
  onOpenMyDrawings,
  isSavingCloud,
  canUndo,
  canRedo,
  isCameraActive,
  onToggleCamera,
}) => {
  return (
    <div
      className="glass-panel"
      style={{
        position: 'absolute',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
      }}
    >
      {/* Tool Selectors */}
      <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px' }}>
        <button
          onClick={() => setTool('brush')}
          style={{
            background: tool === 'brush' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
            border: 'none',
            color: '#ffffff',
            padding: '8px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: 600,
            fontSize: '0.85rem',
            transition: 'all 0.2s',
          }}
        >
          <Edit3 size={16} />
          <span>Brush</span>
        </button>

        <button
          onClick={() => setTool('eraser')}
          style={{
            background: tool === 'eraser' ? 'linear-gradient(135deg, #ec4899, #db2777)' : 'transparent',
            border: 'none',
            color: '#ffffff',
            padding: '8px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: 600,
            fontSize: '0.85rem',
            transition: 'all 0.2s',
          }}
        >
          <Eraser size={16} />
          <span>Eraser</span>
        </button>
      </div>

      <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)' }} />

      {/* Preset Colors & Color Picker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => {
              setBrushColor(color);
              if (tool === 'eraser') setTool('brush');
            }}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: color,
              border: brushColor === color && tool === 'brush' ? '3px solid #ffffff' : '1px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
              transform: brushColor === color && tool === 'brush' ? 'scale(1.2)' : 'scale(1)',
              transition: 'all 0.2s',
              boxShadow: brushColor === color ? `0 0 10px ${color}` : 'none',
            }}
          />
        ))}

        <input
          type="color"
          value={brushColor}
          onChange={(e) => {
            setBrushColor(e.target.value);
            if (tool === 'eraser') setTool('brush');
          }}
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            background: 'none',
          }}
        />
      </div>

      <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)' }} />

      {/* Brush Size Slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <Sliders size={16} color="#94a3b8" />
        <input
          type="range"
          min="2"
          max="50"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          style={{
            width: '90px',
            accentColor: '#818cf8',
            cursor: 'pointer',
          }}
        />
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', width: '28px' }}>
          {brushSize}px
        </span>
      </div>

      <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)' }} />

      {/* Actions: Undo, Redo, Clear, Camera */}
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: canUndo ? '#ffffff' : '#64748b',
            padding: '8px',
            borderRadius: '8px',
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
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: canRedo ? '#ffffff' : '#64748b',
            padding: '8px',
            borderRadius: '8px',
            cursor: canRedo ? 'pointer' : 'not-allowed',
          }}
        >
          <RotateCw size={18} />
        </button>

        <button
          onClick={onSaveCloud}
          disabled={isSavingCloud}
          title="Save to Cloud"
          style={{
            background: isSavingCloud ? 'rgba(99, 102, 241, 0.3)' : 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(74, 222, 128, 0.3)',
            color: '#4ade80',
            padding: '8px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          <UploadCloud size={18} />
        </button>

        <button
          onClick={onOpenMyDrawings}
          title="My Cloud Drawings & Dashboard"
          style={{
            background: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(192, 132, 252, 0.3)',
            color: '#c084fc',
            padding: '8px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          <FolderKanban size={18} />
        </button>

        <button
          onClick={onExport}
          title="Export Sketch"
          style={{
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#818cf8',
            padding: '8px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          <Download size={18} />
        </button>

        <button
          onClick={onClear}
          title="Clear Canvas"
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '8px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          <Trash2 size={18} />
        </button>

        <button
          onClick={onToggleCamera}
          title={isCameraActive ? 'Disable Camera' : 'Enable Camera'}
          style={{
            background: isCameraActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.08)',
            border: isCameraActive ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid rgba(255,255,255,0.1)',
            color: isCameraActive ? '#4ade80' : '#ffffff',
            padding: '8px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          {isCameraActive ? <Camera size={18} /> : <CameraOff size={18} />}
        </button>
      </div>
    </div>
  );
};
