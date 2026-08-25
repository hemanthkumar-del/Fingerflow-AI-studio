# PHASE 10.1.1 — Writing Mode Reliability Hotfix

## Summary
Two production issues were fixed in this patch:
1. **Index finger writing detection was unreliable** — gestures weren't consistently recognized during writing
2. **Writing UI persisted after Save/Don't Save** — the toolbar stayed visible after exiting Writing Mode

---

## Issue 1 — Index Finger Detection Reliability

### Root Cause
The Writing Mode gesture intercept in `AirCanvas.tsx` relied entirely on the general-purpose `GestureEngine`'s classification result (`gestureResult.gesture === 'DRAW'`). The `GestureEngine` is tuned for Canvas Mode — it has Canvas-specific cooldowns, confidence thresholds, and action debouncing that made it unreliable for the continuous, high-frequency writing detection that Writing Mode requires.

Specifically:
- The GestureEngine has a `cooldownActive` period after every action that blocks subsequent gestures
- It debounces between gesture transitions, creating "dead zones" where writing wouldn't register
- It requires minimum hold duration before recognizing some gestures
- A single noisy frame could break a writing stroke prematurely

### Fix — `WritingIndexDetector.ts`

Created a **dedicated geometric index-finger detector** for Writing Mode that:
- **Reads raw MediaPipe landmarks directly** — no dependency on GestureEngine classification
- Uses **fingertip-to-MCP distance ratios** relative to palm size for finger extension detection
- Requires at least **2 of 3 non-index fingers to be curled** (prevents false positives from peace, OK, three-fingers, etc.)
- Implements a full **state machine** with temporal hysteresis

#### Temporal Hysteresis

| Transition | Frames Required |
|---|---|
| IDLE → WRITE | 2 consistent index-extended frames |
| WRITE → IDLE | 4 consecutive non-index frames |
| IDLE → ERASE | 2 consistent open-palm frames |
| ERASE → IDLE | 3 consecutive non-palm frames |
| WRITE → ERASE | 2 consistent palm frames |
| ERASE → WRITE | 2 stable index frames (PALM→INDEX guard) |

This prevents: `INDEX INDEX NO_INDEX INDEX INDEX` from creating broken strokes.

#### Tracking-Loss Tolerance
When MediaPipe loses hand tracking for up to **4 consecutive frames**, the detector holds its current state (WRITE/ERASE/IDLE). Only after 4 consecutive missed frames does it revert to IDLE. This prevents:
- Brief MediaPipe detection drops from breaking writing strokes mid-character
- Lighting changes from terminating strokes unexpectedly

#### Geometric Detection
```
Index extended if:
  dist(TIP[8], MCP[5]) / palmSize >= 0.7   AND
  TIP[8].y < PIP[6].y                       AND  (tip is above PIP)
  at least 2 of {middle, ring, pinky} are curled

Open palm if:
  all 4 fingers (index, middle, ring, pinky) are extended
```

The z-coordinate is weighted at 0.5× to reduce noise from the less-reliable depth channel.

### Module Store Pattern

Following the existing `writingEngineStore` pattern, a new `writingDetectorStore.ts` module-level ref was created. This allows the MediaPipe gesture loop (inside a `useEffect` stale closure) to read the detector without any React hook staleness.

### AirCanvas Integration
The Writing Mode intercept in `AirCanvas.tsx` was updated:
- **Before:** `if (gestureResult.gesture === 'DRAW')` — dependent on GestureEngine
- **After:** `const writingState = detector.update(primaryLandmarks)` — geometric, independent

The no-hand branch also calls `detector.update(null)` to advance the tracking-loss tolerance counter correctly.

---

## Issue 2 — Writing UI Persisting After Save/Don't Save

### Root Cause
`WritingUI` maintained internal React state (`showExit`, `recognitionResult`) that persisted between renders. When `setMode('canvas')` was called:
1. `currentModeId` changed to `'canvas'`
2. `WritingUI` returned `null` (correct — toolbar hidden)
3. But if the user re-entered Writing Mode, `showExit` could still be `true` from the previous session

Additionally, in some timing situations the exit dialog could appear to linger due to render scheduling.

### Fix — `WritingUI.tsx`

Added a `useEffect` that runs whenever `currentModeId` changes. If the mode is no longer `'writing'`, it resets `showExit` to `false` and clears `recognitionResult`:

```tsx
useEffect(() => {
  if (currentModeId !== 'writing') {
    setShowExit(false);
    setRecognitionResult(null);
  }
}, [currentModeId]);
```

This guarantees:
- The exit dialog is always dismissed when leaving Writing Mode
- Re-entering Writing Mode always starts with a clean UI state
- No stale recognition results carry over between sessions

---

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/workspace/modes/writing/WritingIndexDetector.ts` | **NEW** — dedicated geometric index detector with full state machine |
| `frontend/src/workspace/writingDetectorStore.ts` | **NEW** — module-level ref store for the detector |
| `frontend/src/workspace/modes/WritingWorkspace.ts` | Creates/destroys `WritingIndexDetector` on activate/deactivate |
| `frontend/src/components/AirCanvas.tsx` | Replaced gesture-classifier-based writing intercept with `WritingIndexDetector`; added no-hand tracking-loss notification |
| `frontend/src/workspace/WritingUI.tsx` | Added `useEffect` to reset `showExit` + `recognitionResult` on mode change |
| `frontend/src/workspace/modes/writing/WritingEngine.ts` | Removed `indexStableFrames` (now handled by `WritingIndexDetector`) |

## Canvas Mode Protection
- Canvas Mode gesture logic is completely unchanged
- The writing intercept returns early (`return`) before any Canvas Mode code runs
- MediaPipe pipeline was not restarted
- GestureEngine, BrushManager, LayerManager, ShapeManager, SelectionManager — untouched

## Build Result
```
✓ 1955 modules transformed
✓ Built in 9.56s
Exit code: 0 (0 TypeScript errors)
```

## Commit
**Hash:** `c60dee8`  
**Message:** `fix: improve writing gesture reliability and exit flow`
