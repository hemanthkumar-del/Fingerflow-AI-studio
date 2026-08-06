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
│   ├── vercel.json             # Vercel SPA Routing Configuration
│   └── vite.config.ts          # Vite Config
├── docker-compose.yml          # Unified Container Launch
├── .env.example                # Environment Variable Template
├── LICENSE                     # MIT License
└── README.md                   # Documentation
```

---

## 🌐 Production Deployment Guide

### Deploying Frontend to Vercel

1. Import the `ai_canvas` GitHub repository into **Vercel**.
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Vite`.
4. Configure Environment Variables in Vercel Dashboard:
   - `VITE_API_BASE_URL`: `https://your-fingerflow-backend.onrender.com`
   - `VITE_FIREBASE_API_KEY`: Your Firebase API key
   - `VITE_FIREBASE_AUTH_DOMAIN`: `your-app.firebaseapp.com`
   - `VITE_FIREBASE_PROJECT_ID`: `your-project-id`
   - `VITE_FIREBASE_STORAGE_BUCKET`: `your-app.appspot.com`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`: Your sender ID
   - `VITE_FIREBASE_APP_ID`: Your app ID
5. Click **Deploy**.

### Deploying Backend to Render

1. Create a **Web Service** on **Render** linked to `ai_canvas`.
2. Set **Root Directory** to `backend`.
3. Set **Environment** to `Python` (or `Docker`).
4. Set **Start Command** to:
   `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variable `GEMINI_API_KEY`.
6. Click **Deploy Web Service**.

---

## 📜 License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.
