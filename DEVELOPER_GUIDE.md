# FingerFlow Studio - Developer Guide

Welcome to the FingerFlow Studio engine! This guide will help you understand the codebase and how to extend the canvas engine.

## Folder Structure
- `frontend/src/engine/`: The core engine (CanvasManager, HistoryManager, ViewportManager).
- `frontend/src/engine/brushes/`: Brush Plugin implementations.
- `frontend/src/engine/shapes/`: Shape Plugin implementations.
- `frontend/src/engine/commands/`: Undo/Redo Command implementations.
- `frontend/src/components/`: React UI components.

## Manager Responsibilities
- **CanvasManager**: The facade. Receives raw coordinates, handles viewport translation, and dispatches to plugins.
- **LayerManager**: Manages active layers and handles complex z-index sorting without using Fabric Groups.
- **HistoryManager**: Manages the Undo/Redo stack of `Command` objects.
- **ViewportManager**: Handles infinite canvas Pan/Zoom math.

## Creating New Brush Plugins
To add a new brush, create a class implementing `BrushPlugin`:
```typescript
import { BrushPlugin } from './BrushManager';

export class MyNewBrush implements BrushPlugin {
  id = 'my_brush';
  name = 'My Brush';
  
  updateStroke(canvas: fabric.Canvas, points: Point[], color: string, size: number) {
    // Generate fabric objects based on points and add them to canvas
  }
}
```
Register it in `BrushManager.ts`.

## Creating Shape Plugins
Implement `ShapePlugin` in `ShapeManager.ts`. A shape plugin should generate a single `fabric.Object` when the shape tool is clicked on the canvas.

## Creating Gestures
Gestures are detected in `GestureEngine.ts`. To add a new gesture:
1. Define the finger states (e.g., Pinky Up, others Down).
2. Add the semantic state to `GestureType`.
3. Map the state to an action in `gestureSettings.ts`.

## Creating Commands
Any action that modifies the canvas MUST be wrapped in a `Command` for the HistoryManager.
Implement the `Command` interface:
```typescript
export class MyCommand implements Command {
  execute() { /* do action */ }
  undo() { /* reverse action */ }
}
```

## Using EventBus
React components should NEVER read mutable state directly from the engine during a render loop.
Instead, listen to the `EventBus`:
```typescript
useEffect(() => {
  const handler = (data) => setMyState(data);
  engine.eventBus.on('my:event', handler);
  return () => engine.eventBus.off('my:event', handler);
}, []);
```

## Coding Standards
- Strictly type all engine functions.
- Do not import React components into the `engine/` folder.
- Maintain 60 FPS. Avoid `O(n^2)` operations in `updateStroke` loops.

## Contribution Workflow
See [CONTRIBUTING.md](CONTRIBUTING.md).
