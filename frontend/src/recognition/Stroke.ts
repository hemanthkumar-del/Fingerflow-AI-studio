/**
 * Point in 2D space.
 */
export interface Point {
  x: number;
  y: number;
  t?: number; // optional timestamp
}

/**
 * Bounding box of a set of points.
 */
export interface BoundingBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  cx: number; // center x
  cy: number; // center y
}

/**
 * A single pen-down → pen-up stroke from the user.
 */
export interface Stroke {
  points: Point[];
  startPoint: Point;
  endPoint: Point;
  boundingBox: BoundingBox;
  duration: number;        // ms
  pathLength: number;      // total pixel length
  averageVelocity: number; // px/ms
  maxVelocity: number;     // px/ms
}

/**
 * Compute bounding box for a list of points.
 */
export function computeBoundingBox(points: Point[]): BoundingBox {
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
  for (const p of points) {
    if (p.x < left) left = p.x;
    if (p.y < top) top = p.y;
    if (p.x > right) right = p.x;
    if (p.y > bottom) bottom = p.y;
  }
  if (!isFinite(left)) { left = 0; top = 0; right = 0; bottom = 0; }
  const width = right - left;
  const height = bottom - top;
  return { left, top, right, bottom, width, height, cx: left + width / 2, cy: top + height / 2 };
}

/**
 * Build a Stroke object from a sequence of raw screen points.
 */
export function buildStroke(points: Point[]): Stroke | null {
  if (points.length < 2) return null;

  const startPoint = points[0];
  const endPoint = points[points.length - 1];
  const boundingBox = computeBoundingBox(points);

  const startTime = points[0].t ?? 0;
  const endTime = points[points.length - 1].t ?? 0;
  const duration = endTime - startTime;

  let pathLength = 0;
  let maxVelocity = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const seg = Math.sqrt(dx * dx + dy * dy);
    pathLength += seg;
    const dt = ((points[i].t ?? 0) - (points[i - 1].t ?? 0)) || 16;
    const v = seg / dt;
    if (v > maxVelocity) maxVelocity = v;
  }

  const averageVelocity = duration > 0 ? pathLength / duration : 0;

  return { points, startPoint, endPoint, boundingBox, duration, pathLength, averageVelocity, maxVelocity };
}
