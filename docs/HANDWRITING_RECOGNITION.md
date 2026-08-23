# FingerFlow Studio — Handwriting Recognition (Phase 10.2)

## Overview

Phase 10.2 adds a fully local, deterministic handwriting recognition pipeline to Writing Mode. Recognition runs entirely in the browser — no cloud API, no network requests, no latency from external services.

## Architecture

```
WritingEngine (stroke lifecycle)
    │
    ▼  (raw screen points per stroke)
StrokeSession (pipeline coordinator)
    │
    ├── CharacterBoundaryDetector (temporal + spatial grouping)
    │           │
    │     (completed character strokes)
    │           │
    ├── StrokeNormalizer (translate → scale → resample to 64 pts)
    │           │
    ├── FeatureExtractor (direction histogram, corners, symmetry, etc.)
    │           │
    ├── CharacterRecognizer (template matching → confidence score)
    │           │
    └── RecognitionResult → RecognitionOverlay (UI)
```

## Recognition Algorithm

### 1. Stroke Normalization
Each stroke is resampled to **64 equidistant points** using arc-length parameterization. Points are then:
- Translated so the centroid is at the origin
- Scaled uniformly to fit within [-1, 1] space

This makes recognition **scale-invariant** and **translation-invariant**.

### 2. Feature Extraction
From the normalized combined path (all strokes concatenated), the system extracts:

| Feature | Description |
|---|---|
| Direction histogram | 8-bin histogram of movement direction (E/NE/N/NW/W/SW/S/SE) |
| Aspect ratio | Width/Height of the original bounding box |
| Closedness | Whether the path starts and ends near the same point |
| Corner count ratio | Density of significant direction changes |
| Vertical symmetry | How symmetric the path is top-to-bottom |
| Horizontal symmetry | How symmetric the path is left-to-right |

### 3. Template Matching
Every character (A-Z, 0-9, common symbols) has a **CharacterTemplate** encoding:
- Expected stroke count range
- Expected aspect ratio range
- Whether the path should be closed (O, 0, 8, etc.)
- An idealized direction histogram

The recognizer scores each candidate by computing:
```
score = histWeight × histSimilarity + pathWeight × pathScore + structWeight × structScore
```

where `histSimilarity` is the **cosine similarity** between the input direction histogram and the template histogram.

### 4. Confidence & Thresholds
| Confidence | Behavior |
|---|---|
| ≥ 85% | High confidence — shown with green overlay, Accept button |
| 65–84% | Medium confidence — shown with orange, alternatives displayed |
| < 65% | Low — no overlay shown, handwriting preserved silently |

### 5. Character Boundary Detection
A character may span multiple strokes (e.g., 'A' with a crossbar, 'i' with a dot). The `CharacterBoundaryDetector` groups strokes using:
- **Temporal gap**: > 600ms between strokes → new character
- **Spatial gap**: > 80% of current character width from last endpoint → new character
- **Stroke count limit**: Maximum 5 strokes per character

### 6. Word Detection
The `WordDetector` groups recognized characters into words using a spatial gap threshold of **1.5× the average character width**.

## Supported Characters

### Uppercase Letters
A B C D E F G H I J K L M N O P Q R S T U V W X Y Z

### Digits
0 1 2 3 4 5 6 7 8 9

### Symbols
`+` `-` `=` `/` `*` `.` `,` `?` `!` `(` `)` `:`

## Tolerance for Imperfect Handwriting

The recognizer tolerates:
- ✅ Uneven strokes
- ✅ Different sizes (scale-invariant normalization)
- ✅ Slightly rotated characters (golden-section angle search)
- ✅ Shaky lines (per-stroke stabilizer applied before recognition)
- ✅ Missing or incomplete corners (aspect ratio tolerance ±20%)
- ✅ Variable writing speed

It does **not** automatically reject:
- Characters drawn in an unusual stroke order
- Characters with extra strokes (up to the max stroke limit)

## Usage

1. Enter **Writing Mode** from the top mode switcher.
2. In the **Writing Toolbar** (bottom-left), toggle **Smart Recognition** ON.
3. Draw a character with your index finger.
4. Pause briefly — the system detects the character boundary automatically.
5. A floating overlay shows the recognized character + confidence.
6. Click **Accept** to acknowledge, or **Keep handwriting** to dismiss.

## Performance

- Recognition runs **only on stroke completion** (not every camera frame).
- The pipeline is pure TypeScript — no WebAssembly, no GPU.
- Recognition typically completes in **<5ms** for a single character.
- Zero impact on Writing Mode smoothness.

## Phase 10.3+ Roadmap

- Place recognized characters as editable Fabric.js text objects on the canvas
- AI fallback for low-confidence characters (Gemini integration)
- Cursive/connected handwriting support
- Punctuation and mathematical notation
