# FingerFlow AI 🖐️✨

**FingerFlow AI** is a production-grade AI-powered Air Canvas web platform enabling real-time hand-gesture drawing, vector canvas rendering via Fabric.js, Gemini-powered sketch-to-art generation, handwritten OCR, math equation solving, and geometric shape recognition.

---

## ✨ Features Implemented

### 🎨 1. Real-Time Gesture Drawing Engine
- **MediaPipe Hands Integration**: 60 FPS in-browser 21-landmark hand tracking.
- **Bézier Stroke Smoothing**: Exponential Moving Average (EMA) filter + quadratic Bézier curve interpolation to eliminate hand jitter.
- **Fabric.js Vector Canvas**: High-performance vector paths, custom brush thickness, and eraser mode.
- **Gesture Control System**:
  - **Index Finger (☝️)**: DRAW Mode
  - **Open Palm (🖐️)**: PAUSE Mode
  - **Pinch Gesture (🤏)**: Dynamic Brush Thickness Adjuster
- **Toolbar & History**: Preset colors + custom color picker, Undo/Redo stack, Clear canvas, Camera toggle, and One-click PNG Sketch Export.

### 🤖 2. Gemini AI Intelligence Suite
- **Sketch Analysis**: Detailed structure rating, summary, detected objects, and creative suggestions.
- **Sketch-to-Art Enhancement**: Style presets (Vector Art, Realistic Photo, Anime, 3D Render, Cyberpunk Neon, Concept Art) with custom prompt bar.
- **Handwritten OCR**: Automatic text extraction from canvas drawings.
- **Math Solver**: Recognizes handwritten equations, formats in LaTeX, and computes step-by-step solutions.
- **Shape Recognition**: OpenCV contour geometry detection (Circles, Squares, Triangles, Polygons).

### ⚡ 3. Architecture & DevOps
- **Frontend**: React 18, Vite, TypeScript, Fabric.js, MediaPipe Hands, Firebase SDK.
- **Backend**: FastAPI, Uvicorn, Google Generative AI SDK, Firebase Admin SDK, OpenCV.
- **DevOps**: Docker, Docker Compose, GitHub Actions CI/CD Pipeline.

---

## 📁 Repository Layout

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
│   │   ├── components/         # AirCanvas, FloatingToolbar, StatusHUD, AISidebar
│   │   ├── config/             # Firebase SDK Configuration
│   │   ├── services/           # GestureClassifier, StrokeSmoother, AIServiceClient
│   │   ├── App.tsx             # Main Application Shell
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

## 🚀 Quick Start Guide

### Using Docker Compose
```bash
# Clone the repository
git clone https://github.com/hemanthkumar-del/ai_canvas.git
cd ai_canvas

# Copy environment template
cp .env.example .env

# Build and start services
docker-compose up --build
```
- Access Frontend UI: `http://localhost:5173`
- Access Backend API Docs: `http://localhost:8000/docs`

---

## 📜 License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.
