/**
 * Character template for the local recognizer.
 * Templates encode expected geometric characteristics
 * of handwritten characters, not pixel data.
 */
export interface CharacterTemplate {
  character: string;
  /** Number of strokes (min, max inclusive) */
  minStrokes: number;
  maxStrokes: number;
  /** Aspect ratio range (width/height) */
  minAspect: number;
  maxAspect: number;
  /** Whether the path is expected to close (circles, 0, O, D, etc.) */
  expectsClosed: boolean;
  /** Direction histogram template (8 bins) */
  dirHist: number[];
  /** Weight for $1-style path distance */
  pathWeight: number;
  /** Weight for direction histogram */
  histWeight: number;
  /** Weight for structural features (closed, aspect) */
  structWeight: number;
  /** Optional: expected stroke direction angles [minAngle, maxAngle] per stroke */
  strokeAngles?: Array<[number, number]>;
}

// Helper for direction histogram: indices are [E, NE, N, NW, W, SW, S, SE]
// All values are proportions (0-1), not counts.
const E = 0, NE = 1, N = 2, NW = 3, W = 4, SW = 5, S = 6, SE = 7;

function h(...pairs: [number, number][]): number[] {
  const hist = new Array(8).fill(0);
  for (const [bin, val] of pairs) hist[bin] = val;
  // normalize
  const sum = hist.reduce((a, b) => a + b, 0);
  if (sum === 0) return hist;
  return hist.map(v => v / sum);
}

/**
 * Geometric character templates.
 * Tuned for imperfect, natural finger handwriting.
 */
