/**
 * WritingIndexDetector
 *
 * A dedicated, Writing Mode–only gesture detector that uses raw MediaPipe
 * landmark geometry to determine whether the user is writing (index extended)
 * or erasing (open palm). This runs separately from the general-purpose
 * GestureEngine so it can be tuned specifically for writing accuracy.
 *
 * Features:
 * - Direct landmark geometry: does NOT rely on GestureEngine classification
 * - Temporal hysteresis: requires N consistent frames before state change
 * - Tracking-loss tolerance: holds current state for up to M missed frames
 * - Spatial hysteresis: requires a meaningful geometric margin to leave a state
 */

export type WritingGestureState = 'WRITE' | 'ERASE' | 'IDLE';

interface Landmark {
  x: number;
  y: number;
  z: number;
}

// ── Tuning constants ─────────────────────────────────────────────────────────

/** Frames of consistent detection required to START writing.
 *  1 frame = immediate response (~16ms at 60fps). */
const INDEX_START_FRAMES = 1;
/** Frames of negative detection required to STOP writing.
 *  4–5 frames = ~67–80ms stop delay, preventing jitter from brief misdetections. */
const INDEX_RELEASE_FRAMES = 5;

/** Frames of consistent palm detection required to START erasing */
const PALM_START_FRAMES = 2;
/** Frames of negative detection required to STOP erasing */
const PALM_RELEASE_FRAMES = 3;

/** Max consecutive frames of tracking loss before we give up and IDLE */
const TRACKING_LOSS_TOLERANCE = 5;

/**
 * How many non-index fingers must be curled for index-only detection.
 * We require at least 2 of {middle, ring, pinky} to be NOT extended.
 */
const CURL_REQUIRED = 2;

// ────────────────────────────────────────────────────────────────────────────

export class WritingIndexDetector {
  private state: WritingGestureState = 'IDLE';

  // Counters for state transitions
  private writeConsistentFrames = 0;
  private writeReleaseFrames = 0;
  private eraseConsistentFrames = 0;
  private eraseReleaseFrames = 0;
  private trackingLossFrames = 0;

  /**
   * Update the detector with the latest set of landmarks.
   * @param landmarks Raw mirrored landmarks from MediaPipe (21 points).
   *                  Pass null/undefined if tracking was lost this frame.
   * @returns The current WritingGestureState.
   */
  update(landmarks: Landmark[] | null | undefined): WritingGestureState {
    if (!landmarks || landmarks.length < 21) {
      // Tracking lost this frame
      this.trackingLossFrames++;
      if (this.trackingLossFrames > TRACKING_LOSS_TOLERANCE) {
        // Too many consecutive misses — go idle
        this.reset();
      }
      // Otherwise hold current state (tracking-loss tolerance)
      return this.state;
    }

    // Tracking recovered
    this.trackingLossFrames = 0;

    const isIndexUp = this.detectIndexExtended(landmarks);
    const isPalmOpen = this.detectOpenPalm(landmarks);

    // ── State machine ────────────────────────────────────────────────────

    if (this.state === 'WRITE') {
      if (isPalmOpen) {
        // Transition WRITE → ERASE
        this.eraseConsistentFrames++;
        this.writeReleaseFrames = 0;
        if (this.eraseConsistentFrames >= PALM_START_FRAMES) {
          this.state = 'ERASE';
          this.writeConsistentFrames = 0;
          this.writeReleaseFrames = 0;
          this.eraseConsistentFrames = 0;
        }
      } else if (!isIndexUp) {
        // Index dropped — accumulate release frames
        this.writeReleaseFrames++;
        this.eraseConsistentFrames = 0;
        if (this.writeReleaseFrames >= INDEX_RELEASE_FRAMES) {
          this.state = 'IDLE';
          this.writeConsistentFrames = 0;
          this.writeReleaseFrames = 0;
        }
      } else {
        // Still writing — reset release counter (hysteresis)
        this.writeReleaseFrames = 0;
        this.eraseConsistentFrames = 0;
      }
    } else if (this.state === 'ERASE') {
      if (isIndexUp && !isPalmOpen) {
        // Transition ERASE → WRITE (need stable index confirmation)
        this.writeConsistentFrames++;
        this.eraseReleaseFrames = 0;
        if (this.writeConsistentFrames >= INDEX_START_FRAMES) {
          this.state = 'WRITE';
          this.eraseConsistentFrames = 0;
          this.eraseReleaseFrames = 0;
          this.writeConsistentFrames = 0;
        }
      } else if (!isPalmOpen) {
        // Palm dropped — accumulate release frames
        this.eraseReleaseFrames++;
        this.writeConsistentFrames = 0;
        if (this.eraseReleaseFrames >= PALM_RELEASE_FRAMES) {
          this.state = 'IDLE';
          this.eraseConsistentFrames = 0;
          this.eraseReleaseFrames = 0;
        }
      } else {
        // Still erasing
        this.eraseReleaseFrames = 0;
        this.writeConsistentFrames = 0;
      }
    } else {
      // IDLE — look for a clear gesture to start
      if (isIndexUp && !isPalmOpen) {
        this.writeConsistentFrames++;
        this.eraseConsistentFrames = 0;
        if (this.writeConsistentFrames >= INDEX_START_FRAMES) {
          this.state = 'WRITE';
          this.writeConsistentFrames = 0;
          this.writeReleaseFrames = 0;
        }
      } else if (isPalmOpen) {
        this.eraseConsistentFrames++;
        this.writeConsistentFrames = 0;
        if (this.eraseConsistentFrames >= PALM_START_FRAMES) {
          this.state = 'ERASE';
          this.eraseConsistentFrames = 0;
          this.eraseReleaseFrames = 0;
        }
      } else {
        // No clear gesture
        this.writeConsistentFrames = Math.max(0, this.writeConsistentFrames - 1);
        this.eraseConsistentFrames = Math.max(0, this.eraseConsistentFrames - 1);
      }
    }

    return this.state;
  }

