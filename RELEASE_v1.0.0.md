# 🚀 FingerFlow Studio v1.0.0 – Initial Public Release

Welcome to **FingerFlow Studio**!

## Overview
FingerFlow Studio is a professional, touchless, AI-powered gesture drawing studio running natively in your web browser. Leveraging your webcam and MediaPipe hand-tracking, it translates your gestures into precise canvas operations—empowering you to sketch, select, and organize your ideas without ever touching a mouse.

## Highlights
- ✨ **Infinite Canvas**: A boundless whiteboard with seamless panning, zooming, and a dynamic minimap.
- 🎨 **Professional Brush Studio**: An advanced physics engine supporting velocity-based opacity and thickness.
- 🖌 **12 Procedural Brushes**: Includes Pencil, Ink, Watercolor, Spray, Neon, Glow, and more.
- 📐 **Smart Shape Recognition**: Draw rough shapes and watch them snap instantly into perfect vectors.
- 🗂 **Professional Layer Studio**: Hide, lock, adjust opacity, and drag-and-drop layer reordering.
- ✂ **Selection Studio**: Group, scale, rotate, and delete objects with precision bounding boxes.
- 👋 **AI Gesture Engine**: State-of-the-art hand tracking translating finger poses to canvas tools.
- 🤖 **AI Drawing Analysis**: Analyze your artwork and get critiques or code conversions via Gemini AI.
- ☁ **Firebase Authentication**: Secure Google and Email/Password login.
- ☁ **Cloud Save**: Instant manual save via the Thumbs Up gesture.
- 💾 **Auto Save**: Background cloud synchronization every 30 seconds to prevent data loss.
- ▶ **Replay Engine**: Clear your canvas and watch a timelapse of your entire drawing session stroke-by-stroke.
- 📤 **Export Studio**: Download as true PDF, SVG, high-res PNG/JPEG, or a native `.ffstudio` JSON project.
- 🛠 **Developer Mode**: Toggle an advanced overlay tracking FPS, memory, and engine coordinates in real-time.
- ⌨ **Command Palette**: Hit `Ctrl + K` to spotlight search any tool or engine function instantly.
- ⚙ **Preferences**: Robust settings modal for tweaking your workspace.
- 🔐 **Secure Authentication**: End-to-end security via Firebase Auth and Firestore rules.
- ♾ **Infinite Whiteboard**: Complete freedom to roam and brainstorm without borders.

## Tech Stack
- **Frontend**: React, TypeScript, Vite
- **Canvas Engine**: Fabric.js
- **Machine Learning**: MediaPipe Hands
- **Backend & AI**: FastAPI (Python), Gemini AI Pro & Vision
- **Cloud Infrastructure**: Firebase (Auth, Firestore, Storage)
- **Deployment**: Vercel (Frontend), Render (Backend)

## Feature Summary (The Journey to 1.0)
- **Phase 1 (The Sandbox)**: Bootstrapped React + Fabric.js and proved the rendering capability.
- **Phase 2 (Hand Tracking)**: Integrated MediaPipe to map webcam hand landmarks to screen coordinates.
- **Phase 3 (Gesture Engine)**: Built the semantic gesture recognition engine (Index Point, Open Palm, Closed Fist).
- **Phase 4 (Cloud Infrastructure)**: Hooked up Firebase Auth, Firestore, and Cloud Storage for persistent drawings.
- **Phase 5 (AI Integration)**: Built the FastAPI backend to interface with Google Gemini AI for drawing analysis.
- **Phase 6 (Performance)**: Implemented Stroke Smoothing (Chaikin's algorithm) and optimized rendering pipelines.
- **Phase 7 (Deployment)**: Containerized the backend and deployed to Render, while deploying the frontend to Vercel.
- **Phase 9.1 (Engine Refactor)**: Rebuilt the monolithic application into modular decoupled classes (CanvasManager, EventBus).
- **Phase 9.2 (Layer Studio)**: Built a Tag-Based Layer system mimicking Figma/Photoshop workflows.
- **Phase 9.3 (Selection Studio)**: Implemented contextual bounding box transformations.
- **Phase 9.4 (Brush Studio)**: Built a plugin architecture for procedural, velocity-sensitive brushes.
- **Phase 9.5 (Infinite Canvas)**: Upgraded the fixed-size canvas to a world-space coordinate system with Smart Shape snapping.
- **Phase 9.6 (Studio Polish & 1.0)**: Added Auto-Save, Replay Engine, Export Studio, Command Palette, and Developer Mode.

## Installation
**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app:app --reload
```

**Environment Variables:**
Create `.env.local` in `frontend` containing Firebase SDK config and `VITE_API_BASE_URL`.
Create `.env` in `backend` containing `GEMINI_API_KEY`.

## Known Limitations
- **Single-user only**: Real-time multiplayer collaboration is not supported yet.
- **Session replay only**: The Replay Engine timeline resets on a page refresh (to save database bandwidth).
- **Gesture bounds**: Two-hand gestures (e.g., two-hand pinch zoom) are reserved for a future update.
- **Shape Recognition**: The heuristic AI snapping is currently limited to primitive geometric shapes (Circle, Box, Line, Arrow).

## Roadmap Preview (Version 2.0 & Beyond)
The future is bright! We are actively researching and planning:
- **Real-time Collaboration**: Multi-user whiteboards using WebSockets/WebRTC.
- **Voice Commands**: Triggering tools via voice ("Switch to Blue Pen").
- **AI Copilot**: A conversational agent living directly on your canvas.
- **Plugin Marketplace**: Easily install community Brushes, Shapes, and Gestures.
- **Desktop & Mobile Apps**: Native clients via Electron/Tauri and React Native.
- **Presentation Mode**: A clean UI toggle for educators and presenters.

## Assets
![Logo Placeholder](/assets/logo_placeholder.png)
![Screenshot Placeholder](/assets/screenshot_placeholder.png)
![Architecture Diagram Placeholder](/assets/architecture_diagram_placeholder.png)
![Demo Video Placeholder](/assets/demo_video_placeholder.mp4)
![Demo GIF Placeholder](/assets/demo_gif_placeholder.gif)

*Thank you to everyone who supported this project on the road to 1.0!*
