import React, { useState } from 'react';
import { CanvasManager } from '../engine/CanvasManager';
import { Download, X } from 'lucide-react';
import jsPDF from 'jspdf';

interface ExportModalProps {
  engine: CanvasManager;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ engine, isOpen, onClose }) => {
  const [format, setFormat] = useState<'png' | 'jpeg' | 'svg' | 'pdf' | 'json' | 'ffstudio'>('png');
  const [scale, setScale] = useState<number>(1);
  const [filename, setFilename] = useState<string>('My_FingerFlow_Masterpiece');

  if (!isOpen) return null;

  const handleExport = () => {
    const canvas = (engine as any).canvas as fabric.Canvas;
    
    // Save original viewport
    const originalZoom = canvas.getZoom();
    const originalVpt = canvas.viewportTransform ? [...canvas.viewportTransform] : null;
    
    // Reset viewport for export to capture everything
    engine.viewport.resetZoom();

    let dataStr = '';
    let mimeType = '';
    let ext = format;

    if (format === 'png' || format === 'jpeg') {
      dataStr = canvas.toDataURL({
        format: format,
        quality: 1,
        multiplier: scale,
      });
    } else if (format === 'svg') {
      dataStr = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(canvas.toSVG());
    } else if (format === 'pdf') {
      const imgData = canvas.toDataURL({ format: 'jpeg', quality: 1, multiplier: scale });
      const pdf = new jsPDF({
        orientation: canvas.getWidth() > canvas.getHeight() ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.getWidth(), canvas.getHeight()]
      });
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.getWidth(), canvas.getHeight());
      pdf.save(`${filename}.pdf`);
      
      // Restore viewport
      if (originalVpt) {
        canvas.setViewportTransform(originalVpt);
      }
      onClose();
      return;
    } else if (format === 'json' || format === 'ffstudio') {
      const jsonStr = JSON.stringify(engine.toJSON(), null, 2);
      dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr);
      mimeType = 'application/json';
      ext = format === 'ffstudio' ? 'ffstudio' : 'json';
    }

    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${filename}.${ext}`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    // Restore viewport
    if (originalVpt) {
      canvas.setViewportTransform(originalVpt);
    }

    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#1f2937',
        padding: '24px',
        borderRadius: '12px',
        width: '400px',
        color: 'white',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Export Studio</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#d1d5db' }}>Filename</label>
          <input 
            type="text" 
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #4b5563', background: '#374151', color: 'white' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#d1d5db' }}>Format</label>
          <select 
            value={format} 
            onChange={(e) => setFormat(e.target.value as any)}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #4b5563', background: '#374151', color: 'white' }}
          >
            <option value="png">PNG (Lossless Image)</option>
            <option value="jpeg">JPEG (Compressed Image)</option>
            <option value="svg">SVG (Vector Image)</option>
            <option value="pdf">PDF (Document)</option>
            <option value="json">JSON (Raw Data)</option>
            <option value="ffstudio">.ffstudio (Native Project)</option>
          </select>
        </div>

        {(format === 'png' || format === 'jpeg' || format === 'pdf') && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#d1d5db' }}>Scale / Quality ({scale}x)</label>
            <input 
              type="range" 
              min="1" max="5" step="1" 
              value={scale} 
              onChange={(e) => setScale(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        )}

        <button 
          onClick={handleExport}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontWeight: 600,
            fontSize: '16px'
          }}
        >
          <Download size={20} />
          Export Now
        </button>
      </div>
    </div>
  );
};
