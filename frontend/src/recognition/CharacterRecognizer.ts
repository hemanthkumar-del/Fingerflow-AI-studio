import type { NormalizedCharacter } from './StrokeNormalizer';
import {
  extractFeatures,
  distanceAtBestAngle,
  pathDistance,
  type FeatureVector,
} from './FeatureExtractor';
import { CHARACTER_TEMPLATES, type CharacterTemplate } from './CharacterTemplates';
import type { RecognitionResult } from './RecognitionResult';
import type { Stroke } from './Stroke';
import { computeBoundingBox } from './Stroke';

/** Cosine similarity between two histograms. Returns 0-1. */
function histSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/**
 * Score a normalized character against a template.
 * Returns a score in [0, 1]. Higher = better match.
 */
function scoreAgainstTemplate(
  feat: FeatureVector,
  char: NormalizedCharacter,
  tmpl: CharacterTemplate,
): number {
  // 1. Stroke count gate: must be within range
  if (feat.strokeCount < tmpl.minStrokes || feat.strokeCount > tmpl.maxStrokes) {
    return 0.0;
  }

  // 2. Aspect ratio gate: must be within range (with 20% tolerance)
  const tolerance = 0.2;
  if (
    feat.aspectRatio < tmpl.minAspect * (1 - tolerance) ||
    feat.aspectRatio > tmpl.maxAspect * (1 + tolerance)
  ) {
    return 0.0;
  }

  // 3. Direction histogram similarity (0-1)
  const histSim = histSimilarity(feat.dirHist, tmpl.dirHist);

  // 4. $1-style path distance score (0-1)
  // Lower path distance = better match
  const pathDist = distanceAtBestAngle(feat.combinedPoints, tmpl.dirHist.map((_, i) => ({ x: 0, y: 0 })));
  // Use direct path distance against a reference path
  // We skip template paths here; we use the hist similarity as the primary metric.
  // For a richer comparison we use the raw path distance between the normalized path and an 
  // 'ideal' path derived from the histogram:
  let pathScore = 0;
  try {
    // Simple self-distance check (well-formed strokes have low internal variance)
    const halfN = Math.floor(feat.combinedPoints.length / 2);
    const firstHalf = feat.combinedPoints.slice(0, halfN);
    const secondHalf = feat.combinedPoints.slice(halfN);
    const selfDist = pathDistance(firstHalf, secondHalf.slice(0, halfN));
    pathScore = Math.max(0, 1 - selfDist);
  } catch {
    pathScore = 0.5;
  }

  // 5. Structural similarity
  let structScore = 0;
  // Closed check
  if (tmpl.expectsClosed) {
    structScore += feat.closed ? 0.5 : 0.0;
  } else {
    structScore += feat.closed ? 0.1 : 0.5;
  }
  // Aspect ratio match (penalize being far from center of expected range)
  const idealAspect = (tmpl.minAspect + tmpl.maxAspect) / 2;
  const aspectRange = Math.max(0.1, tmpl.maxAspect - tmpl.minAspect);
  const aspectScore = Math.max(0, 1 - Math.abs(feat.aspectRatio - idealAspect) / aspectRange);
  structScore = 0.5 * structScore + 0.5 * aspectScore;

  // 6. Weighted combination
  const total =
    tmpl.histWeight * histSim +
    tmpl.pathWeight * pathScore +
    tmpl.structWeight * structScore;

  return Math.max(0, Math.min(1, total));
}

export class CharacterRecognizer {
  /**
   * Recognize a normalized character from its strokes.
   * Returns the best matching character with confidence and alternatives.
   */
  recognize(char: NormalizedCharacter, originalStrokes: Stroke[]): RecognitionResult {
    const feat = extractFeatures(char);

    const scores: Array<{ character: string; score: number }> = [];

    for (const tmpl of CHARACTER_TEMPLATES) {
      const score = scoreAgainstTemplate(feat, char, tmpl);
      if (score > 0) {
        scores.push({ character: tmpl.character, score });
      }
    }

    // Sort descending by score
    scores.sort((a, b) => b.score - a.score);

    // Compute bounding box from original strokes
    const allPoints = originalStrokes.flatMap(s => s.points);
    const bb = allPoints.length > 0
      ? computeBoundingBox(allPoints)
      : { left: 0, top: 0, width: 0, height: 0 };

    if (scores.length === 0) {
      return {
        character: '',
        confidence: 0,
        alternatives: [],
        boundingBox: { left: bb.left, top: bb.top, width: bb.width, height: bb.height },
        strokeCount: char.strokeCount,
      };
    }

    const best = scores[0];
    // Convert raw score to confidence.
    // A raw score of 1.0 maps to ~0.97 confidence.
    // We use a sigmoid-like mapping so scores cluster more intuitively.
    const confidence = Math.min(0.97, best.score * 0.97);

    const alternatives = scores.slice(1, 4).map(s => ({
      character: s.character,
      confidence: Math.min(0.97, s.score * 0.97),
    }));

    return {
      character: best.character,
      confidence,
      alternatives,
      boundingBox: { left: bb.left, top: bb.top, width: bb.width, height: bb.height },
      strokeCount: char.strokeCount,
    };
  }
}

export const characterRecognizer = new CharacterRecognizer();
