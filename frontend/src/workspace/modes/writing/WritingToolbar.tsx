import React from 'react';
import { WritingEngine } from './WritingEngine';
import { useWorkspace } from '../../WorkspaceContext';

interface WritingToolbarProps {
  engine: WritingEngine;
  onExit: () => void;
}

export const WritingToolbar: React.FC<WritingToolbarProps> = ({ engine, onExit }) => {
  const [inkColor, setInkColor] = React.useState(engine.inkColor);
  const [inkSize, setInkSize] = React.useState(engine.inkSize);
  const [eraserRadius, setEraserRadius] = React.useState(engine.eraserRadius);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInkColor(val);
    engine.inkColor = val;
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setInkSize(val);
    engine.inkSize = val;
  };

  const handleEraserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setEraserRadius(val);
    engine.eraserRadius = val;
  };

  const handleClear = () => {
    engine.getSessionManager().discardSession();
  };

  return (
    <div className="absolute bottom-4 left-4 bg-gray-800 text-white p-4 rounded-xl shadow-xl flex flex-col gap-4 z-50 pointer-events-auto w-64 border border-gray-700">
      <div className="flex justify-between items-center border-b border-gray-700 pb-2">
        <h3 className="font-semibold flex items-center gap-2"><span className="text-lg">✍️</span> Writing Mode</h3>
      </div>
      
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between">
          <label>Ink Color:</label>
          <input type="color" value={inkColor} onChange={handleColorChange} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <label>Ink Size:</label>
            <span>{inkSize}px</span>
          </div>
          <input type="range" min="2" max="20" value={inkSize} onChange={handleSizeChange} className="w-full accent-blue-500" />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <label>Eraser Size:</label>
            <span>{eraserRadius}px</span>
          </div>
          <input type="range" min="20" max="100" value={eraserRadius} onChange={handleEraserChange} className="w-full accent-red-500" />
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-700">
        <button onClick={handleClear} className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded transition-colors text-sm">
          Clear Notes
        </button>
        <button onClick={onExit} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded font-medium transition-colors">
          Finish Writing
        </button>
      </div>
    </div>
  );
};
