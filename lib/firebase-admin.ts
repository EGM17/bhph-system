import 'server-only'
import { initializeApp, getApps, getApp, cert, deleteApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { getAuth } from 'firebase-admin/auth'

const APP_NAME = 'bhph-admin'

function getAdminApp() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const rawKey = process.env.FIREBASE_PRIVATE_KEY ?? ''
  const privateKey = rawKey.replace(/\\n/g, '\n').replace(/^["']|["']$/g, '').trim()

  // Check if app already initialized with credentials
  const existing = getApps().find(a => a.name === APP_NAME)
  if (existing) return existing

  if (!clientEmail || !privateKey) {
    throw new Error(
      `Firebase Admin credentials missing. ` +
      `FIREBASE_CLIENT_EMAIL: ${!!clientEmail}, ` +
      `FIREBASE_PRIVATE_KEY: ${!!privateKey}`
    )
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket,
  }, APP_NAME)
}

export const adminDb = getFirestore(getAdminApp())
export const adminAuth = getAuth(getAdminApp())
export const adminStorage = getStorage(getAdminApp())