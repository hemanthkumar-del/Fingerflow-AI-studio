import { Stroke, computeBoundingBox } from './Stroke';
import type { Point } from './Stroke';

/**
 * Resample a path of points to exactly N equidistant points.
 */
function resample(points: Point[], n: number): Point[] {
  if (points.length === 0) return [];
  if (points.length === 1) return Array(n).fill({ ...points[0] });

  // Compute total length
  let totalLength = 0;
  const segLengths: number[] = [];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const len = Math.sqrt(dx * dx + dy * dy);
    segLengths.push(len);
    totalLength += len;
  }

  const interval = totalLength / (n - 1);
  const result: Point[] = [{ x: points[0].x, y: points[0].y }];
  let D = 0;
  let i = 1;

  while (result.length < n && i < points.length) {
    const seg = segLengths[i - 1];
    if (D + seg >= interval) {
      const t = (interval - D) / seg;
      const qx = points[i - 1].x + t * (points[i].x - points[i - 1].x);
      const qy = points[i - 1].y + t * (points[i].y - points[i - 1].y);
      const q: Point = { x: qx, y: qy };
      result.push(q);
      points = [q, ...points.slice(i)];
      segLengths.splice(0, i - 1);
      i = 1;
      D = 0;
    } else {
      D += seg;
      i++;
    }
  }

  // Pad if needed
  while (result.length < n) {
    result.push({ ...points[points.length - 1] });
  }

  return result.slice(0, n);
}

/**
 * Translate points so centroid is at origin.
 */
function translateToOrigin(points: Point[]): Point[] {
  const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
  const cy = points.reduce((s, p) => s + p.y, 0) / points.length;
  return points.map(p => ({ x: p.x - cx, y: p.y - cy }));
}

/**
 * Scale points to fit within [-1, 1] x [-1, 1] while preserving aspect ratio.
 */
function scaleTo1x1(points: Point[]): Point[] {
  let maxDim = 0;
  for (const p of points) {
    if (Math.abs(p.x) > maxDim) maxDim = Math.abs(p.x);
    if (Math.abs(p.y) > maxDim) maxDim = Math.abs(p.y);
  }
  if (maxDim === 0) return points;
  return points.map(p => ({ x: p.x / maxDim, y: p.y / maxDim }));
}

export interface NormalizedStroke {
  /** 64 resampled, translated, scaled points */
  points: Point[];
  /** Aspect ratio (width/height) of original bounding box */
  aspectRatio: number;
  /** Indicative angle for optional rotation alignment */
  indicativeAngle: number;
}

export interface NormalizedCharacter {
  strokes: NormalizedStroke[];
  combinedPoints: Point[]; // all strokes concatenated for single-stroke comparison
  overallAspectRatio: number;
  strokeCount: number;
}

const RESAMPLE_N = 64;

/**
 * Normalize a single stroke for recognition comparison.
 */
export function normalizeStroke(stroke: Stroke): NormalizedStroke {
  let pts = resample(stroke.points, RESAMPLE_N);
  const bb = computeBoundingBox(pts);
  const aspectRatio = bb.height > 0 ? bb.width / bb.height : 1;
  pts = translateToOrigin(pts);
  pts = scaleTo1x1(pts);

  // Indicative angle: angle from centroid to first resampled point
  const indicativeAngle = Math.atan2(pts[0].y, pts[0].x);

  return { points: pts, aspectRatio, indicativeAngle };
}

/**
 * Normalize a complete multi-stroke character for recognition.
 */
export function normalizeCharacter(strokes: Stroke[]): NormalizedCharacter {
  if (strokes.length === 0) {
    return { strokes: [], combinedPoints: [], overallAspectRatio: 1, strokeCount: 0 };
  }

  const normalizedStrokes = strokes.map(normalizeStroke);

  // Build a combined path of all strokes (for $1-style matching on multi-stroke chars)
  const combined: Point[] = [];
  for (const ns of normalizedStrokes) {
    combined.push(...ns.points);
  }
  const combinedResampled = resample(combined, RESAMPLE_N);
  const translatedCombined = scaleTo1x1(translateToOrigin(combinedResampled));

  // Overall bounding box from original strokes
  const allPoints = strokes.flatMap(s => s.points);
  const bb = computeBoundingBox(allPoints);
  const overallAspectRatio = bb.height > 0 ? bb.width / bb.height : 1;

  return {
    strokes: normalizedStrokes,
    combinedPoints: translatedCombined,
    overallAspectRatio,
    strokeCount: strokes.length,
  };
}

export { resample };
