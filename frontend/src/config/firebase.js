import { initializeApp } from "firebase/app";
import { getMessaging, isSupported, getToken, onMessage } from "firebase/messaging";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
  vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || null,
};

export const app = firebaseConfig.apiKey && firebaseConfig.projectId ? initializeApp(firebaseConfig) : null;

/**
 * Safely retrieve Firebase Messaging instance if supported by the runtime browser
 */
export async function getFirebaseMessaging() {
  try {
    const supported = await isSupported();
    if (supported && app) {
      return getMessaging(app);
    }
  } catch (e) {
    console.warn("FCM messaging is not supported in this browser environment:", e.message);
  }
  return null;
}

export {
  getToken,
  onMessage,
  isSupported,
};

