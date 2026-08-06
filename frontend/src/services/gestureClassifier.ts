export type GestureType = 'DRAW' | 'PAUSE' | 'PINCH' | 'NONE';

export interface FingerState {
  thumb: boolean;
  index: boolean;
  middle: boolean;
  ring: boolean;
  pinky: boolean;
}

export interface GestureResult {
  gesture: GestureType;
  pinchDistance?: number;
  confidence: number;
  fingerState: FingerState;
  velocity: number;
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export function getDistance(p1: Landmark, p2: Landmark): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export class GestureEngine {
  private lastGesture: GestureType = 'NONE';
  private gestureStartTime: number = -1;
  private debounceMs: number = 200; // Temporal debounce
  private lastLandmarks: Landmark[] | null = null;
  private lastTime: number = -1;
  private currentVelocity: number = 0;

  public update(landmarks: Landmark[], timestamp: number = performance.now()): GestureResult {
    if (!landmarks || landmarks.length < 21) {
      return this.resetResult();
    }

    // Calculate Velocity
    if (this.lastLandmarks && this.lastTime !== -1) {
      const dt = timestamp - this.lastTime;
      if (dt > 0) {
        const dist = getDistance(landmarks[8], this.lastLandmarks[8]); // Index tip velocity
        this.currentVelocity = (dist / dt) * 1000; // units per second
      }
    }
    this.lastLandmarks = landmarks;
    this.lastTime = timestamp;

    const handScale = getDistance(landmarks[0], landmarks[9]) || 1;

    // 5-Finger Binary State Machine (Thresholding based on wrist distance)
    // A finger is extended if its tip is further from the wrist than its PIP joint
    const wrist = landmarks[0];
    const fingerState: FingerState = {
      thumb: getDistance(wrist, landmarks[4]) > getDistance(wrist, landmarks[3]),
      index: getDistance(wrist, landmarks[8]) > getDistance(wrist, landmarks[6]),
      middle: getDistance(wrist, landmarks[12]) > getDistance(wrist, landmarks[10]),
      ring: getDistance(wrist, landmarks[16]) > getDistance(wrist, landmarks[14]),
      pinky: getDistance(wrist, landmarks[20]) > getDistance(wrist, landmarks[18]),
    };

    const rawPinchDist = getDistance(landmarks[4], landmarks[8]);
    const normalizedPinchDist = rawPinchDist / handScale;

    // Determine Candidate Gesture
    let candidateGesture: GestureType = 'NONE';
    let candidateConfidence = 0.5;

    // Hysteresis for Pinch (easier to stay in PINCH than to enter it)
    const pinchThreshold = this.lastGesture === 'PINCH' ? 0.45 : 0.35;

    if (normalizedPinchDist < pinchThreshold) {
      candidateGesture = 'PINCH';
      // Confidence approaches 1.0 as distance approaches 0
      candidateConfidence = Math.max(0.6, 1.0 - (normalizedPinchDist / pinchThreshold) * 0.4);
    } 
    else if (fingerState.index && fingerState.middle && fingerState.ring && fingerState.pinky) {
      // PAUSE (Open Palm)
      candidateGesture = 'PAUSE';
      candidateConfidence = 0.9;
    } 
    else if (fingerState.index && !fingerState.middle && !fingerState.ring && !fingerState.pinky) {
      // DRAW (Index extended, others folded)
      candidateGesture = 'DRAW';
      candidateConfidence = 0.95;
    }

    // Temporal Debounce & Cooldown
    if (candidateGesture !== this.lastGesture) {
      if (this.gestureStartTime === -1) {
        // Start timing the candidate gesture
        this.gestureStartTime = timestamp;
        return {
          gesture: this.lastGesture, // Return old gesture until debounce passes
          confidence: candidateConfidence,
          pinchDistance: this.lastGesture === 'PINCH' ? normalizedPinchDist : undefined,
          fingerState,
          velocity: this.currentVelocity
        };
      } else if (timestamp - this.gestureStartTime >= this.debounceMs) {
        // Debounce passed, accept new gesture
        this.lastGesture = candidateGesture;
        this.gestureStartTime = -1;
      } else {
        // Still waiting for debounce
        return {
          gesture: this.lastGesture,
          confidence: candidateConfidence,
          pinchDistance: this.lastGesture === 'PINCH' ? normalizedPinchDist : undefined,
          fingerState,
          velocity: this.currentVelocity
        };
      }
    } else {
      // Candidate gesture matches current, reset timer
      this.gestureStartTime = -1;
    }

    return {
      gesture: this.lastGesture,
      confidence: candidateConfidence,
      pinchDistance: this.lastGesture === 'PINCH' ? normalizedPinchDist : undefined,
      fingerState,
      velocity: this.currentVelocity
    };
  }

  private resetResult(): GestureResult {
    return {
      gesture: 'NONE',
      confidence: 0,
      fingerState: { thumb: false, index: false, middle: false, ring: false, pinky: false },
      velocity: 0
    };
  }
}