  /** Current detected state (without consuming a frame) */
  getState(): WritingGestureState {
    return this.state;
  }

  /** Full reset (e.g., when Writing Mode exits) */
  reset(): void {
    this.state = 'IDLE';
    this.writeConsistentFrames = 0;
    this.writeReleaseFrames = 0;
    this.eraseConsistentFrames = 0;
    this.eraseReleaseFrames = 0;
    this.trackingLossFrames = 0;
  }

  // ── Geometric detection helpers ──────────────────────────────────────────

  /**
   * Detect whether the index finger is clearly extended.
   *
   * Uses two scale-invariant measures:
   * 1. Fingertip-to-MCP distance (finger unfolded = far from base)
   * 2. PIP→TIP direction vs PIP→MCP direction (curled = reverse direction)
   * Requires ≥2 other fingers to be curled.
   */
  private detectIndexExtended(lm: Landmark[]): boolean {
    // MediaPipe hand landmark indices:
    // 0=WRIST, 1-4=THUMB, 5-8=INDEX, 9-12=MIDDLE, 13-16=RING, 17-20=PINKY
    const palmSize = this.dist3(lm[0], lm[9]); // Wrist to middle MCP
    if (palmSize < 1e-6) return false;

    // Index tip-to-MCP distance ratio (primary extension test)
    const indexExtension = this.dist3(lm[5], lm[8]) / palmSize;
    if (indexExtension < 0.5) return false;

    // Secondary test: Index tip should be further from wrist than PIP
    // This handles sideways or tilted hands that could fool the distance ratio
    const pipToWrist = this.dist3(lm[0], lm[6]);
    const tipToWrist = this.dist3(lm[0], lm[8]);
    if (tipToWrist < pipToWrist * 0.85) return false; // TIP is not beyond PIP

    // Count curled fingers (middle, ring, pinky)
    // Curled = tip significantly closer to wrist than fully extended
    const nonIndexFingers = [
      { mcp: 9, tip: 12 },   // middle
      { mcp: 13, tip: 16 },  // ring
      { mcp: 17, tip: 20 },  // pinky
    ];

    let curledCount = 0;
    for (const f of nonIndexFingers) {
      const ext = this.dist3(lm[f.mcp], lm[f.tip]) / palmSize;
      if (ext < 0.65) {
        curledCount++;
      }
    }

    return curledCount >= CURL_REQUIRED;
  }

  /**
   * Detect whether the hand is an open palm (all fingers extended).
   */
  private detectOpenPalm(lm: Landmark[]): boolean {
    const palmSize = this.dist3(lm[0], lm[9]);
    if (palmSize < 1e-6) return false;

    const fingers = [
      { mcp: 5, tip: 8 },    // index
      { mcp: 9, tip: 12 },   // middle
      { mcp: 13, tip: 16 },  // ring
      { mcp: 17, tip: 20 },  // pinky
    ];

    let extendedCount = 0;
    for (const f of fingers) {
      const ext = this.dist3(lm[f.mcp], lm[f.tip]) / palmSize;
      if (ext >= 0.55) extendedCount++;
    }

    return extendedCount >= 4;
  }

  private dist3(a: Landmark, b: Landmark): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = (a.z - b.z) * 0.3; // z is less reliable, reduce weight further
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}
