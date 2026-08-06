# FingerFlow AI 🖐️✨

**FingerFlow AI** is a production-grade AI-powered Air Canvas web platform enabling real-time hand-gesture drawing, vector canvas interaction via Fabric.js, Firebase Authentication & Firestore Cloud Storage, Gemini multimodal sketch-to-art generation, handwritten OCR, math equation solving, and geometric shape recognition.

---

## 🌟 Complete Feature Matrix

### 🎨 1. Real-Time Gesture Drawing Engine
- **MediaPipe Hands Integration**: 60 FPS in-browser 21-landmark hand tracking.
- **Bézier Stroke Smoothing**: Exponential Moving Average (EMA) filter + quadratic Bézier curve interpolation to eliminate hand jitter.
- **Fabric.js Vector Canvas**: High-performance vector paths, custom brush thickness, and eraser mode.
- **Gesture Control System**:
  - **Index Finger (☝️)**: DRAW Mode
  - **Open Palm (🖐️)**: PAUSE Mode
  - **Pinch Gesture (抓/🤏)**: Dynamic Brush Thickness Scaling
- **Keyboard Shortcuts**:
  - `Ctrl + Z` / `Cmd + Z`: Undo
  - `Ctrl + Y` / `Cmd + Y`: Redo
  - `Ctrl + S` / `Cmd + S`: Save to Cloud
  - `B`: Select Brush Tool | `E`: Select Eraser Tool | `C`: Clear Canvas
- **Toolbar & History**: Color palette + custom color picker, Undo/Redo stack, Clear canvas, Camera toggle, and One-click PNG Sketch Export.

### 🤖 2. Gemini AI Intelligence Suite
- **Sketch Analysis**: Detailed structure rating, composition score (out of 10), summary, detected objects, and AI creative suggestions.
- **Sketch-to-Art Enhancement**: Art style presets (Vector Art, Realistic Photo, Anime, 3D Render, Cyberpunk Neon, Concept Art) with custom prompt bar.
- **Handwritten OCR**: Automatic text extraction from canvas drawings.
- **Math Solver**: Recognizes handwritten equations, formats in LaTeX, and computes step-by-step solutions.
- **Shape Recognition**: OpenCV contour geometry detection (Circles, Squares, Triangles, Polygons).

### 🔐 3. Firebase Authentication & Cloud Storage
- **Authentication**: Google Sign-In popup & Email/Password Auth with persistent sessions (`onAuthStateChanged`).
- **Cloud Drawing Management**: Save, Auto-save, Rename, Delete, and Favorite vector drawings.
- **My Drawings & Dashboard**: Filterable gallery with Search, Sort, Grid/List view, and user stats metrics (Total Drawings, Favorites, AI Analyses, Last Activity).
- **Vector State Restoration**: Reopen saved drawings and resume vector editing right where you left off.

### 🚀 4. Production Polish & Architecture
- **Performance**: `React.lazy()` and `<Suspense>` code-splitting for optimal bundle performance.
- **UI Feedback**: Glassmorphism toast notifications, skeleton loaders, and responsive breakpoints.
- **DevOps**: Multi-stage Docker setup & GitHub Actions CI/CD Pipeline.

---

## 📁 Repository Structure

```text
ai_canvas/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI Workflow
├── backend/
│   ├── app/
│   │   ├── api/                # FastAPI Routers (Health, AI Endpoints)
│   │   ├── core/               # Pydantic Settings & Config
│   │   ├── services/           # Gemini AI & OpenCV Shape Recognition
│   │   ├── legacy/             # Preserved Python OpenCV Engine
│   │   └── main.py             # FastAPI Server Entrypoint
│   ├── Dockerfile              # Backend Container Setup
│   └── requirements.txt        # Python Dependencies
├── frontend/
│   ├── public/                 # Favicon & Static Assets
│   ├── src/
│   │   ├── components/         # AirCanvas, FloatingToolbar, StatusHUD, AISidebar, MyDrawingsPage, Auth
│   │   ├── config/             # Firebase SDK Configuration
│   │   ├── context/            # AuthContext Provider
│   │   ├── services/           # GestureClassifier, StrokeSmoother, AIServiceClient, StorageService
│   │   ├── App.tsx             # Main Application Shell (Lazy-loaded)
│   │   └── main.tsx            # React Entrypoint
│   ├── Dockerfile              # Frontend Nginx Container Setup
│   ├── package.json            # Node Dependencies
│   └── vite.config.ts          # Vite Config
├── docker-compose.yml          # Unified Container Launch
├── .env.example                # Environment Variable Template
├── LICENSE                     # MIT License
└── README.md                   # Documentation
```

---

## 🚀 Deployment & Quick Start Guide

### Using Docker Compose
```bash
# Clone the repository
git clone https://github.com/hemanthkumar-del/ai_canvas.git
cd ai_canvas

# Copy environment template
cp .env.example .env

# Build and start containers
docker-compose up --build
```
- Access Frontend UI: `http://localhost:5173`
- Access Backend API Docs: `http://localhost:8000/docs`

---

## 📜 License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.
