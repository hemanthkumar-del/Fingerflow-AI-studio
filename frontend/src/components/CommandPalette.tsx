import React, { useEffect, useState, useRef } from 'react';
import { CanvasManager } from '../engine/CanvasManager';
import { Search } from 'lucide-react';

interface CommandPaletteProps {
  engine: CanvasManager;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ engine, onExport, onUndo, onRedo, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    { id: 'export', label: 'Export / Save As...', action: onExport },
    { id: 'undo', label: 'Undo', action: onUndo },
    { id: 'redo', label: 'Redo', action: onRedo },
    { id: 'clear', label: 'Clear Canvas', action: onClear },
    { id: 'tool-brush', label: 'Use Brush Tool', action: () => engine.tool.setTool('brush') },
    { id: 'tool-eraser', label: 'Use Eraser Tool', action: () => engine.tool.setTool('eraser') },
    { id: 'tool-selection', label: 'Use Selection Tool', action: () => engine.tool.setTool('selection') },
    { id: 'tool-shape', label: 'Use Shape Tool', action: () => engine.tool.setTool('shape') },
    { id: 'zoom-in', label: 'Zoom In', action: () => engine.viewport.zoomIn() },
    { id: 'zoom-out', label: 'Zoom Out', action: () => engine.viewport.zoomOut() },
    { id: 'zoom-reset', label: 'Reset Zoom (100%)', action: () => engine.viewport.resetZoom() },
  ];

  const filtered = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      if (isOpen) {
        if (e.key === 'Escape') {
          setIsOpen(false);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(s => Math.min(s + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(s => Math.max(s - 1, 0));
        } else if (e.key === 'Enter' && filtered.length > 0) {
          e.preventDefault();
          filtered[selectedIndex].action();
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '20vh',
      zIndex: 9999
    }} onClick={() => setIsOpen(false)}>
      <div 
        style={{
          width: '500px',
          background: '#1f2937',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #374151',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #374151' }}>
          <Search size={20} color="#9ca3af" style={{ marginRight: '12px' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '16px',
              outline: 'none',
            }}
          />
        </div>
        
        <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '8px 0' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '16px', color: '#9ca3af', textAlign: 'center' }}>No commands found</div>
          ) : (
            filtered.map((cmd, i) => (
              <div 
                key={cmd.id}
                onMouseEnter={() => setSelectedIndex(i)}
                onClick={() => {
                  cmd.action();
                  setIsOpen(false);
                }}
                style={{
                  padding: '12px 24px',
                  cursor: 'pointer',
                  backgroundColor: i === selectedIndex ? '#374151' : 'transparent',
                  color: i === selectedIndex ? 'white' : '#d1d5db',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {cmd.label}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
