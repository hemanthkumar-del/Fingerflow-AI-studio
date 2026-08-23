import type { Stroke } from './Stroke';
import { buildStroke } from './Stroke';
import { normalizeCharacter } from './StrokeNormalizer';
import { characterRecognizer } from './CharacterRecognizer';
import { CharacterBoundaryDetector } from './CharacterBoundaryDetector';
import type { RecognitionResult } from './RecognitionResult';

export type OnRecognitionCallback = (result: RecognitionResult, rawStrokes: Stroke[]) => void;

/**
 * Manages the full recognition pipeline for a writing session.
 * Receives raw point arrays from WritingEngine, converts them to Strokes,
 * passes them through the boundary detector, and fires recognition callbacks.
 */
export class StrokeSession {
  private recognitionEnabled: boolean = false;
  private onRecognition: OnRecognitionCallback;
  private boundaryDetector: CharacterBoundaryDetector;

  constructor(onRecognition: OnRecognitionCallback) {
    this.onRecognition = onRecognition;
    this.boundaryDetector = new CharacterBoundaryDetector((strokes: Stroke[]) => {
      this.runRecognition(strokes);
    });
  }

  setRecognitionEnabled(enabled: boolean): void {
    this.recognitionEnabled = enabled;
    if (!enabled) {
      this.boundaryDetector.reset();
    }
  }

  isRecognitionEnabled(): boolean {
    return this.recognitionEnabled;
  }

  /**
   * Called when a pen-up event completes (after WritingEngine.endStroke).
   * @param rawPoints The screen-space points collected during this stroke.
   */
  onStrokeComplete(rawPoints: Array<{ x: number; y: number; t?: number }>): void {
    if (!this.recognitionEnabled || rawPoints.length < 2) return;

    const stroke = buildStroke(rawPoints.map(p => ({ x: p.x, y: p.y, t: p.t })));
    if (!stroke) return;

    this.boundaryDetector.addStroke(stroke);
  }

  /**
   * Flush any pending character (e.g., on mode exit or explicit recognition trigger).
   */
  flush(): void {
    if (!this.recognitionEnabled) return;
    this.boundaryDetector.flush();
  }

  /**
   * Reset all state (e.g., on session discard).
   */
  reset(): void {
    this.boundaryDetector.reset();
  }

  private runRecognition(strokes: Stroke[]): void {
    if (strokes.length === 0) return;

    const normalized = normalizeCharacter(strokes);
    const result = characterRecognizer.recognize(normalized, strokes);

    // Only fire callback if we got a meaningful result
    if (result.confidence > 0.0) {
      this.onRecognition(result, strokes);
    }
  }
}
