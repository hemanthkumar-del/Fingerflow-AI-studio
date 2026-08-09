import { GestureRegistry, GestureDefinition, GestureAction } from './gestureRegistry';
import { SettingsManager } from './gestureSettings';

export type GestureType = 'DRAW' | 'PAUSE' | 'PINCH' | 'NONE' | GestureAction;

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
  handCount: number;
  primaryHand: 'Left' | 'Right' | 'None';
  candidateGestures: string[]; // Names of gestures that are being evaluated
  cooldownActive: boolean;
  actionTriggered?: GestureDefinition; // If an intelligent gesture just passed debounce and cooldown
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
  private lastContinuousGesture: GestureType = 'NONE';
  private continuousStartTime: number = -1;
  private lastLandmarks: Landmark[] | null = null;
  private lastTime: number = -1;
  private currentVelocity: number = 0;
  private velocityVec = { dx: 0, dy: 0, speed: 0 };
  private trackingLossFrames: number = 0;
  private lastGestureResult: GestureResult | null = null;
  private continuousFrames: number = 0;
  private candidateContinuousGesture: GestureType = 'NONE';
  
  // Intelligent Registry State
  private candidateStartTime: Record<string, number> = {};
  private candidateFrameCount: Record<string, number> = {};
  private lastActionTriggerTime: number = 0;
  private activeCooldownMs: number = 0;
  private currentActiveStaticGesture: string | null = null;
  private currentActiveStaticConfidence: number = 0;

  public update(multiHandLandmarks: Landmark[][], handedness: any[], timestamp: number = performance.now()): GestureResult {
    const settings = SettingsManager.getSettings();
    const handCount = multiHandLandmarks ? multiHandLandmarks.length : 0;
    let primaryHand: 'Left' | 'Right' | 'None' = 'None';
    let landmarks = multiHandLandmarks?.[0] || null;

    if (handCount > 0 && handedness && handedness.length > 0) {
      primaryHand = handedness[0].label === 'Left' ? 'Right' : 'Left'; // MediaPipe mirrors cameras, so Left is Right
    }

    if (!landmarks || landmarks.length < 21) {
      this.trackingLossFrames++;
      if (this.trackingLossFrames <= 3 && this.lastGestureResult) {
        return this.lastGestureResult; // Hold state for a few frames
      }
      this.lastContinuousGesture = 'NONE';
      this.continuousFrames = 0;
      this.currentActiveStaticGesture = null;
      return this.resetResult(handCount, primaryHand);
    } else {
      this.trackingLossFrames = 0;
    }

    // 1. Velocity & Trajectory (Dynamic Swipes)
    if (this.lastLandmarks && this.lastTime !== -1) {
      const dt = timestamp - this.lastTime;
      if (dt > 0) {
        const dx = landmarks[0].x - this.lastLandmarks[0].x; // Wrist X delta
        const dy = landmarks[0].y - this.lastLandmarks[0].y; // Wrist Y delta
        const dist = getDistance(landmarks[0], this.lastLandmarks[0]); 
        const speed = (dist / dt) * 1000;
        this.currentVelocity = speed;
        
        // Normalize vector
        const mag = Math.sqrt(dx*dx + dy*dy) || 1;
        this.velocityVec = { dx: dx/mag, dy: dy/mag, speed };
      }
    }
    this.lastLandmarks = landmarks;
    this.lastTime = timestamp;

    const handScale = getDistance(landmarks[0], landmarks[9]) || 1;
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

    // --- PIPELINE STEP 1: Core Continuous Gestures (DRAW/PAUSE/PINCH) ---
    let candidateGesture: GestureType = 'NONE';
    let candidateConfidence = 0.5;
    const pinchThreshold = this.lastContinuousGesture === 'PINCH' ? 0.45 : 0.35; // Hysteresis

    if (normalizedPinchDist < pinchThreshold) {
      candidateGesture = 'PINCH';
      candidateConfidence = Math.max(0.6, 1.0 - (normalizedPinchDist / pinchThreshold) * 0.4);
    } else if (fingerState.index && fingerState.middle && fingerState.ring && fingerState.pinky) {
      candidateGesture = 'PAUSE';
      candidateConfidence = 0.9;
    } else if (fingerState.index && !fingerState.middle && !fingerState.ring && !fingerState.pinky) {
      candidateGesture = 'DRAW';
      candidateConfidence = 0.95;
    }

    // Continuous Frame Stability
    if (candidateGesture === this.candidateContinuousGesture) {
      this.continuousFrames++;
    } else {
      this.candidateContinuousGesture = candidateGesture;
      this.continuousFrames = 1;
    }

    const requiredFrames = candidateGesture === 'PINCH' ? 3 : 2;

    if (this.candidateContinuousGesture !== this.lastContinuousGesture) {
      if (this.continuousFrames >= requiredFrames) {
        this.lastContinuousGesture = this.candidateContinuousGesture;
      }
    }


    // --- PIPELINE STEP 2: Intelligent Registry (Static & Dynamic Actions) ---
    let actionTriggered: GestureDefinition | undefined = undefined;
    const activeGestures = GestureRegistry.getActiveGestures();
    const candidateNames: string[] = [];
    
    // Cooldown Check
    const isCooldownActive = (timestamp - this.lastActionTriggerTime) < this.activeCooldownMs;

    if (!isCooldownActive) {
      const validCandidates: { g: GestureDefinition, conf: number }[] = [];

      for (const g of activeGestures) {
        const conf = g.check(landmarks, fingerState, this.velocityVec);
        if (conf >= settings.confidenceThreshold) {
          validCandidates.push({ g, conf });
          candidateNames.push(g.name);
          
          if (!this.candidateStartTime[g.id]) {
            this.candidateStartTime[g.id] = timestamp;
            this.candidateFrameCount[g.id] = 1;
          } else {
            this.candidateFrameCount[g.id]++;
          }
        } else {
          delete this.candidateStartTime[g.id]; // Reset debounce if lost
          delete this.candidateFrameCount[g.id];
        }
      }

      // Conflict Resolution: Filter by debounce & stability frames, then Hysteresis -> Priority -> Confidence
      const passedStability = validCandidates.filter(c => {
        const requiredDebounce = c.g.debounceMs * settings.globalDebounceMultiplier;
        const requiredFrames = c.g.stabilityFrames || 2;
        const timePassed = (timestamp - this.candidateStartTime[c.g.id]) >= requiredDebounce;
        const framesPassed = this.candidateFrameCount[c.g.id] >= requiredFrames;
        
        // Hysteresis Margin: If there's an active static gesture, a competing gesture must beat it by a margin
        if (this.currentActiveStaticGesture && this.currentActiveStaticGesture !== c.g.id) {
           const margin = c.g.hysteresisMargin || 5;
           if (c.conf < this.currentActiveStaticConfidence + margin) {
             return false;
           }
        }

        return timePassed && framesPassed;
      });

      if (passedStability.length > 0) {
        passedStability.sort((a, b) => {
          if (b.g.priority !== a.g.priority) return b.g.priority - a.g.priority;
          return b.conf - a.conf;
        });

        // TRIGGER ACTION!
        const winner = passedStability[0].g;
        actionTriggered = winner;
        this.lastActionTriggerTime = timestamp;
        this.activeCooldownMs = winner.cooldownMs; // Lock engine
        
        // Lock static hysteresis
        if (winner.type === 'STATIC') {
          this.currentActiveStaticGesture = winner.id;
          this.currentActiveStaticConfidence = passedStability[0].conf;
        } else {
          this.currentActiveStaticGesture = null;
        }
        
        // Reset all candidate timers so they don't fire again immediately after cooldown
        this.candidateStartTime = {};
        this.candidateFrameCount = {};
      } else {
        // Decay active static confidence if it's no longer the top candidate
        if (this.currentActiveStaticGesture && !validCandidates.find(c => c.g.id === this.currentActiveStaticGesture)) {
          this.currentActiveStaticGesture = null;
        }
      }
    }

    this.lastGestureResult = {
      gesture: this.lastContinuousGesture,
      confidence: candidateConfidence,
      pinchDistance: this.lastContinuousGesture === 'PINCH' ? normalizedPinchDist : undefined,
      fingerState,
      velocity: this.currentVelocity,
      handCount,
      primaryHand,
      candidateGestures: candidateNames,
      cooldownActive: isCooldownActive,
      actionTriggered
    };
    return this.lastGestureResult;
  }

  private resetResult(handCount: number, primaryHand: 'Left' | 'Right' | 'None'): GestureResult {
    return {
      gesture: 'NONE',
      confidence: 0,
      fingerState: { thumb: false, index: false, middle: false, ring: false, pinky: false },
      velocity: 0,
      handCount,
      primaryHand,
      candidateGestures: [],
      cooldownActive: false
    };
  }
}
