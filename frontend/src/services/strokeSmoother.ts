export interface Point {
  x: number;
  y: number;
}

export class StrokeSmoother {
  private smoothedX: number | null = null;
  private smoothedY: number | null = null;
  private alpha: number;

  constructor(alpha: number = 0.35) {
    this.alpha = alpha;
  }

  /**
   * Filter new coordinate using Exponential Moving Average (EMA).
   */
  public filter(rawX: number, rawY: number): Point {
    if (this.smoothedX === null || this.smoothedY === null) {
      this.smoothedX = rawX;
      this.smoothedY = rawY;
    } else {
      this.smoothedX = this.alpha * rawX + (1 - this.alpha) * this.smoothedX;
      this.smoothedY = this.alpha * rawY + (1 - this.alpha) * this.smoothedY;
    }

    return { x: this.smoothedX, y: this.smoothedY };
  }

  /**
   * Reset filter state when starting a new stroke segment.
   */
  public reset(): void {
    this.smoothedX = null;
    this.smoothedY = null;
  }

  /**
   * Convert array of points into a smooth SVG quadratic Bézier path command string.
   */
  public static pointsToSvgPath(points: Point[]): string {
    if (!points || points.length === 0) return '';
    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.1} ${points[0].y + 0.1}`;
    }

    let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      path += ` Q ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)}, ${xc.toFixed(1)} ${yc.toFixed(1)}`;
    }

    // Connect to the final point
    const lastPoint = points[points.length - 1];
    path += ` L ${lastPoint.x.toFixed(1)} ${lastPoint.y.toFixed(1)}`;

    return path;
  }
}
