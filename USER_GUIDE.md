# FingerFlow Studio User Guide

Welcome to FingerFlow Studio! This guide will teach you how to get the most out of your touchless creative workspace.

## Getting Started
FingerFlow Studio lets you draw, edit, organize, and create on an infinite canvas using natural hand gestures. 

## First-Time Setup
When you first log in, you will be greeted by the Interactive Guided Tour. This tour will highlight the major components of your workspace. If you skipped it, you can replay the tour at any time by clicking the **Help (?)** button in the top left and selecting "Replay Guided Tour".

## Camera & Lighting
FingerFlow Studio relies on clear visibility of your hands to translate gestures accurately.
**Good Conditions:**
- Front-facing light
- Clear hand visibility
- Contrasting background
- Hand inside camera frame
- Moderate distance from camera

**Avoid:**
- Very dark rooms
- Strong light behind your hand
- Rapidly moving hand outside the frame
- Hand blending into background
- Covering fingers

## Understanding the Workspace
- **Status HUD (Top Left):** Tells you whether your hand is detected and shows the current action (e.g. Draw, Pan Canvas).
- **Studio Sidebar (Right):** Houses your Layers and the AI Studio.
- **Floating Toolbar (Bottom):** Contains your active tools (Brush, Eraser, Selection, Export).
- **Shape Toolbar (Above Floating Toolbar):** Contains geometric shape stamps.
- **Top Left Controls:** Access Preferences, Shortcuts, Session Replay, Help, and About.

## Gesture Guide
Hold your hand steady for a moment when switching gestures to ensure stable recognition.

- ☝️ **Index Finger:** Draw / Move objects
- 🖐️ **Open Palm:** Pan Canvas / Home Dash
- ✌️ **Peace Sign:** Selection Mode
- 🤏 **Pinch:** Resize objects / Change brush size
- 👌 **OK Sign:** Duplicate selected object
- ✊ **Closed Fist:** Delete selected object
- 👍 **Thumb Up:** Save to Cloud
- 👎 **Thumb Down:** Undo
- 🖖 **Three Fingers:** Color Picker mode
- 🤘 **Rock Sign:** AI Enhance
- 🤟 **Love Sign:** Export PNG
- ⬅️ **Swipe Left:** Undo
- ➡️ **Swipe Right:** Redo
- ⬆️ **Swipe Up:** Open AI Studio
- ⬇️ **Swipe Down:** Clear Canvas

## Drawing
Raise your **Index finger ☝️** and move your hand to draw naturally on the canvas. To erase, select the Eraser tool from the bottom toolbar and repeat the gesture.

## Brush Studio
Click the Brush icon in the bottom toolbar to open the Brush Studio. Choose from 12 procedural brushes including Pencil, Ink, Neon, and Watercolor. Brushes react to your drawing velocity.

## Layer Studio
The Studio Sidebar on the right defaults to the Layer Studio. Layers help you organize your artwork. You can Add, Rename, Hide, Lock, Duplicate, Delete, Reorder, and change the Opacity of layers.

## Shape Tools
Create precise geometric shapes (Rectangle, Circle, Triangle, Star, Line, Arrow) using the Shape Toolbar. Check the "Smart Shapes" box to automatically convert your rough freehand sketches into perfect vectors.

## Writing Mode (New!)
Switch to **Writing Mode** from the Workspace Switcher in the top center to enter a distraction-free handwriting environment.
- **Index Finger (☝️):** Write accurately with heavy jitter-smoothing.
- **Open Palm (🖐️):** Erase notes naturally by hovering your palm over them.
- When finished, click **Finish Writing** to either save your notes to the main canvas or discard them safely.


## Selection Tools
Make a **Peace sign (✌️)** to enter Selection Mode (or click the cursor icon in the toolbar).
- **Move:** Point with your Index finger and drag the object.
- **Resize:** Pinch your fingers together or apart.
- **Rotate:** Select the Rotate mode from the contextual Selection Toolbar.
- **Duplicate:** Hold the OK sign (👌).
- **Delete:** Hold a Closed Fist (✊).

## Infinite Canvas
Your workspace is not limited to the screen. 
- **Pan:** Hold up an **Open Palm (🖐️)** and drag to move around the canvas.
- **Minimap:** Use the minimap in the bottom right to quickly navigate massive compositions.

## AI Studio
Open the AI Studio tab in the right sidebar to work with your artwork using Gemini AI.
- **Enhance:** Ask the AI to critique your sketch or suggest improvements.
- **Analyze:** Extract color palettes and visual metadata.
- **OCR:** Extract text directly from your handwritten notes.
- **Shapes:** Let AI refine complex drawings.

## Replay Engine
Click the `▶️` button on the top left to watch a stroke-by-stroke timelapse replay of your current drawing session.

## Export Studio
Click the Download icon in the toolbar. You can export your canvas as PNG, JPEG, SVG, PDF, JSON, or native FFStudio project formats.

## Keyboard Shortcuts
Click the `⌨️` icon in the top left to view shortcuts.
- `Ctrl+Z` / `Ctrl+Shift+Z`: Undo / Redo
- `Ctrl+S`: Cloud Save
- `B` / `E`: Brush / Eraser tools
- `C`: Clear Canvas

## Preferences
Click the `⚙️` icon in the top left to open Preferences. You can toggle **Developer Mode** here, which displays an advanced Debug Panel for tracking frame times, confidence scores, and gesture hysteresis data.

## Troubleshooting
- **Camera is not available:** Ensure your browser has camera permissions enabled and no other application is using the webcam.
- **Gestures are not detected / Poor Tracking:** Move to a brighter room and ensure the background contrasts with your hand.
- **Gestures take time to switch:** FingerFlow intentionally requires holding a gesture for 2-4 frames to prevent accidental flickering. Hold your pose steadily.
- **Canvas is blank on load:** Make sure you've selected a drawing from the Dashboard, or start drawing to create a new one.
- **Firebase authentication error:** Clear your browser cache and cookies, or try logging in with a different Google account.
- **AI Studio is unavailable:** Ensure your environment variables contain a valid Google Gemini API key.
- **Export does not work:** Allow popups/downloads in your browser settings for FingerFlow Studio.

## Frequently Asked Questions
**Q: Can I use two hands?**
A: FingerFlow Studio supports multi-hand detection under the hood, but primary drawing gestures rely on a single dominant hand.
