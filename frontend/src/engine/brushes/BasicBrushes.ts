import { BrushPlugin, BrushPhysics } from './BrushPlugin';
import { StrokeSmoother, Point } from '../../services/strokeSmoother';
import { fabric } from 'fabric';

const defaultPhysics: BrushPhysics = {
  flow: 1,
  scatter: 0,
  spacing: 1,
  hardness: 1,
  jitter: 0,
  rotation: 0
};

export const PencilBrushPlugin: BrushPlugin = {
  id: 'pencil',
  name: 'Pencil',
  category: 'Sketching',
  icon: '✏️',
  supportsVelocity: true,
  supportsPressure: true,
  supportsBlendModes: false,
  defaultPhysics: { ...defaultPhysics },

  createPath(points: Point[], color: string, size: number, opacity: number, physics: BrushPhysics, velocityScale?: number) {
    if (points.length < 2) return null;
    const svgPath = StrokeSmoother.pointsToSvgPath(points);
    const width = velocityScale !== undefined ? Math.max(1, size * velocityScale) : size;
    return new fabric.Path(svgPath, {
      stroke: color,
      strokeWidth: width,
      fill: '',
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
      opacity: opacity * physics.flow
    });
  }
};

export const NeonBrushPlugin: BrushPlugin = {
  id: 'neon',
  name: 'Neon Tube',
  category: 'FX',
  icon: '✨',
  supportsVelocity: true,
  supportsPressure: false,
  supportsBlendModes: true,
  defaultPhysics: { ...defaultPhysics, flow: 0.8 },

  createPath(points: Point[], color: string, size: number, opacity: number, physics: BrushPhysics, velocityScale?: number) {
    if (points.length < 2) return null;
    const svgPath = StrokeSmoother.pointsToSvgPath(points);
    const width = velocityScale !== undefined ? Math.max(2, size * velocityScale) : size;
    
    // Core white line
    const core = new fabric.Path(svgPath, {
      stroke: '#ffffff',
      strokeWidth: width * 0.4,
      fill: '',
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
      opacity: opacity
    });

    // Outer glow line
    const glow = new fabric.Path(svgPath, {
      stroke: color,
      strokeWidth: width,
      fill: '',
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
      opacity: opacity * physics.flow,
      shadow: new fabric.Shadow({
        color: color,
        blur: width * 2,
        offsetX: 0,
        offsetY: 0
      })
    });

    // Fabric group doesn't work well for free drawing paths due to bounding box issues,
    // so we return an array of objects. Our CanvasManager will need to handle arrays!
    return [glow, core];
  }
};

export const CalligraphyBrushPlugin: BrushPlugin = {
  id: 'calligraphy',
  name: 'Calligraphy Pen',
  category: 'Painting',
  icon: '✒️',
  supportsVelocity: true,
  supportsPressure: true,
  supportsBlendModes: false,
  defaultPhysics: { ...defaultPhysics, rotation: 45 },

  createPath(points: Point[], color: string, size: number, opacity: number, physics: BrushPhysics, velocityScale?: number) {
    if (points.length < 2) return null;
    
    // Instead of a single path, calligraphy uses parallel strokes or a customized shape.
    // A simple programmatic approximation: an elliptical path or offset duplicated paths.
    // For performance, we'll draw 3 offset paths mimicking a flat nib.
    
    const angleRad = (physics.rotation * Math.PI) / 180;
    const offsetX = Math.cos(angleRad) * size * 0.5;
    const offsetY = Math.sin(angleRad) * size * 0.5;

    const paths = [-1, 0, 1].map(mult => {
      const offsetPoints = points.map(p => ({
        x: p.x + offsetX * mult,
        y: p.y + offsetY * mult
      }));
      const svgPath = StrokeSmoother.pointsToSvgPath(offsetPoints);
      return new fabric.Path(svgPath, {
        stroke: color,
        strokeWidth: size * 0.3, // thin lines
        fill: '',
        strokeLineCap: 'square',
        strokeLineJoin: 'miter',
        opacity: opacity * physics.flow
      });
    });

    return paths;
  }
};

