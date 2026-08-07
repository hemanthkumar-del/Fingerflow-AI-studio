# FingerFlow Studio

> **Create Naturally with Gestures and AI.**

![Hero Banner](/assets/hero_placeholder.png)

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://semver.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Fabric.js](https://img.shields.io/badge/Fabric.js-1B2631?style=flat&logo=javascript&logoColor=F7DF1E)](http://fabricjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=white)](https://firebase.google.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=flat&logo=render&logoColor=white)](https://render.com/)

## Overview
FingerFlow Studio is a professional AI-powered gesture drawing studio built for the browser. Leveraging advanced hand-tracking (MediaPipe), an extensible canvas engine (Fabric.js), and state-of-the-art AI generation (Gemini), FingerFlow Studio transforms your webcam into an interactive, touchless creative workstation.

## Features
- **Gesture Control**: Draw, erase, select, and pan using natural hand gestures. No mouse required.
- **Professional Brush Engine**: Dynamic brush physics with velocity sensitivity and procedural textures.
- **Layer Studio**: Fully-featured layer management system (hide, lock, opacity, drag-and-drop ordering).
- **Infinite Canvas**: World-space coordinates with seamless panning, zooming, and a minimap.
- **AI Integration**: AI-assisted shape recognition, image analysis, and generation via Gemini.
- **Replay Engine**: Watch your session unfold stroke by stroke.
- **Auto-Save & Cloud Sync**: Seamless integration with Firebase for instant cloud storage.
- **Export Studio**: High-res PNG, JPEG, vector SVG, multi-page PDF, and raw `.ffstudio` projects.

## Gallery
Check out the clean, modern interface of FingerFlow Studio.

<div align="center">
  <img src="docs/screenshots/01-home.png" alt="Home Screen" width="45%" />
  <img src="docs/screenshots/02-login.png" alt="Login Screen" width="45%" />
  <br/>
  <img src="docs/screenshots/03-workspace.png" alt="Main Workspace" width="45%" />
  <img src="docs/screenshots/04-gesture-drawing.png" alt="Gesture Drawing" width="45%" />
  <br/>
  <img src="docs/screenshots/05-brush-studio.png" alt="Brush Studio" width="45%" />
  <img src="docs/screenshots/06-layer-studio.png" alt="Layer Studio" width="45%" />
  <br/>
  <img src="docs/screenshots/07-selection.png" alt="Selection Studio" width="45%" />
  <img src="docs/screenshots/08-infinite-canvas.png" alt="Infinite Canvas" width="45%" />
  <br/>
  <img src="docs/screenshots/09-shapes.png" alt="Shapes" width="45%" />
  <img src="docs/screenshots/10-ai-sidebar.png" alt="AI Sidebar" width="45%" />
  <br/>
  <img src="docs/screenshots/11-replay.png" alt="Replay Engine" width="45%" />
  <img src="docs/screenshots/12-export.png" alt="Export Studio" width="45%" />
  <br/>
  <img src="docs/screenshots/13-developer-mode.png" alt="Developer Mode" width="45%" />
  *(Preferences and About Dialog omitted due to API quotas)*
</div>

## Architecture
FingerFlow Studio follows a modular, plugin-based Architecture.

![Architecture Diagram](/assets/architecture_placeholder.png)

Read the deep-dive in [ARCHITECTURE.md](ARCHITECTURE.md).

## Technology Stack
### Frontend
- **Framework**: React 18 & Vite
- **Language**: TypeScript
- **Canvas Engine**: Fabric.js
- **Hand Tracking**: MediaPipe Hands
- **Styling**: Tailwind CSS & Lucide React

### Backend
- **Framework**: FastAPI (Python)
- **AI**: Google Gemini Pro & Gemini Pro Vision
- **Database**: Firebase Firestore
- **Storage**: Firebase Cloud Storage

## Project Structure
```text
ai_canvas/
├── frontend/             # React Vite Application
│   ├── src/
│   │   ├── components/   # React UI components
│   │   ├── engine/       # Core CanvasManager and Plugin APIs
│   │   ├── hooks/        # React hooks
│   │   └── services/     # Firebase and AI services
├── backend/              # FastAPI Server
│   ├── app.py            # AI endpoints
│   └── requirements.txt
└── .github/              # Issue and PR templates
```

## Getting Started

### Installation & Frontend Setup
1. Clone the repository: `git clone https://github.com/hemanthkumar-del/ai_canvas.git`
2. Navigate to frontend: `cd ai_canvas/frontend`
3. Install dependencies: `npm install`
4. Start dev server: `npm run dev`

### Backend Setup (Optional for AI)
1. Navigate to backend: `cd ai_canvas/backend`
2. Create virtual env: `python -m venv venv`
3. Activate env: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
4. Install dependencies: `pip install -r requirements.txt`
5. Start server: `uvicorn app:app --reload`

### Configuration
1. Create a `.env` file in the frontend folder based on `.env.example`.
2. Add your Firebase config keys.
3. Add your Gemini AI API key to the backend `.env`.

## Gestures & Controls
- ☝️ **Index Point**: Draw
- ✊ **Closed Fist**: Erase
- ✌️ **Peace Sign**: Select / Interact
- 🖐️ **Open Palm**: Pan Canvas
- 👍 **Thumb Up**: Trigger Cloud Save
- 🤏 **Pinch**: Zoom / Scale

For a full breakdown of the UI, check out the [USER_GUIDE.md](USER_GUIDE.md).

## Keyboard Shortcuts
- `Ctrl + K`: Command Palette
- `Ctrl + Z`: Undo
- `Ctrl + Y`: Redo
- `Ctrl + Scroll`: Zoom

## Performance
- **Zero-Latency Snapping**: Heuristic local shape recognition runs in 0ms.
- **60 FPS**: EventBus decoupling prevents React re-renders from lagging the canvas stroke updates.
- **Developer Mode**: Toggle via Settings to monitor FPS, frame times, memory, and coordinates.

## Roadmap
See our plans for Version 1.1 and beyond in [ROADMAP.md](ROADMAP.md).

## Contributing
We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits
Built with passion by the open-source community.
