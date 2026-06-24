import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Check if config is present before initializing to prevent startup crash
const isFirebaseConfigured = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== '';

// Initialize Firebase (Singleton pattern for Next.js)
let app: any = null;
let auth: any = null;
let db: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // Connect to emulators in development if needed
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
      // Only connect if emulators are already configured/running locally
      // connectAuthEmulator(auth, 'http://localhost:9099');
      // connectFirestoreEmulator(db, 'localhost', 8080);
    }
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

// Fallback mock definitions so the app doesn't crash on imports when unconfigured
if (!auth) {
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback: any) => {
      // Trigger callback asynchronously to avoid render cycle blocks
      const timer = setTimeout(() => callback(null), 50);
      return () => clearTimeout(timer);
    },
    signOut: async () => {},
  } as any;
}

if (!db) {
  db = {} as any;
}

export { auth, db, isFirebaseConfigured };
export default app;
