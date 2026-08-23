/**
 * Recognition result for a single character.
 */
export interface RecognitionResult {
  character: string;
  confidence: number;       // 0.0–1.0
  alternatives: Array<{ character: string; confidence: number }>;
  boundingBox: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  strokeCount: number;
}

export type RecognitionStatus = 'high' | 'medium' | 'low' | 'none';

export function getRecognitionStatus(confidence: number): RecognitionStatus {
  if (confidence >= 0.85) return 'high';
  if (confidence >= 0.65) return 'medium';
  if (confidence > 0) return 'low';
  return 'none';
}
