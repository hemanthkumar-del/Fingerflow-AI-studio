export interface Point {
  x: number;
  y: number;
}

/**
 * 1€ Filter (One Euro Filter) implementation.
 * Adaptive low-pass filter for noisy input.
 */
class OneEuroFilter {
  private freq: number;
  private mincutoff: number;
  private beta: number;
  private dcutoff: number;
  private x: number | null = null;
  private dx: number = 0;
  private lastTime: number = -1;

  constructor(freq: number, mincutoff: number = 1.0, beta: number = 0.0, dcutoff: number = 1.0) {
    this.freq = freq;
    this.mincutoff = mincutoff;
    this.beta = beta;
    this.dcutoff = dcutoff;
  }

  private alpha(cutoff: number): number {
    const tau = 1.0 / (2 * Math.PI * cutoff);
    const te = 1.0 / this.freq;
    return 1.0 / (1.0 + tau / te);
  }

  public filter(value: number, timestamp: number = -1): number {
    if (this.lastTime === -1 || timestamp === -1) {
      this.lastTime = timestamp !== -1 ? timestamp : performance.now();
      this.x = value;
      this.dx = 0;
      return value;
    }

    const dt = timestamp !== -1 ? (timestamp - this.lastTime) / 1000.0 : 1.0 / this.freq;
    this.lastTime = timestamp !== -1 ? timestamp : performance.now();

    if (dt <= 0) return this.x as number;

    const dx = (value - (this.x as number)) / dt;
    const edx = this.alpha(this.dcutoff) * dx + (1 - this.alpha(this.dcutoff)) * this.dx;
    this.dx = edx;

    const cutoff = this.mincutoff + this.beta * Math.abs(edx);
    const a = this.alpha(cutoff);
    const result = a * value + (1 - a) * (this.x as number);
    this.x = result;

    return result;
  }

  public reset(): void {
    this.x = null;
    this.dx = 0;
    this.lastTime = -1;
  }
}

/**
 * Very basic Kalman Filter for 2D Point prediction and smoothing
 */
class KalmanFilter2D {
  private x: number = 0;
  private y: number = 0;
  private p: number = 1;
  private q: number = 0.01; // Process noise
  private r: number = 0.1;  // Measurement noise
  private initialized: boolean = false;

  public filter(rawX: number, rawY: number): Point {
    if (!this.initialized) {
      this.x = rawX;
      this.y = rawY;
      this.p = 1;
      this.initialized = true;
      return { x: this.x, y: this.y };
    }

    // Prediction update
    this.p = this.p + this.q;

    // Measurement update
    const k = this.p / (this.p + this.r);
    this.x = this.x + k * (rawX - this.x);
    this.y = this.y + k * (rawY - this.y);
    this.p = (1 - k) * this.p;

    return { x: this.x, y: this.y };
  }

  public reset(): void {
    this.initialized = false;
  }
}

export class StrokeSmoother {
  private filterX: OneEuroFilter;
  private filterY: OneEuroFilter;
  private kalman: KalmanFilter2D;

  constructor() {
    // 60Hz assumed frequency, min cutoff 1.0Hz (smooths slow), beta 0.05 (reduces lag fast)
    this.filterX = new OneEuroFilter(60, 1.0, 0.05, 1.0);
    this.filterY = new OneEuroFilter(60, 1.0, 0.05, 1.0);
    this.kalman = new KalmanFilter2D();
  }

  /**
   * Filter new coordinate using One Euro + Kalman Filter Pipeline.
   */
  public filter(rawX: number, rawY: number, timestamp: number = -1): Point {
    // 1. One Euro Filter for adaptive smoothing (low-pass)
    const smoothX = this.filterX.filter(rawX, timestamp);
    const smoothY = this.filterY.filter(rawY, timestamp);

    // 2. Kalman Filter for prediction and stabilization against drops
    const finalPoint = this.kalman.filter(smoothX, smoothY);

    return finalPoint;
  }

  /**
   * Reset filter state when starting a new stroke segment.
   */
  public reset(): void {
    this.filterX.reset();
    this.filterY.reset();
    this.kalman.reset();
  }

  /**
   * Convert array of points into a smooth SVG Cubic Bézier path command string.
   * Uses a Catmull-Rom to Cubic Bezier conversion for perfectly smooth strokes.
   */
  public static pointsToSvgPath(points: Point[]): string {
    if (!points || points.length === 0) return '';
    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.1} ${points[0].y + 0.1}`;
    }
    if (points.length === 2) {
      return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    }

    let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      // Tension parameter for Catmull-Rom (0.0 to 1.0, typical 1/6 for smooth curves)
      const tension = 1 / 6;

      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;

      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }

    return path;
  }
}
