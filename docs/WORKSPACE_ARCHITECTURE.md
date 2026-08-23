# FingerFlow Studio Workspace Architecture

## Overview
As of Phase 10.0, FingerFlow Studio has transitioned from a monolith canvas application into a modular Workspace Mode Architecture. This allows the application to cleanly support different cognitive tasks (like drawing, writing, planning, or presenting) without duplicating the core engine, UI layout, or MediaPipe hand-tracking pipeline.

## Core Concepts

### 1. `WorkspaceMode` (Interface)
Defines a specific functional mode for the application.
- Has identity metadata (`id`, `name`, `icon`, `description`).
- `activate(engine)`: Hook to configure the environment when the mode is switched to.
- `deactivate(engine)`: Hook to clean up state when leaving the mode.
- `getGestureProfile()`: Returns the conceptual mapping of physical gestures to logical actions for this specific mode.
- `getStatusMessage()`: Determines how the UI explains the current gesture state to the user in a natural language format.

### 2. `WorkspaceManager`
A controller class that manages switching between registered `WorkspaceMode` instances. It invokes `activate()` and `deactivate()` on the modes, passing the single global `CanvasManager` instance.

### 3. `WorkspaceRegistry`
A simple singleton registry where modes (like `CanvasWorkspaceImpl`, `WritingWorkspaceImpl`) register themselves during application boot.

### 4. `WorkspaceContext`
A React Context that wraps the main application. It exposes the current mode, a setter to change the mode, and the list of available registered modes. It instantiates the `WorkspaceManager`.

### 5. `GestureProfile`
A concept that allows identical physical gestures (e.g., `DRAW`) to mean different things conceptually depending on the mode.
- In **Canvas Mode**, `DRAW` maps to "Draw/Erase strokes".
- In **Writing Mode**, `DRAW` will map to "Write Text".

## Current Implementations

### Canvas Mode (`canvas`)
The protected, baseline FingerFlow Studio v1.0 implementation. It offers infinite canvas drawing, procedural brushes, layers, geometric shapes, selection tools, and AI integration. 

### Writing Mode (`writing`)
Currently implemented strictly as a placeholder to validate the architecture without impacting stability. In Phase 10.1, it will be populated with handwriting recognition, an eraser gesture mapping, and real-time OCR.

## Design Philosophy
- **Single Engine Policy:** Changing modes does not destroy the `CanvasManager`, the Fabric.js canvas, or the MediaPipe camera pipeline. This guarantees instantaneous switching and prevents accidental data loss.
- **Incremental Abstraction:** We avoid over-engineering. `AirCanvas.tsx` still handles the physical MediaPipe loop, but now delegates conceptual UI logic (like `StatusHUD` text) to the active `WorkspaceMode`.
