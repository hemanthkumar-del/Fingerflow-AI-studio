# PHASE_10_1_HOTFIX — React Error #310 Fix

## Summary
A production crash was introduced during Phase 10.1 (Writing Mode). Switching from Canvas Mode to Writing Mode caused **Minified React error #310** ("Rendered more hooks than during the previous render"), crashing the application.

A secondary branding defect was also resolved: the title displayed as "FingerFlow Studio Studio" in the loading screen and error boundary.

---

## Root Cause

### React error #310 — `WritingUI.tsx`

**File:** `frontend/src/workspace/WritingUI.tsx`

The component called hooks **after** an early `return null` statement. This violates React's **Rules of Hooks**, which require every hook to be called in the same order on every render, unconditionally.

#### The Broken Code (before fix)

```tsx
export const WritingUI: React.FC = () => {
  const { currentModeId, setMode } = useWorkspace(); // hook #1
  const [showExit, setShowExit] = useState(false);   // hook #2
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null); // hook #3

  if (currentModeId !== 'writing') return null;  // ← EARLY RETURN

  // ↓ These hooks are NEVER reached when mode is 'canvas'
  const handleAcceptRecognition = useCallback(...); // hook #4 — skipped!
  const handleDismissRecognition = useCallback(...); // hook #5 — skipped!
  ...
};
```

When the mode was **canvas**, React rendered 3 hooks.  
When the mode switched to **writing**, React rendered 5 hooks.  
On the **next** canvas-mode render, React expected 5 hooks but got 3.  
→ **React error #310: "Rendered more hooks than during the previous render"**

#### The Fix

All hooks are now called unconditionally at the top of the component. The mode guard `if (currentModeId !== 'writing') return null` is moved to **after** all hook declarations.

```tsx
export const WritingUI: React.FC = () => {
  // ── ALL hooks unconditionally called first ──────────────────────
  const { currentModeId, setMode } = useWorkspace();
  const [showExit, setShowExit] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const handleExitClick = useCallback(() => { ... }, []);
  const handleSave = useCallback(() => { ... }, [setMode]);
  const handleDiscard = useCallback(() => { ... }, [setMode]);
  const handleCancel = useCallback(() => { ... }, []);
  const handleAcceptRecognition = useCallback((character: string) => { ... }, []);
  const handleDismissRecognition = useCallback(() => { ... }, []);

  // ── Early return AFTER all hooks ────────────────────────────────
  if (currentModeId !== 'writing') return null;
  ...
};
```

---

## Branding Fix

**Files affected:**
- `frontend/src/components/common/ErrorBoundary.tsx` — line 74: `"FingerFlow Studio Studio"` → `"FingerFlow Studio"`
- `frontend/src/App.tsx` — line 48: `"Loading FingerFlow Studio Studio..."` → `"Loading FingerFlow Studio..."`

---

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/workspace/WritingUI.tsx` | **Primary fix**: moved all `useCallback` hooks before the early return |
| `frontend/src/components/common/ErrorBoundary.tsx` | Branding: removed duplicate "Studio" |
| `frontend/src/App.tsx` | Branding: removed duplicate "Studio" |

---

## What Was NOT Changed

- Canvas Mode behavior — completely unchanged
- MediaPipe tracking pipeline — untouched
- `WritingEngine`, `WritingStabilizer`, `WritingSessionManager` — untouched
- `currentModeStore`, `writingEngineStore` — untouched
- `CharacterRecognizer` and all Phase 10.2 recognition logic — untouched
- All gesture mappings (INDEX=write, PALM=erase) — untouched
- The full Save / Don't Save / Cancel exit flow — preserved

---

## Verification

- **Build:** `npm run build` → exit code 0, 1953 modules transformed, 0 TypeScript errors
- **Mode switching:** Canvas → Writing → Canvas (repeated) no longer crashes
- **Canvas artwork** survives Writing Mode entry and exit
- **MediaPipe** does not restart on mode switch
- **Smart Recognition** toggle remains functional in Writing toolbar
- **Branding** corrected in loading screen and error boundary

## Commit
**Hash:** see current master  
**Message:** `fix: resolve Writing Mode React hook crash`
