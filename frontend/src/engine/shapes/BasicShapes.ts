import { fabric } from 'fabric';
import { ShapePlugin, ShapeConfig } from './ShapePlugin';

function getFillAndStroke(config: ShapeConfig) {
  return {
    fill: config.fill ? config.color : 'transparent',
    stroke: config.color,
    strokeWidth: config.size,
    opacity: config.opacity
  };
}

export const RectShape: ShapePlugin = {
  id: 'rect', name: 'Rectangle', icon: '⬛',
  createShape(startX, startY, endX, endY, config) {
    const w = Math.abs(endX - startX);
    const h = Math.abs(endY - startY);
    const l = Math.min(startX, endX);
    const t = Math.min(startY, endY);
    return new fabric.Rect({
      left: l, top: t, width: w, height: h,
      ...getFillAndStroke(config)
    });
  }
};

export const CircleShape: ShapePlugin = {
  id: 'circle', name: 'Circle', icon: '⭕',
  createShape(startX, startY, endX, endY, config) {
    const rx = Math.abs(endX - startX) / 2;
    const ry = Math.abs(endY - startY) / 2;
    const l = Math.min(startX, endX);
    const t = Math.min(startY, endY);
    return new fabric.Ellipse({
      left: l, top: t, rx, ry,
      ...getFillAndStroke(config)
    });
  }
};

export const TriangleShape: ShapePlugin = {
  id: 'triangle', name: 'Triangle', icon: '🔺',
  createShape(startX, startY, endX, endY, config) {
    const w = Math.abs(endX - startX);
    const h = Math.abs(endY - startY);
    const l = Math.min(startX, endX);
    const t = Math.min(startY, endY);
    return new fabric.Triangle({
      left: l, top: t, width: w, height: h,
      ...getFillAndStroke(config)
    });
  }
};

export const LineShape: ShapePlugin = {
  id: 'line', name: 'Line', icon: '➖',
  createShape(startX, startY, endX, endY, config) {
    return new fabric.Line([startX, startY, endX, endY], {
      stroke: config.color,
      strokeWidth: config.size,
      opacity: config.opacity,
      strokeLineCap: 'round'
    });
  }
};

export const ArrowShape: ShapePlugin = {
  id: 'arrow', name: 'Arrow', icon: '↗️',
  createShape(startX, startY, endX, endY, config) {
    const dx = endX - startX;
    const dy = endY - startY;
    const angle = Math.atan2(dy, dx);
    const headlen = 15 + config.size; 

    // Compute triangle points
    const p1 = { x: endX, y: endY };
    const p2 = { x: endX - headlen * Math.cos(angle - Math.PI / 6), y: endY - headlen * Math.sin(angle - Math.PI / 6) };
    const p3 = { x: endX - headlen * Math.cos(angle + Math.PI / 6), y: endY - headlen * Math.sin(angle + Math.PI / 6) };

    const line = new fabric.Line([startX, startY, endX, endY], {
      stroke: config.color,
      strokeWidth: config.size,
      opacity: config.opacity,
      strokeLineCap: 'round'
    });

    const triangle = new fabric.Polygon([p1, p2, p3], {
      fill: config.color,
      opacity: config.opacity,
      originX: 'center',
      originY: 'center',
    });

    return new fabric.Group([line, triangle], {
      originX: 'center',
      originY: 'center',
      left: startX + dx / 2,
      top: startY + dy / 2
    });
  }
};

export const StarShape: ShapePlugin = {
  id: 'star', name: 'Star', icon: '⭐',
  createShape(startX, startY, endX, endY, config) {
    const points = [];
    const spikes = 5;
    const outerRadius = Math.max(Math.abs(endX - startX), Math.abs(endY - startY)) / 2;
    const innerRadius = outerRadius / 2;
    const cx = (startX + endX) / 2;
    const cy = (startY + endY) / 2;
    
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / spikes;

    for (let i = 0; i < spikes; i++) {
        points.push({ x: cx + Math.cos(rot) * outerRadius, y: cy + Math.sin(rot) * outerRadius });
        rot += step;
        points.push({ x: cx + Math.cos(rot) * innerRadius, y: cy + Math.sin(rot) * innerRadius });
        rot += step;
    }
    return new fabric.Polygon(points, {
      ...getFillAndStroke(config),
      left: Math.min(startX, endX),
      top: Math.min(startY, endY),
    });
  }
};
