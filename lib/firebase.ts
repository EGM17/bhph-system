import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth } from 'firebase/auth'

// Firebase config — these are public/safe to embed in client code
// They identify the Firebase project but don't grant any access on their own.
// Access is controlled by Firestore and Storage security rules.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyD_H-jaKx79hd_M02Ld-A7LSl9mjJhEp-E',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'el-compa-guero-895c9.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'el-compa-guero-895c9',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'el-compa-guero-895c9.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '1096008436971',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '1:1096008436971:web:245d579a5bc110053e82ae',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? 'G-7G8Q1X2VZ4',
}

// Prevent duplicate initialization in Next.js
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth(app)
export default app