import type { Point } from './Stroke';
import type { NormalizedCharacter, NormalizedStroke } from './StrokeNormalizer';

/**
 * 8-direction histogram of movement directions.
 * Bins: 0=E, 1=NE, 2=N, 3=NW, 4=W, 5=SW, 6=S, 7=SE
 */
export function directionHistogram(points: Point[]): number[] {
  const hist = new Array(8).fill(0);
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    if (Math.abs(dx) < 1e-9 && Math.abs(dy) < 1e-9) continue;
    let angle = Math.atan2(-dy, dx); // Note: y-axis flipped for screen coords
    if (angle < 0) angle += 2 * Math.PI;
    const bin = Math.floor((angle / (2 * Math.PI)) * 8) % 8;
    hist[bin]++;
  }
  const total = hist.reduce((a, b) => a + b, 0);
  if (total > 0) return hist.map(v => v / total);
  return hist;
}

/**
 * Count the number of significant direction changes (corners).
 */
export function countCorners(points: Point[], threshold = 0.4): number {
  let corners = 0;
  for (let i = 2; i < points.length; i++) {
    const dx1 = points[i - 1].x - points[i - 2].x;
    const dy1 = points[i - 1].y - points[i - 2].y;
    const dx2 = points[i].x - points[i - 1].x;
    const dy2 = points[i].y - points[i - 1].y;
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    if (len1 < 1e-9 || len2 < 1e-9) continue;
    const dot = (dx1 * dx2 + dy1 * dy2) / (len1 * len2);
    if (dot < threshold) corners++;
  }
  return corners;
}

/**
 * Compute approximate vertical symmetry score.
 * Returns 0 (none) to 1 (perfect vertical symmetry).
 */
export function verticalSymmetry(points: Point[]): number {
  let totalDiff = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const mirror = points[n - 1 - i];
    const diff = Math.abs(points[i].y - mirror.y);
    totalDiff += diff;
  }
  // Normalize: perfect symmetry = 0, max diff = 2 (in [-1,1] space)
  const avgDiff = totalDiff / n;
  return Math.max(0, 1 - avgDiff / 2);
}

/**
 * Estimate horizontal symmetry (left-right mirroring).
 */
export function horizontalSymmetry(points: Point[]): number {
  let totalDiff = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const mirror = points[n - 1 - i];
    const diff = Math.abs(points[i].x - (-mirror.x));
    totalDiff += diff;
  }
  const avgDiff = totalDiff / n;
  return Math.max(0, 1 - avgDiff / 2);
}

/**
 * Whether the stroke is predominantly vertical (taller than wide).
 */
export function isVertical(aspectRatio: number): boolean {
  return aspectRatio < 0.6;
}

/**
 * Whether the stroke is predominantly horizontal.
 */
export function isHorizontal(aspectRatio: number): boolean {
  return aspectRatio > 1.8;
}

/**
 * The angle from start to end point.
 */
export function overallAngle(points: Point[]): number {
  if (points.length < 2) return 0;
  const dx = points[points.length - 1].x - points[0].x;
  const dy = points[points.length - 1].y - points[0].y;
  return Math.atan2(dy, dx);
}

/**
 * Whether the path is closed (start and end close together).
 */
export function isClosed(points: Point[], threshold = 0.3): boolean {
  if (points.length < 3) return false;
  const dx = points[0].x - points[points.length - 1].x;
  const dy = points[0].y - points[points.length - 1].y;
  return Math.sqrt(dx * dx + dy * dy) < threshold;
}

/**
 * Compute point-by-point distance between two normalized paths.
 * Lower = more similar.
 */
export function pathDistance(a: Point[], b: Point[]): number {
  const n = Math.min(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const dx = a[i].x - b[i].x;
    const dy = a[i].y - b[i].y;
    sum += Math.sqrt(dx * dx + dy * dy);
  }
  return sum / n;
}

/**
 * Golden-section search to find the best rotation alignment.
 * Returns minimum distance after rotating 'a' to best match 'b'.
 */
export function distanceAtBestAngle(
  a: Point[],
  b: Point[],
  minAngle = -Math.PI / 4,
  maxAngle = Math.PI / 4,
): number {
  const phi = 0.5 * (-1 + Math.sqrt(5));
  let x1 = phi * minAngle + (1 - phi) * maxAngle;
  let x2 = (1 - phi) * minAngle + phi * maxAngle;
  let f1 = pathDistance(rotate(a, x1), b);
  let f2 = pathDistance(rotate(a, x2), b);

  const tolerance = 0.001;
  while (Math.abs(maxAngle - minAngle) > tolerance) {
    if (f1 < f2) {
      maxAngle = x2;
      x2 = x1;
      f2 = f1;
      x1 = phi * minAngle + (1 - phi) * maxAngle;
      f1 = pathDistance(rotate(a, x1), b);
    } else {
      minAngle = x1;
      x1 = x2;
      f1 = f2;
      x2 = (1 - phi) * minAngle + phi * maxAngle;
      f2 = pathDistance(rotate(a, x2), b);
    }
  }
  return Math.min(f1, f2);
}

function rotate(points: Point[], angle: number): Point[] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return points.map(p => ({
    x: p.x * cos - p.y * sin,
    y: p.x * sin + p.y * cos,
  }));
}

/**
 * Full feature vector for a normalized character.
 */
export interface FeatureVector {
  /** Direction histogram of combined path */
  dirHist: number[];
  /** Aspect ratio */
  aspectRatio: number;
  /** Number of strokes */
  strokeCount: number;
  /** Is the combined path closed? */
  closed: boolean;
  /** Approximate corner count (normalized 0-1) */
  cornerRatio: number;
  /** Vertical symmetry */
  vSymmetry: number;
  /** Horizontal symmetry */
  hSymmetry: number;
  /** Overall angle of first stroke */
  firstStrokeAngle: number;
  /** Overall angle of last stroke */
  lastStrokeAngle: number;
  /** Combined path points (for $1-style matching) */
  combinedPoints: Point[];
  /** Per-stroke direction histograms */
  strokeDirHists: number[][];
}

export function extractFeatures(char: NormalizedCharacter): FeatureVector {
  const dirHist = directionHistogram(char.combinedPoints);
  const closed = isClosed(char.combinedPoints, 0.25);
  const corners = countCorners(char.combinedPoints, 0.2);
  const cornerRatio = Math.min(1, corners / 20);
  const vSymmetry = verticalSymmetry(char.combinedPoints);
  const hSymmetry = horizontalSymmetry(char.combinedPoints);

  const strokeDirHists = char.strokes.map(s => directionHistogram(s.points));

  const firstStrokeAngle = char.strokes.length > 0
    ? overallAngle(char.strokes[0].points) : 0;
  const lastStrokeAngle = char.strokes.length > 1
    ? overallAngle(char.strokes[char.strokes.length - 1].points)
    : firstStrokeAngle;

  return {
    dirHist,
    aspectRatio: char.overallAspectRatio,
    strokeCount: char.strokeCount,
    closed,
    cornerRatio,
    vSymmetry,
    hSymmetry,
    firstStrokeAngle,
    lastStrokeAngle,
    combinedPoints: char.combinedPoints,
    strokeDirHists,
  };
}
