import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration - using hardcoded values for now due to Next.js env loading issue
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDC1EYzJ87v23UuillpAqSETenCoJVYhOA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "egongegong-eoeo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "egongegong-eoeo",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "egongegong-eoeo.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1002249339676",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1002249339676:web:8fef7503c9f23f5a4eb0d9",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-BL2713R6WX",
};

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics only works in browser - lazy load
export const getAnalyticsInstance = async () => {
  if (typeof window !== 'undefined') {
    const { getAnalytics } = await import("firebase/analytics");
    return getAnalytics(app);
  }
  return null;
};
