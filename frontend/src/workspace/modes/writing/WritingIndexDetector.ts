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

/** Frames of consistent detection required to START writing */
const INDEX_START_FRAMES = 2;
/** Frames of negative detection required to STOP writing */
const INDEX_RELEASE_FRAMES = 4;

/** Frames of consistent palm detection required to START erasing */
const PALM_START_FRAMES = 2;
/** Frames of negative detection required to STOP erasing */
const PALM_RELEASE_FRAMES = 3;

/** Max consecutive frames of tracking loss before we give up and IDLE */
const TRACKING_LOSS_TOLERANCE = 4;

/**
 * Minimum ratio of fingertip-to-MCP distance relative to palm size
 * for a finger to be considered "extended".
 */
const EXTENSION_THRESHOLD = 0.7;

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
   * Detect whether the index finger is clearly extended and the hand
   * is in a "pointing" posture.
   *
   * Uses fingertip-to-MCP distances relative to palm size.
   * Requires at least 2 non-index fingers to be curled.
   */
  private detectIndexExtended(lm: Landmark[]): boolean {
    // MediaPipe hand landmark indices:
    // 0=WRIST, 1-4=THUMB, 5-8=INDEX, 9-12=MIDDLE, 13-16=RING, 17-20=PINKY
    // For each finger: MCP=base, PIP=mid, DIP=near-tip, TIP=tip
    //   Index:  MCP=5, PIP=6, DIP=7, TIP=8
    //   Middle: MCP=9, PIP=10, DIP=11, TIP=12
    //   Ring:   MCP=13, PIP=14, DIP=15, TIP=16
    //   Pinky:  MCP=17, PIP=18, DIP=19, TIP=20

    const palmSize = this.dist3(lm[0], lm[9]); // Wrist to middle MCP
    if (palmSize < 1e-6) return false;

    // Index finger: tip must be far from MCP and above PIP (finger pointing up/forward)
    const indexExtension = this.dist3(lm[5], lm[8]) / palmSize;
    const indexTipAbovePip = lm[8].y < lm[6].y; // Lower y = higher on screen

    if (indexExtension < EXTENSION_THRESHOLD || !indexTipAbovePip) return false;

    // Count curled fingers (middle, ring, pinky)
    const nonIndexFingers = [
      { mcp: 9, pip: 10, tip: 12 },   // middle
      { mcp: 13, pip: 14, tip: 16 },  // ring
      { mcp: 17, pip: 18, tip: 20 },  // pinky
    ];

    let curledCount = 0;
    for (const f of nonIndexFingers) {
      const ext = this.dist3(lm[f.mcp], lm[f.tip]) / palmSize;
      const tipAbovePip = lm[f.tip].y < lm[f.pip].y;
      // A finger is "curled" if it is NOT extended
      if (ext < EXTENSION_THRESHOLD || !tipAbovePip) {
        curledCount++;
      }
    }

    return curledCount >= CURL_REQUIRED;
  }

  /**
   * Detect whether the hand is an open palm (all fingers extended and spread).
   * Used for the eraser gesture.
   */
  private detectOpenPalm(lm: Landmark[]): boolean {
    const palmSize = this.dist3(lm[0], lm[9]);
    if (palmSize < 1e-6) return false;

    // All main fingers must be extended
    const fingers = [
      { mcp: 5, pip: 6, tip: 8 },    // index
      { mcp: 9, pip: 10, tip: 12 },  // middle
      { mcp: 13, pip: 14, tip: 16 }, // ring
      { mcp: 17, pip: 18, tip: 20 }, // pinky
    ];

    let extendedCount = 0;
    for (const f of fingers) {
      const ext = this.dist3(lm[f.mcp], lm[f.tip]) / palmSize;
      const tipAbovePip = lm[f.tip].y < lm[f.pip].y;
      if (ext >= EXTENSION_THRESHOLD && tipAbovePip) extendedCount++;
    }

    // All 4 fingers must be extended for an open palm
    return extendedCount >= 4;
  }

  private dist3(a: Landmark, b: Landmark): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = (a.z - b.z) * 0.5; // z is less reliable, weight it less
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}
