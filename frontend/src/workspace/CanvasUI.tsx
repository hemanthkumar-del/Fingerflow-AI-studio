import React from 'react';
import { useWorkspace } from './WorkspaceContext';
import { StudioSidebar } from '../components/StudioSidebar';
import { SelectionToolbar } from '../components/SelectionToolbar';
import { FloatingToolbar } from '../components/FloatingToolbar';
import { CanvasManager } from '../engine/CanvasManager';
import { Layer } from '../engine/LayerManager';
import { ShapeToolbar } from '../components/ShapeToolbar';
import { BrushStudio } from '../components/BrushStudio';
import { Minimap } from '../components/Minimap';

interface CanvasUIProps {
  engine: CanvasManager;
  layers: Layer[];
  activeLayerId: string | null;
  getCanvasImage: () => string | null;
  
  // FloatingToolbar props
  tool: any;
  setTool: any;
  brushColor: string;
  setBrushColor: any;
  brushSize: number;
  setBrushSize: any;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExport: () => void;
  onSaveCloud: () => void;
  onOpenMyDrawings: () => void;
  isSavingCloud: boolean;
  canUndo: boolean;
  canRedo: boolean;
  isCameraActive: boolean;
  onToggleCamera: () => void;
  onOpenBrushStudio: () => void;
  showBrushStudio: boolean;
  setShowBrushStudio: (show: boolean) => void;
}

export const CanvasUI: React.FC<CanvasUIProps> = (props) => {
  const { currentModeId } = useWorkspace();

  if (currentModeId !== 'canvas') {
    return null;
  }

  return (
    <>
      <StudioSidebar
        engine={props.engine}
        layers={props.layers}
        activeLayerId={props.activeLayerId}
        getCanvasImage={props.getCanvasImage}
      />
      <SelectionToolbar engine={props.engine} />
      <ShapeToolbar engine={props.engine} />
      <BrushStudio
        engine={props.engine}
        isOpen={props.showBrushStudio}
        onClose={() => props.setShowBrushStudio(false)}
      />
      <Minimap engine={props.engine} />
      <FloatingToolbar
        tool={props.tool}
        setTool={props.setTool}
        brushColor={props.brushColor}
        setBrushColor={props.setBrushColor}
        brushSize={props.brushSize}
        setBrushSize={props.setBrushSize}
        onUndo={props.onUndo}
        onRedo={props.onRedo}
        onClear={props.onClear}
        onExport={props.onExport}
        onSaveCloud={props.onSaveCloud}
        onOpenMyDrawings={props.onOpenMyDrawings}
        isSavingCloud={props.isSavingCloud}
        canUndo={props.canUndo}
        canRedo={props.canRedo}
        isCameraActive={props.isCameraActive}
        onToggleCamera={props.onToggleCamera}
        onOpenBrushStudio={props.onOpenBrushStudio}
      />
    </>
  );
};
