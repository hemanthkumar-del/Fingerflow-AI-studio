import { fabric } from 'fabric';

export interface ShapeConfig {
  color: string;
  size: number;
  opacity: number;
  fill: boolean;
}

export interface ShapePlugin {
  id: string;
  name: string;
  icon: string;
  
  createShape(
    startX: number, 
    startY: number, 
    endX: number, 
    endY: number, 
    config: ShapeConfig
  ): fabric.Object | null;
}
