import { Point } from '../../services/strokeSmoother';
import { fabric } from 'fabric';

export class ShapeRecognizer {
  
  /**
   * Returns a basic shape plugin ID ('circle', 'rect', 'triangle', 'line') 
   * or null if the stroke isn't recognized as a perfect shape.
   */
  public static recognize(points: Point[]): string | null {
    if (points.length < 10) return null;

    const start = points[0];
    const end = points[points.length - 1];
    
    // Distance between start and end
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    points.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    });

    const width = maxX - minX;
    const height = maxY - minY;
    const boundingBoxPerimeter = (width + height) * 2;
    
    let pathLength = 0;
    for (let i = 1; i < points.length; i++) {
      const p1 = points[i-1];
      const p2 = points[i];
      pathLength += Math.sqrt((p2.x-p1.x)**2 + (p2.y-p1.y)**2);
    }

    // Heuristics
    // 1. Line
    if (width > 20 || height > 20) {
      if (dist > pathLength * 0.9) return 'line';
    }

    // If it's closed (start and end are near each other)
    const maxDimension = Math.max(width, height);
    if (dist < maxDimension * 0.2) { // 20% tolerance for closure
      
      // Circle vs Rect vs Triangle
      // Circle perimeter = PI * diameter
      const avgDiameter = (width + height) / 2;
      const circlePerimeter = Math.PI * avgDiameter;
      
      if (Math.abs(pathLength - circlePerimeter) < circlePerimeter * 0.15) {
        return 'circle';
      }

      if (Math.abs(pathLength - boundingBoxPerimeter) < boundingBoxPerimeter * 0.15) {
        return 'rect';
      }

      // Triangle (roughly)
      // Triangle perimeter is less than bounding box perimeter, but more than circle?
      // A simple heuristic: if it's closed but not a circle or rect, assume triangle for now.
      return 'triangle';
    }

    return null;
  }
}
