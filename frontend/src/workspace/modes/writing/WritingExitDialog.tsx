import React from 'react';

interface WritingExitDialogProps {
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export const WritingExitDialog: React.FC<WritingExitDialogProps> = ({ onSave, onDiscard, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="bg-gray-800 rounded-xl p-6 shadow-2xl max-w-md w-full border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-2">Exit Writing Mode</h2>
        <p className="text-gray-300 mb-6">
          Do you want to save your handwritten notes to the canvas?
        </p>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={onSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
          >
            Save Notes
          </button>
          
          <button 
            onClick={onDiscard}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors"
          >
            Discard Notes
          </button>
          
          <button 
            onClick={onCancel}
            className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg font-medium transition-colors mt-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
