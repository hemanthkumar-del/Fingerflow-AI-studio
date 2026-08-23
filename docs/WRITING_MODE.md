# Writing Mode (Phase 10.1)

Writing Mode is a dedicated workspace within FingerFlow Studio specifically designed for highly accurate handwriting, note-taking, and documentation.

## Architecture

Writing Mode isolates its input processing from the standard Canvas Mode to ensure maximum fidelity and zero accidental activations of complex tools (like shapes or AI selection).

### 1. `WritingStabilizer.ts`
Uses a tightly tuned One Euro Filter setup:
- `mincutoff = 1.5` for strong smoothing at slow drawing speeds to eliminate jitter.
- `beta = 0.1` for responsiveness during fast strokes.

### 2. `WritingEngine.ts`
Manages the core state for the mode:
- Direct bypass of standard `CanvasManager` logic.
- Maintains `isWriting`, `isErasing`, and ink styling.
- Spatial palm eraser that only targets objects physically near the palm coordinates on the canvas.

### 3. `WritingSessionManager.ts`
Ensures that notes taken during a writing session can be cleanly discarded if the user decides not to save them. It tags drawn objects with a `writingSession` property. On exit, if the user discards, these objects are selectively removed without clearing the rest of the canvas.

## User Workflow
1. Switch to **Writing Mode** using the workspace mode switcher.
2. The UI will simplify to a bottom-left Writing Toolbar.
3. **Index Finger** draws directly. No need to select a tool.
4. **Open Palm** acts as an area eraser. Move your palm over text to erase it.
5. Click **Finish Writing** to open the exit dialog.
6. Choose **Save Notes** to commit the session to the canvas, or **Discard Notes** to revert.
