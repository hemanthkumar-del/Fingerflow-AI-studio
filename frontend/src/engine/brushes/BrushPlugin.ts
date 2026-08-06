import { Point } from '../../services/strokeSmoother';
import { fabric } from 'fabric';

export interface BrushPhysics {
  flow: number;
  scatter: number;
  spacing: number;
  hardness: number;
  jitter: number;
  rotation: number;
}

export interface BrushPlugin {
  id: string;
  name: string;
  category: 'Sketching' | 'Painting' | 'FX' | 'Airbrushing';
  icon: string; // emoji or lucide name
  supportsVelocity: boolean;
  supportsPressure: boolean;
  supportsBlendModes: boolean;
  defaultPhysics: Partial<BrushPhysics>;
  
  createPath(
    points: Point[], 
    color: string, 
    size: number, 
    opacity: number,
    physics: BrushPhysics,
    velocityScale?: number
  ): fabric.Object | fabric.Object[] | null;
}
