import type { Stroke } from './Stroke';
import { computeBoundingBox } from './Stroke';

/**
 * Manages the accumulation of multiple strokes into a single character session.
 * A character may consist of multiple strokes (e.g., 'A', 'i', 'f', 'H').
 * 
 * Boundary detection uses:
 * - Time gap between strokes (temporal separation)
 * - Spatial distance from last stroke end to new stroke start
 * - Total accumulated strokes
 */

export interface CharacterCandidate {
  strokes: Stroke[];
  startTime: number;
  lastStrokeEndTime: number;
}

const TIME_GAP_THRESHOLD_MS = 600;    // > 600ms pause → likely new character
const SPATIAL_THRESHOLD_RATIO = 0.8;  // Spatial gap > 80% of current char width → new character
const MAX_STROKES_PER_CHAR = 5;       // Maximum strokes before forcing completion

export class CharacterBoundaryDetector {
  private currentCandidate: CharacterCandidate | null = null;
  private completionTimer: ReturnType<typeof setTimeout> | null = null;
  private onComplete: (strokes: Stroke[]) => void;

  constructor(onComplete: (strokes: Stroke[]) => void) {
    this.onComplete = onComplete;
  }

  /**
   * Called when a new stroke is completed.
   * Returns true if this stroke starts a new character.
   */
  addStroke(stroke: Stroke): void {
    this.cancelTimer();
    const now = Date.now();

    if (!this.currentCandidate) {
      // First stroke of a new character
      this.currentCandidate = {
        strokes: [stroke],
        startTime: now,
        lastStrokeEndTime: now,
      };
    } else {
      const timeSinceLast = now - this.currentCandidate.lastStrokeEndTime;
      const bb = computeBoundingBox(this.currentCandidate.strokes.flatMap(s => s.points));
      
      // Use the max dimension of the bounding box to estimate the character's scale
      const charScale = Math.max(bb.width, bb.height, 40);
      
      // Distance from the new stroke's start to the bounding box center
      const dxCenter = stroke.startPoint.x - bb.cx;
      const dyCenter = stroke.startPoint.y - bb.cy;
      const distToCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);

      // Check if the new stroke is spatially separated from the current character cluster
      // Allow strokes that are within ~1.2x of the character's scale from the center
      const isSpatiallySeparated = distToCenter > charScale * 1.2;

      // Force completion if: time gap too large, spatial gap too large, or too many strokes
      if (
        timeSinceLast > TIME_GAP_THRESHOLD_MS ||
        isSpatiallySeparated ||
        this.currentCandidate.strokes.length >= MAX_STROKES_PER_CHAR
      ) {
        // Complete current character, start new one
        this.complete();
        this.currentCandidate = {
          strokes: [stroke],
          startTime: now,
          lastStrokeEndTime: now,
        };
      } else {
        // Same character, accumulate stroke
        this.currentCandidate.strokes.push(stroke);
        this.currentCandidate.lastStrokeEndTime = now;
      }
    }

    // Schedule auto-completion after pause
    this.completionTimer = setTimeout(() => {
      this.complete();
    }, TIME_GAP_THRESHOLD_MS);
  }

  /**
   * Force immediate completion of the current candidate (e.g., when exiting writing mode).
   */
  flush(): void {
    this.cancelTimer();
    if (this.currentCandidate && this.currentCandidate.strokes.length > 0) {
      this.complete();
    }
  }

  /**
   * Reset the detector state entirely.
   */
  reset(): void {
    this.cancelTimer();
    this.currentCandidate = null;
  }

  private complete(): void {
    if (this.currentCandidate && this.currentCandidate.strokes.length > 0) {
      this.onComplete([...this.currentCandidate.strokes]);
    }
    this.currentCandidate = null;
  }

  private cancelTimer(): void {
    if (this.completionTimer !== null) {
      clearTimeout(this.completionTimer);
      this.completionTimer = null;
    }
  }

  private computeSpatialGap(candidate: CharacterCandidate, newStroke: Stroke): number {
    const lastStroke = candidate.strokes[candidate.strokes.length - 1];
    const lastEnd = lastStroke.endPoint;
    const newStart = newStroke.startPoint;
    const dx = newStart.x - lastEnd.x;
    const dy = newStart.y - lastEnd.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
