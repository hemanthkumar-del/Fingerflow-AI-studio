import type { RecognitionResult } from './RecognitionResult';
import { computeBoundingBox } from './Stroke';

/**
 * A recognized word: a group of characters that are spatially close.
 */
export interface Word {
  characters: RecognitionResult[];
  text: string;
  boundingBox: { left: number; top: number; width: number; height: number };
}

const WORD_GAP_RATIO = 1.5; // Gap > 1.5x average char width → new word

/**
 * Groups a sequence of recognized characters into words
 * based on their spatial bounding boxes.
 */
export function detectWords(chars: RecognitionResult[]): Word[] {
  if (chars.length === 0) return [];

  const words: Word[] = [];
  let currentWord: RecognitionResult[] = [chars[0]];

  for (let i = 1; i < chars.length; i++) {
    const prev = chars[i - 1];
    const curr = chars[i];

    const prevRight = prev.boundingBox.left + prev.boundingBox.width;
    const currLeft = curr.boundingBox.left;
    const gap = currLeft - prevRight;

    // Average character width for threshold
    const avgWidth = (prev.boundingBox.width + curr.boundingBox.width) / 2;

    if (gap > avgWidth * WORD_GAP_RATIO) {
      // New word
      words.push(buildWord(currentWord));
      currentWord = [curr];
    } else {
      currentWord.push(curr);
    }
  }

  if (currentWord.length > 0) {
    words.push(buildWord(currentWord));
  }

  return words;
}

function buildWord(chars: RecognitionResult[]): Word {
  const text = chars.map(c => c.character).join('');
  const allPoints = chars.map(c => [
    { x: c.boundingBox.left, y: c.boundingBox.top },
    { x: c.boundingBox.left + c.boundingBox.width, y: c.boundingBox.top + c.boundingBox.height },
  ]).flat();
  const bb = computeBoundingBox(allPoints);

  return {
    characters: chars,
    text,
    boundingBox: { left: bb.left, top: bb.top, width: bb.width, height: bb.height },
  };
}
