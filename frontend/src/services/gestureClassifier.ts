export type GestureType = 'DRAW' | 'PAUSE' | 'PINCH' | 'NONE';

export interface GestureResult {
  gesture: GestureType;
  pinchDistance?: number;
  confidence: number;
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

/**
 * Calculate Euclidean distance between two 3D/2D landmarks.
 */
export function getDistance(p1: Landmark, p2: Landmark): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Classify hand gestures based on MediaPipe 21 Hand Landmarks.
 *
 * Gestures:
 * - DRAW: Index finger extended, middle/ring/pinky folded.
 * - PAUSE: Open palm (all fingers extended).
 * - PINCH: Thumb tip (4) and Index tip (8) close together.
 */
export function classifyGesture(landmarks: Landmark[]): GestureResult {
  if (!landmarks || landmarks.length < 21) {
    return { gesture: 'NONE', confidence: 0 };
  }

  // Hand reference scale (distance from wrist 0 to middle MCP 9)
  const handScale = getDistance(landmarks[0], landmarks[9]) || 1;

  // Finger extension checks (Tip Y < PIP Y relative to wrist)
  const isIndexUp = landmarks[8].y < landmarks[6].y;
  const isMiddleUp = landmarks[12].y < landmarks[10].y;
  const isRingUp = landmarks[16].y < landmarks[14].y;
  const isPinkyUp = landmarks[20].y < landmarks[18].y;

  // Pinch distance (Thumb 4 to Index 8 normalized by hand scale)
  const rawPinchDist = getDistance(landmarks[4], landmarks[8]);
  const normalizedPinchDist = rawPinchDist / handScale;

  // Pinch threshold (if thumb & index tips are within ~0.35 of hand scale)
  if (normalizedPinchDist < 0.35) {
    return {
      gesture: 'PINCH',
      pinchDistance: normalizedPinchDist,
      confidence: 0.95,
    };
  }

  // Open Palm: All main fingers extended
  if (isIndexUp && isMiddleUp && isRingUp && isPinkyUp) {
    return { gesture: 'PAUSE', confidence: 0.9 };
  }

  // Draw Mode: Index extended, middle & ring folded
  if (isIndexUp && !isMiddleUp && !isRingUp) {
    return { gesture: 'DRAW', confidence: 0.95 };
  }

  return { gesture: 'NONE', confidence: 0.5 };
}
