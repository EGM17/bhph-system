import 'server-only'
import { initializeApp, getApps, getApp, cert, type App } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { getAuth } from 'firebase-admin/auth'

function getAdminApp(): App {
  if (getApps().length > 0) return getApp()

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL!
  const rawKey = process.env.FIREBASE_PRIVATE_KEY ?? ''
  const privateKey = rawKey.includes('\\n')
    ? rawKey.replace(/\\n/g, '\n')
    : rawKey

  if (!clientEmail || !privateKey) {
    // Build time fallback — no admin operations will work
    return initializeApp({ projectId, storageBucket })
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket,
  })
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