import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Safe environment variable retrieval with production fallback config
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || 'demo-firebase-api-key';
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'fingerflow-ai.firebaseapp.com';
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'fingerflow-ai';
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'fingerflow-ai.appspot.com';
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012';
const appId = import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef1234567890';

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
};

let app;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch (e) {
  console.warn('Firebase initializeApp warning:', e);
  app = getApps().length > 0 ? getApp() : initializeApp({ apiKey: 'demo-key', projectId: 'demo-project' });
}

// Safely export initialized services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export default app;
