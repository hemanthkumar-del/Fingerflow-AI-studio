# FingerFlow Studio Changelog

## Version 1.0.0 (The Studio Polish Release)
*Phase 9.6*
- **Rebrand**: Officially renamed to FingerFlow Studio!
- **Auto-Save**: Implemented background cloud saving every 30s.
- **Replay Engine**: Added session timelapse replay capabilities.
- **Export Studio**: Added support for true PDF generation, SVG, and high-res PNG/JPEG exports.
- **Command Palette**: Added `Ctrl+K` global command search.
- **Developer Mode**: Added advanced debug panel for engine metrics.
- **UI Polish**: Added Preferences, Shortcuts overlay, and About dialogs.

## Version 0.9.5 (Infinite Canvas)
*Phase 9.5*
- **ViewportManager**: Abstracted camera controls for an infinite world-space canvas.
- **Minimap**: Added a viewport navigator UI.
- **ShapeManager**: Implemented Smart Shape recognition (0ms heuristic local snapping).

## Version 0.9.4 (Brush Studio)
*Phase 9.4*
- **Plugin Architecture**: Refactored brushes into modular plugins.
- **New Brushes**: Added Pencil, Ink, Neon, Glow, Spray, and Watercolor brushes.
- **Physics Engine**: Added velocity-based dynamic stroke thickness and opacity.

## Version 0.9.3 (Selection Studio)
*Phase 9.3*
- **SelectionManager**: Added Box, Single, and Multi-selection.
- **Transformations**: Added Scale, Rotate, Move, and Delete capabilities.
- **Layer Integration**: Selection now perfectly ignores hidden and locked layers.

## Version 0.9.2 (Layer Studio)
*Phase 9.2*
- **LayerManager**: Replaced flat canvas with a Tag-Based Layer system.
- **Layer UI**: Added Hide, Lock, Opacity, and drag-and-drop Reordering capabilities.
- **History Sync**: Layer operations are now fully undoable.

## Version 0.9.1 (Engine Refactor)
*Phase 9.1*
- **Architecture**: Decoupled `AirCanvas.tsx` into modular Engine classes (`CanvasManager`, `EventBus`).
- **Command Pattern**: Implemented highly scalable Undo/Redo architecture.

## Version 0.8.0 - 0.1.0 (The Sandbox Phases)
*Phases 1-8*
- Built the foundational React + Fabric.js canvas.
- Integrated MediaPipe hand tracking and `GestureEngine`.
- Built Firebase Auth and Cloud Storage integrations.
- Integrated Google Gemini AI for canvas analysis and code generation.
- Added Stroke Smoothing (Moving Average + Chaikin).