export const CHARACTER_TEMPLATES: CharacterTemplate[] = [
  // ─── UPPERCASE LETTERS ───
  {
    character: 'A',
    minStrokes: 1, maxStrokes: 3,
    minAspect: 0.4, maxAspect: 1.4,
    expectsClosed: false,
    dirHist: h([NE, 0.28], [NW, 0.28], [E, 0.15], [W, 0.15], [N, 0.07], [S, 0.07]),
    pathWeight: 0.45, histWeight: 0.35, structWeight: 0.2,
  },
  {
    character: 'B',
    minStrokes: 1, maxStrokes: 3,
    minAspect: 0.4, maxAspect: 1.2,
    expectsClosed: false,
    dirHist: h([N, 0.25], [S, 0.25], [E, 0.2], [SE, 0.15], [NE, 0.15]),
    pathWeight: 0.4, histWeight: 0.35, structWeight: 0.25,
  },
  {
    character: 'C',
    minStrokes: 1, maxStrokes: 1,
    minAspect: 0.5, maxAspect: 1.5,
    expectsClosed: false,
    dirHist: h([N, 0.2], [NE, 0.15], [NW, 0.05], [S, 0.2], [SW, 0.15], [SE, 0.05], [W, 0.1], [E, 0.1]),
    pathWeight: 0.5, histWeight: 0.3, structWeight: 0.2,
  },
  {
    character: 'D',
    minStrokes: 1, maxStrokes: 2,
    minAspect: 0.5, maxAspect: 1.3,
    expectsClosed: true,
    dirHist: h([N, 0.25], [S, 0.25], [E, 0.2], [NE, 0.15], [SE, 0.15]),
    pathWeight: 0.4, histWeight: 0.3, structWeight: 0.3,
  },
  {
    character: 'E',
    minStrokes: 1, maxStrokes: 4,
    minAspect: 0.5, maxAspect: 2.0,
    expectsClosed: false,
    dirHist: h([N, 0.3], [S, 0.1], [E, 0.35], [W, 0.25]),
    pathWeight: 0.35, histWeight: 0.4, structWeight: 0.25,
  },
  {
    character: 'F',
    minStrokes: 1, maxStrokes: 3,
    minAspect: 0.4, maxAspect: 1.8,
    expectsClosed: false,
    dirHist: h([N, 0.35], [S, 0.05], [E, 0.4], [W, 0.2]),
    pathWeight: 0.35, histWeight: 0.4, structWeight: 0.25,
  },
  {
    character: 'G',
    minStrokes: 1, maxStrokes: 2,
    minAspect: 0.5, maxAspect: 1.4,
    expectsClosed: false,
    dirHist: h([N, 0.15], [NE, 0.1], [S, 0.2], [SW, 0.15], [W, 0.2], [E, 0.2]),
    pathWeight: 0.45, histWeight: 0.35, structWeight: 0.2,
  },
  {
    character: 'H',
    minStrokes: 2, maxStrokes: 3,
    minAspect: 0.5, maxAspect: 2.0,
    expectsClosed: false,
    dirHist: h([N, 0.4], [S, 0.4], [E, 0.1], [W, 0.1]),
    pathWeight: 0.3, histWeight: 0.45, structWeight: 0.25,
  },
  {
    character: 'I',
    minStrokes: 1, maxStrokes: 3,
    minAspect: 0.0, maxAspect: 0.8,
    expectsClosed: false,
    dirHist: h([N, 0.45], [S, 0.45], [E, 0.05], [W, 0.05]),
    pathWeight: 0.3, histWeight: 0.5, structWeight: 0.2,
  },
  {
    character: 'J',
    minStrokes: 1, maxStrokes: 2,
    minAspect: 0.1, maxAspect: 0.9,
    expectsClosed: false,
    dirHist: h([S, 0.45], [SW, 0.2], [W, 0.15], [N, 0.2]),
    pathWeight: 0.45, histWeight: 0.35, structWeight: 0.2,
  },
  {
    character: 'K',
    minStrokes: 2, maxStrokes: 3,
    minAspect: 0.5, maxAspect: 1.8,
    expectsClosed: false,
    dirHist: h([N, 0.3], [S, 0.1], [NE, 0.2], [SE, 0.2], [NW, 0.1], [SW, 0.1]),
    pathWeight: 0.4, histWeight: 0.35, structWeight: 0.25,
  },
  {
    character: 'L',
    minStrokes: 1, maxStrokes: 2,
    minAspect: 0.3, maxAspect: 2.5,
    expectsClosed: false,
    dirHist: h([S, 0.55], [E, 0.35], [N, 0.05], [W, 0.05]),
    pathWeight: 0.4, histWeight: 0.45, structWeight: 0.15,
  },
  {
    character: 'M',
    minStrokes: 1, maxStrokes: 4,
    minAspect: 0.8, maxAspect: 2.5,
    expectsClosed: false,
    dirHist: h([N, 0.2], [S, 0.2], [NE, 0.2], [SE, 0.2], [NW, 0.1], [SW, 0.1]),
    pathWeight: 0.4, histWeight: 0.35, structWeight: 0.25,
  },
  {
    character: 'N',
    minStrokes: 1, maxStrokes: 3,
    minAspect: 0.6, maxAspect: 2.0,
    expectsClosed: false,
    dirHist: h([N, 0.3], [S, 0.3], [SE, 0.25], [NW, 0.05], [NE, 0.05], [SW, 0.05]),
    pathWeight: 0.45, histWeight: 0.35, structWeight: 0.2,
  },
  {
    character: 'O',
    minStrokes: 1, maxStrokes: 2,
    minAspect: 0.5, maxAspect: 1.5,
    expectsClosed: true,
    dirHist: h([N, 0.15], [NE, 0.15], [NW, 0.15], [S, 0.15], [SE, 0.15], [SW, 0.15], [E, 0.05], [W, 0.05]),
    pathWeight: 0.4, histWeight: 0.25, structWeight: 0.35,
  },
  {
    character: 'P',
    minStrokes: 1, maxStrokes: 2,
    minAspect: 0.4, maxAspect: 1.3,
    expectsClosed: false,
    dirHist: h([N, 0.35], [S, 0.2], [E, 0.25], [NE, 0.1], [SE, 0.1]),
    pathWeight: 0.4, histWeight: 0.35, structWeight: 0.25,
  },
  {
    character: 'Q',
    minStrokes: 1, maxStrokes: 2,
    minAspect: 0.5, maxAspect: 1.5,
    expectsClosed: true,
    dirHist: h([N, 0.14], [NE, 0.14], [NW, 0.14], [S, 0.14], [SE, 0.14], [SW, 0.14], [E, 0.08], [W, 0.08]),
    pathWeight: 0.35, histWeight: 0.25, structWeight: 0.4,
  },
  {
    character: 'R',
    minStrokes: 1, maxStrokes: 3,
    minAspect: 0.5, maxAspect: 1.4,
    expectsClosed: false,
    dirHist: h([N, 0.3], [S, 0.2], [E, 0.2], [SE, 0.2], [NE, 0.1]),
    pathWeight: 0.4, histWeight: 0.35, structWeight: 0.25,
  },
  {
    character: 'S',
    minStrokes: 1, maxStrokes: 1,
    minAspect: 0.4, maxAspect: 1.4,
    expectsClosed: false,
    dirHist: h([W, 0.15], [SW, 0.15], [S, 0.1], [SE, 0.1], [E, 0.15], [NE, 0.15], [N, 0.1], [NW, 0.1]),
    pathWeight: 0.5, histWeight: 0.3, structWeight: 0.2,
  },
  {
    character: 'T',
    minStrokes: 1, maxStrokes: 2,
    minAspect: 0.5, maxAspect: 3.0,
    expectsClosed: false,
    dirHist: h([E, 0.35], [W, 0.35], [S, 0.25], [N, 0.05]),
    pathWeight: 0.35, histWeight: 0.45, structWeight: 0.2,
  },
  {
    character: 'U',
    minStrokes: 1, maxStrokes: 2,
    minAspect: 0.5, maxAspect: 1.5,
    expectsClosed: false,
    dirHist: h([S, 0.3], [SE, 0.1], [SW, 0.1], [E, 0.1], [W, 0.1], [N, 0.3]),
    pathWeight: 0.45, histWeight: 0.35, structWeight: 0.2,
  },
  {
    character: 'V',
    minStrokes: 1, maxStrokes: 2,
    minAspect: 0.5, maxAspect: 2.0,
    expectsClosed: false,
    dirHist: h([SE, 0.35], [SW, 0.35], [NE, 0.15], [NW, 0.15]),
    pathWeight: 0.45, histWeight: 0.4, structWeight: 0.15,
  },
  {
    character: 'W',
    minStrokes: 1, maxStrokes: 4,
    minAspect: 0.9, maxAspect: 3.0,
    expectsClosed: false,
    dirHist: h([SE, 0.2], [SW, 0.2], [NE, 0.2], [NW, 0.2], [E, 0.1], [W, 0.1]),
    pathWeight: 0.4, histWeight: 0.35, structWeight: 0.25,
  },
  {
    character: 'X',
    minStrokes: 2, maxStrokes: 2,
    minAspect: 0.5, maxAspect: 2.0,
    expectsClosed: false,
    dirHist: h([NE, 0.22], [NW, 0.22], [SE, 0.22], [SW, 0.22], [N, 0.04], [S, 0.04], [E, 0.02], [W, 0.02]),
    pathWeight: 0.4, histWeight: 0.4, structWeight: 0.2,
  },
  {
    character: 'Y',
    minStrokes: 1, maxStrokes: 3,
    minAspect: 0.5, maxAspect: 1.8,
    expectsClosed: false,
    dirHist: h([NE, 0.2], [NW, 0.2], [SE, 0.05], [SW, 0.05], [S, 0.35], [N, 0.15]),
    pathWeight: 0.4, histWeight: 0.4, structWeight: 0.2,
  },
  {
    character: 'Z',
    minStrokes: 1, maxStrokes: 3,
    minAspect: 0.5, maxAspect: 2.5,
    expectsClosed: false,
    dirHist: h([E, 0.3], [W, 0.3], [SW, 0.3], [SE, 0.05], [NW, 0.05]),
    pathWeight: 0.4, histWeight: 0.4, structWeight: 0.2,
  },

  // ─── DIGITS ───
  {
    character: '0',
    minStrokes: 1, maxStrokes: 2,
    minAspect: 0.4, maxAspect: 1.3,
    expectsClosed: true,
    dirHist: h([N, 0.15], [NE, 0.12], [NW, 0.12], [S, 0.15], [SE, 0.12], [SW, 0.12], [E, 0.11], [W, 0.11]),
    pathWeight: 0.35, histWeight: 0.25, structWeight: 0.4,
  },
  {
    character: '1',
    minStrokes: 1, maxStrokes: 2,
    minAspect: 0.0, maxAspect: 0.7,
    expectsClosed: false,
    dirHist: h([S, 0.55], [N, 0.15], [SE, 0.15], [NE, 0.1], [E, 0.05]),
    pathWeight: 0.35, histWeight: 0.5, structWeight: 0.15,
  },
  {
    character: '2',
    minStrokes: 1, maxStrokes: 2,
    minAspect: 0.4, maxAspect: 1.5,
    expectsClosed: false,
    dirHist: h([E, 0.2], [NE, 0.15], [N, 0.1], [SW, 0.2], [S, 0.1], [SE, 0.05], [W, 0.2]),
    pathWeight: 0.45, histWeight: 0.35, structWeight: 0.2,
  },
  {
    character: '3',
    minStrokes: 1, maxStrokes: 2,
    minAspect: 0.4, maxAspect: 1.5,
    expectsClosed: false,
    dirHist: h([E, 0.3], [SE, 0.1], [NE, 0.1], [S, 0.15], [N, 0.15], [W, 0.1], [SW, 0.05], [NW, 0.05]),
    pathWeight: 0.45, histWeight: 0.35, structWeight: 0.2,
  },
  {
    character: '4',
    minStrokes: 2, maxStrokes: 3,
    minAspect: 0.5, maxAspect: 1.8,
    expectsClosed: false,
    dirHist: h([S, 0.35], [SE, 0.1], [SW, 0.1], [E, 0.25], [W, 0.1], [N, 0.1]),
    pathWeight: 0.4, histWeight: 0.4, structWeight: 0.2,
  },
  {
    character: '5',
    minStrokes: 1, maxStrokes: 3,
    minAspect: 0.4, maxAspect: 1.5,
    expectsClosed: false,
    dirHist: h([E, 0.2], [W, 0.2], [S, 0.2], [SE, 0.1], [SW, 0.1], [N, 0.1], [NW, 0.05], [NE, 0.05]),
    pathWeight: 0.4, histWeight: 0.35, structWeight: 0.25,
  },
  {
    character: '6',
    minStrokes: 1, maxStrokes: 2,
    minAspect: 0.4, maxAspect: 1.3,
    expectsClosed: false,
    dirHist: h([S, 0.2], [SW, 0.15], [SE, 0.1], [E, 0.15], [W, 0.15], [N, 0.15], [NE, 0.05], [NW, 0.05]),
    pathWeight: 0.45, histWeight: 0.3, structWeight: 0.25,
  },
  {
    character: '7',
    minStrokes: 1, maxStrokes: 2,
    minAspect: 0.4, maxAspect: 2.0,
    expectsClosed: false,
    dirHist: h([E, 0.35], [SW, 0.4], [W, 0.15], [SE, 0.05], [S, 0.05]),
    pathWeight: 0.45, histWeight: 0.4, structWeight: 0.15,
  },
  {
    character: '8',
    minStrokes: 1, maxStrokes: 2,
    minAspect: 0.4, maxAspect: 1.3,
    expectsClosed: true,
    dirHist: h([N, 0.12], [NE, 0.12], [NW, 0.12], [S, 0.12], [SE, 0.12], [SW, 0.12], [E, 0.14], [W, 0.14]),
    pathWeight: 0.35, histWeight: 0.3, structWeight: 0.35,
  },
  {
    character: '9',
    minStrokes: 1, maxStrokes: 2,
    minAspect: 0.4, maxAspect: 1.3,
    expectsClosed: false,
    dirHist: h([S, 0.25], [N, 0.15], [NE, 0.1], [NW, 0.1], [E, 0.15], [W, 0.15], [SE, 0.05], [SW, 0.05]),
    pathWeight: 0.4, histWeight: 0.3, structWeight: 0.3,
  },

  // ─── SYMBOLS ───
  {
    character: '+',
    minStrokes: 2, maxStrokes: 2,
    minAspect: 0.5, maxAspect: 2.0,
    expectsClosed: false,
    dirHist: h([N, 0.25], [S, 0.25], [E, 0.25], [W, 0.25]),
    pathWeight: 0.3, histWeight: 0.55, structWeight: 0.15,
  },
  {
    character: '-',
    minStrokes: 1, maxStrokes: 1,
    minAspect: 2.0, maxAspect: 20.0,
    expectsClosed: false,
    dirHist: h([E, 0.5], [W, 0.5]),
    pathWeight: 0.2, histWeight: 0.6, structWeight: 0.2,
  },
  {
    character: '=',
    minStrokes: 2, maxStrokes: 2,
    minAspect: 1.0, maxAspect: 20.0,
    expectsClosed: false,
    dirHist: h([E, 0.5], [W, 0.5]),
    pathWeight: 0.2, histWeight: 0.5, structWeight: 0.3,
  },
  {
    character: '/',
    minStrokes: 1, maxStrokes: 1,
    minAspect: 0.1, maxAspect: 1.5,
    expectsClosed: false,
    dirHist: h([NE, 0.5], [SW, 0.4], [N, 0.05], [E, 0.05]),
    pathWeight: 0.35, histWeight: 0.55, structWeight: 0.1,
  },
  {
    character: '*',
    minStrokes: 2, maxStrokes: 6,
    minAspect: 0.4, maxAspect: 2.5,
    expectsClosed: false,
    dirHist: h([N, 0.12], [NE, 0.12], [NW, 0.12], [S, 0.12], [SE, 0.12], [SW, 0.12], [E, 0.14], [W, 0.14]),
    pathWeight: 0.25, histWeight: 0.4, structWeight: 0.35,
  },
  {
    character: '.',
    minStrokes: 1, maxStrokes: 1,
    minAspect: 0.3, maxAspect: 3.0,
    expectsClosed: true,
    dirHist: h([N, 0.12], [NE, 0.12], [NW, 0.12], [S, 0.12], [SE, 0.12], [SW, 0.12], [E, 0.14], [W, 0.14]),
    pathWeight: 0.3, histWeight: 0.2, structWeight: 0.5,
  },
  {
    character: ',',
    minStrokes: 1, maxStrokes: 1,
    minAspect: 0.1, maxAspect: 1.5,
    expectsClosed: false,
    dirHist: h([S, 0.4], [SW, 0.3], [SE, 0.15], [N, 0.15]),
    pathWeight: 0.4, histWeight: 0.45, structWeight: 0.15,
  },
  {
    character: '?',
    minStrokes: 1, maxStrokes: 2,
    minAspect: 0.3, maxAspect: 1.5,
    expectsClosed: false,
    dirHist: h([E, 0.15], [NE, 0.1], [N, 0.1], [W, 0.1], [SW, 0.15], [S, 0.25], [SE, 0.1], [NW, 0.05]),
    pathWeight: 0.4, histWeight: 0.35, structWeight: 0.25,
  },
  {
    character: '!',
    minStrokes: 1, maxStrokes: 2,
    minAspect: 0.0, maxAspect: 0.5,
    expectsClosed: false,
    dirHist: h([S, 0.7], [N, 0.2], [E, 0.05], [W, 0.05]),
    pathWeight: 0.25, histWeight: 0.6, structWeight: 0.15,
  },
  {
    character: '(',
    minStrokes: 1, maxStrokes: 1,
    minAspect: 0.0, maxAspect: 1.0,
    expectsClosed: false,
    dirHist: h([S, 0.25], [SW, 0.2], [SE, 0.05], [N, 0.25], [NW, 0.2], [NE, 0.05]),
    pathWeight: 0.5, histWeight: 0.35, structWeight: 0.15,
  },
  {
    character: ')',
    minStrokes: 1, maxStrokes: 1,
    minAspect: 0.0, maxAspect: 1.0,
    expectsClosed: false,
    dirHist: h([S, 0.25], [SE, 0.2], [SW, 0.05], [N, 0.25], [NE, 0.2], [NW, 0.05]),
    pathWeight: 0.5, histWeight: 0.35, structWeight: 0.15,
  },
  {
    character: ':',
    minStrokes: 2, maxStrokes: 2,
    minAspect: 0.0, maxAspect: 0.6,
    expectsClosed: true,
    dirHist: h([N, 0.15], [NE, 0.1], [NW, 0.1], [S, 0.15], [SE, 0.1], [SW, 0.1], [E, 0.15], [W, 0.15]),
    pathWeight: 0.2, histWeight: 0.3, structWeight: 0.5,
  },
];