export const InkBrushPlugin: BrushPlugin = {
  id: 'ink', name: 'Ink Pen', category: 'Painting', icon: '🖋️',
  supportsVelocity: true, supportsPressure: true, supportsBlendModes: false,
  defaultPhysics: { ...defaultPhysics, flow: 0.9, hardness: 0.8 },
  createPath(points, color, size, opacity, physics, velocityScale) {
    if (points.length < 2) return null;
    const svgPath = StrokeSmoother.pointsToSvgPath(points);
    const width = velocityScale !== undefined ? size * velocityScale : size;
    return new fabric.Path(svgPath, {
      stroke: color, strokeWidth: width, fill: '',
      strokeLineCap: 'round', strokeLineJoin: 'round', opacity: opacity * physics.flow
    });
  }
};

export const MarkerBrushPlugin: BrushPlugin = {
  id: 'marker', name: 'Marker', category: 'Airbrushing', icon: '🖍️',
  supportsVelocity: false, supportsPressure: true, supportsBlendModes: true,
  defaultPhysics: { ...defaultPhysics, flow: 0.7 },
  createPath(points, color, size, opacity, physics) {
    if (points.length < 2) return null;
    const svgPath = StrokeSmoother.pointsToSvgPath(points);
    return new fabric.Path(svgPath, {
      stroke: color, strokeWidth: size, fill: '',
      strokeLineCap: 'square', strokeLineJoin: 'bevel', opacity: opacity * physics.flow
    });
  }
};

export const ChalkBrushPlugin: BrushPlugin = {
  id: 'chalk', name: 'Chalk', category: 'Sketching', icon: '📝',
  supportsVelocity: true, supportsPressure: true, supportsBlendModes: false,
  defaultPhysics: { ...defaultPhysics, scatter: 0.5, flow: 0.8 },
  createPath(points, color, size, opacity, physics) {
    if (points.length < 2) return null;
    const paths: fabric.Object[] = [];
    const pointsCount = Math.floor(points.length * physics.scatter);
    for (let i = 0; i < pointsCount; i++) {
      const p = points[Math.floor(Math.random() * points.length)];
      const ox = (Math.random() - 0.5) * size;
      const oy = (Math.random() - 0.5) * size;
      const r = new fabric.Rect({
        left: p.x + ox, top: p.y + oy, width: size/4, height: size/4,
        fill: color, opacity: opacity * physics.flow, selectable: false, evented: false
      });
      paths.push(r);
    }
    return paths;
  }
};

export const PixelBrushPlugin: BrushPlugin = {
  id: 'pixel', name: 'Pixel Art', category: 'Sketching', icon: '👾',
  supportsVelocity: false, supportsPressure: false, supportsBlendModes: false,
  defaultPhysics: { ...defaultPhysics, hardness: 1 },
  createPath(points, color, size, opacity) {
    if (points.length < 2) return null;
    const paths: fabric.Object[] = [];
    const pixelSize = Math.max(1, Math.round(size / 4));
    points.forEach(p => {
      const px = Math.round(p.x / pixelSize) * pixelSize;
      const py = Math.round(p.y / pixelSize) * pixelSize;
      paths.push(new fabric.Rect({
        left: px, top: py, width: pixelSize, height: pixelSize,
        fill: color, opacity: opacity, selectable: false, evented: false
      }));
    });
    return paths;
  }
};

export const WatercolorBrushPlugin: BrushPlugin = {
  id: 'watercolor', name: 'Watercolor', category: 'Painting', icon: '🎨',
  supportsVelocity: true, supportsPressure: true, supportsBlendModes: true,
  defaultPhysics: { ...defaultPhysics, flow: 0.3, scatter: 0.2 },
  createPath(points, color, size, opacity, physics) {
    if (points.length < 2) return null;
    const paths: fabric.Object[] = [];
    points.forEach(p => {
      paths.push(new fabric.Circle({
        left: p.x - size/2, top: p.y - size/2, radius: size/2 + (Math.random() * size * physics.scatter),
        fill: color, opacity: opacity * physics.flow * 0.1, selectable: false, evented: false
      }));
    });
    return paths;
  }
};

