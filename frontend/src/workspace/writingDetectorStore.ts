import { WritingIndexDetector } from './modes/writing/WritingIndexDetector';

/**
 * Module-level store for the WritingIndexDetector instance.
 * Allows the MediaPipe gesture loop (inside a stale useEffect closure)
 * to read the detector safely without React hook staleness.
 */
export const writingDetectorStore: { current: WritingIndexDetector | null } = {
  current: null,
};
