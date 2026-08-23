export interface Point {
  x: number;
  y: number;
}

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

export class WritingStabilizer {
  private filterX: OneEuroFilter;
  private filterY: OneEuroFilter;

  constructor() {
    // 60Hz assumed frequency, mincutoff=1.5 (more smoothing at slow speeds), beta=0.1 (responsive at fast speeds)
    this.filterX = new OneEuroFilter(60, 1.5, 0.1, 1.0);
    this.filterY = new OneEuroFilter(60, 1.5, 0.1, 1.0);
  }

  public filter(rawX: number, rawY: number, timestamp: number = -1): Point {
    const smoothX = this.filterX.filter(rawX, timestamp);
    const smoothY = this.filterY.filter(rawY, timestamp);
    return { x: smoothX, y: smoothY };
  }

  public reset(): void {
    this.filterX.reset();
    this.filterY.reset();
  }
}
