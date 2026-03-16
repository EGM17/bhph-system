import 'server-only'
import {
  initializeApp,
  getApps,
  cert,
  getApp,
  type App,
} from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { getAuth } from 'firebase-admin/auth'

function getAdminApp(): App {
  // Return existing app if already initialized
  if (getApps().length > 0) {
    return getApp()
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  const clientEmail =
    process.env.APP_CLIENT_EMAIL ?? process.env.FIREBASE_CLIENT_EMAIL
  const rawKey =
    process.env.APP_PRIVATE_KEY ?? process.env.FIREBASE_PRIVATE_KEY ?? ''

  // Normalize private key — handle both literal \n and real newlines
  const privateKey = rawKey.includes('\\n')
    ? rawKey.replace(/\\n/g, '\n')
    : rawKey

  if (!clientEmail || !privateKey || !projectId) {
    // Build time — initialize without credentials (no admin operations will work)
    console.warn(
      '[firebase-admin] Initializing without credentials (build time). ' +
        `clientEmail: ${!!clientEmail}, privateKey: ${!!privateKey}`
    )
    return initializeApp({ projectId, storageBucket })
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket,
  })
}

// Lazy getters — Firebase Admin is only initialized when first accessed
export function getAdminDb() {
  return getFirestore(getAdminApp())
}

export function getAdminStorage() {
  return getStorage(getAdminApp())
}

export function getAdminAuth() {
  return getAuth(getAdminApp())
}

// Keep legacy exports for compatibility
export const adminDb = new Proxy({} as ReturnType<typeof getFirestore>, {
  get(_target, prop) {
    return (getFirestore(getAdminApp()) as never)[prop as never]
  },
})

export const adminAuth = new Proxy({} as ReturnType<typeof getAuth>, {
  get(_target, prop) {
    return (getAuth(getAdminApp()) as never)[prop as never]
  },
})

export const adminStorage = new Proxy({} as ReturnType<typeof getStorage>, {
  get(_target, prop) {
    return (getStorage(getAdminApp()) as never)[prop as never]
  },
})