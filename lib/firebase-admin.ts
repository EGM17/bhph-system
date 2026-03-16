import 'server-only'
import { initializeApp, getApps, getApp, type App } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { getAuth } from 'firebase-admin/auth'

function getAdminApp(): App {
  if (getApps().length > 0) return getApp()

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

  // On Firebase App Hosting (Cloud Run), Application Default Credentials
  // are automatically injected — no service account key needed.
  // The service account firebase-app-hosting-compute@ already has
  // Firebase Auth Admin permissions.
  return initializeApp({ projectId, storageBucket })
}

export const adminDb = new Proxy({} as ReturnType<typeof getFirestore>, {
  get: (_t, p) => (getFirestore(getAdminApp()) as never)[p as never],
})

export const adminAuth = new Proxy({} as ReturnType<typeof getAuth>, {
  get: (_t, p) => (getAuth(getAdminApp()) as never)[p as never],
})

export const adminStorage = new Proxy({} as ReturnType<typeof getStorage>, {
  get: (_t, p) => (getStorage(getAdminApp()) as never)[p as never],
})