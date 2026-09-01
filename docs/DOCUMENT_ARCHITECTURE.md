# WorkspaceDocument Architecture

## Overview
The `WorkspaceDocument` architecture introduces a single source of truth for FingerFlow Studio projects, ensuring that Canvas Mode and Writing Mode coexist as two unified experiences within the same persistent document.

## 1. Document Model (`WorkspaceDocument.ts`)
The `WorkspaceDocument` is a strongly typed TypeScript interface containing:
- **Metadata**: Unique `id`, `title`, timestamps, `version` schema, and `activeMode`.
- **Canvas**: The underlying serialized Fabric state.
- **Writing**: Configuration and settings specific to Writing Mode.

*Design Principle*: The document strictly contains serializable persistent state. High-frequency transient state (MediaPipe camera streams, UI toggles, React timers) is explicitly excluded.

## 2. Document Manager (`DocumentManager.ts`)
The `DocumentManager` abstracts all persistence, validation, and serialization logic away from React components.
- Handles document lifecycle (`createDocument`, `deserializeDocument`, `serializeDocument`).
- Synchronizes with `CanvasManager` and `StorageService`.
- Maintains internal `status` (clean, dirty, saving, saved, error).

## 3. Storage & AutoSave Integration
Instead of building a redundant storage layer, `DocumentManager` seamlessly wraps the existing Firebase integration (`storageService.ts`). 
- When `DocumentManager.saveDocument()` executes, it generates the JSON serialization of `WorkspaceDocument` and stores it into the existing `fabricJson` field in Firebase.
- The `AutoSaveManager` connects directly to `DocumentManager`, utilizing the document's built-in dirty state and save functions.

## 4. UI Layer
The React layer (`AirCanvas.tsx` & `WorkspaceContext.tsx`) interacts with `DocumentManager` via a lightweight EventBus, preventing unnecessary per-frame re-renders. The UI strictly subscribes to `document:status_changed`, `document:renamed`, and `document:loaded` for displaying the new Document Header (title and dirty-state pill).

## 5. Migration Strategy
`DOCUMENT_SCHEMA_VERSION` is currently `1`. During `deserializeDocument`, the Document Manager detects if the incoming payload has `.metadata.version`. If missing, it gracefully falls back to legacy load behavior by passing the raw JSON directly to `CanvasManager`. In the future, formal migration functions can transform schema versions during loading.
