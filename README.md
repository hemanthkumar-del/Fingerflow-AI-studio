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
- **Startup Environment Validation**: Automatic validation of required `VITE_*` environment variables with user-friendly configuration banners.
- **Performance**: `React.lazy()` and `<Suspense>` code-splitting for optimal bundle performance.
- **UI Feedback**: Glassmorphism toast notifications, skeleton loaders, and responsive breakpoints.
- **DevOps**: Multi-stage Docker setup & GitHub Actions CI/CD Pipeline.

---

## 🔑 Production Environment Variables Table

| Variable Name | Required | Description | Example Value |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | **Required** | Deployed FastAPI backend URL on Render | `https://fingerflow-backend.onrender.com` |
| `VITE_FIREBASE_API_KEY` | **Required** | Firebase Web App API Key | `AIzaSyB...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | **Required** | Firebase Auth Domain | `fingerflow-ai.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | **Required** | Firebase Project ID | `fingerflow-ai` |
| `VITE_FIREBASE_STORAGE_BUCKET` | **Required** | Firebase Cloud Storage Bucket | `fingerflow-ai.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | **Required** | Firebase Messaging Sender ID | `123456789012` |
| `VITE_FIREBASE_APP_ID` | **Required** | Firebase App Registration ID | `1:123456789012:web:abcdef...` |

---

## 📋 Vercel Deployment Checklist

- [x] Web Application configured as Vite Single Page Application (`frontend/vercel.json`).
- [x] Set Vercel **Root Directory** to `frontend`.
- [x] Configure all 7 required `VITE_*` environment variables in Vercel Project Settings.
- [x] Render backend deployed and accessible at `VITE_API_BASE_URL`.
- [x] Firebase Authorized Domains list includes your Vercel deployment domain (`*.vercel.app`).

---

## 📜 License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.