export const AirbrushPlugin: BrushPlugin = {
  id: 'airbrush', name: 'Airbrush', category: 'Airbrushing', icon: '💨',
  supportsVelocity: true, supportsPressure: true, supportsBlendModes: false,
  defaultPhysics: { ...defaultPhysics, flow: 0.1, hardness: 0 },
  createPath(points, color, size, opacity, physics, velocityScale) {
    if (points.length < 2) return null;
    const svgPath = StrokeSmoother.pointsToSvgPath(points);
    const width = velocityScale !== undefined ? size * velocityScale : size;
    return new fabric.Path(svgPath, {
      stroke: color, strokeWidth: width, fill: '',
      strokeLineCap: 'round', strokeLineJoin: 'round', opacity: opacity * physics.flow,
      shadow: new fabric.Shadow({ color: color, blur: width, offsetX: 0, offsetY: 0 })
    });
  }
};

export const SprayBrushPlugin: BrushPlugin = {
  id: 'spray', name: 'Spray Can', category: 'Airbrushing', icon: '🎨',
  supportsVelocity: true, supportsPressure: true, supportsBlendModes: false,
  defaultPhysics: { ...defaultPhysics, scatter: 0.8, flow: 0.5 },
  createPath(points, color, size, opacity, physics) {
    if (points.length < 2) return null;
    const paths: fabric.Object[] = [];
    points.forEach(p => {
      for(let i=0; i<3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (size / 2) * physics.scatter;
        paths.push(new fabric.Circle({
          left: p.x + Math.cos(angle)*radius, top: p.y + Math.sin(angle)*radius,
          radius: Math.random() * 2, fill: color, opacity: opacity * physics.flow,
          selectable: false, evented: false
        }));
      }
    });
    return paths;
  }
};

export const RibbonBrushPlugin: BrushPlugin = {
  id: 'ribbon', name: 'Ribbon', category: 'FX', icon: '🎀',
  supportsVelocity: true, supportsPressure: true, supportsBlendModes: false,
  defaultPhysics: { ...defaultPhysics, flow: 0.9 },
  createPath(points, color, size, opacity, physics, velocityScale) {
    if (points.length < 2) return null;
    const paths: fabric.Object[] = [];
    const width = velocityScale !== undefined ? size * velocityScale : size;
    // Simple programmatic ribbon: oscillating offsets
    const offset = Math.sin(Date.now() / 100) * width;
    const ribbonPoints = points.map(p => ({ x: p.x + offset, y: p.y - offset }));
    const svgPath = StrokeSmoother.pointsToSvgPath(ribbonPoints);
    paths.push(new fabric.Path(svgPath, {
      stroke: color, strokeWidth: width * 0.5, fill: '',
      strokeLineCap: 'round', strokeLineJoin: 'round', opacity: opacity * physics.flow
    }));
    return paths;
  }
};

export const GlowBrushPlugin: BrushPlugin = {
  id: 'glow', name: 'Glow FX', category: 'FX', icon: '🌟',
  supportsVelocity: true, supportsPressure: false, supportsBlendModes: true,
  defaultPhysics: { ...defaultPhysics, flow: 0.5 },
  createPath(points, color, size, opacity, physics) {
    if (points.length < 2) return null;
    const svgPath = StrokeSmoother.pointsToSvgPath(points);
    return new fabric.Path(svgPath, {
      stroke: color, strokeWidth: size, fill: '',
      strokeLineCap: 'round', strokeLineJoin: 'round', opacity: opacity * physics.flow,
      shadow: new fabric.Shadow({ color: color, blur: size * 3, offsetX: 0, offsetY: 0 })
    });
  }
};
