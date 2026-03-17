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

  // Normalize private key — handle all possible formats:
  // 1. Literal \n strings: "-----BEGIN...\nMII..."
  // 2. Real newlines from Vercel env var editor
  // 3. Escaped quotes around the key
  const privateKey = rawKey
    .replace(/\\n/g, '\n')  // literal \n → real newline
    .replace(/^["']|["']$/g, '') // strip surrounding quotes if any
    .trim()

  console.log('[firebase-admin] projectId:', projectId)
  console.log('[firebase-admin] clientEmail:', clientEmail)
  console.log('[firebase-admin] privateKey starts with:', privateKey.slice(0, 30))
  console.log('[firebase-admin] privateKey ends with:', privateKey.slice(-30))

  if (!clientEmail || !privateKey) {
    console.warn('[firebase-admin] Missing credentials — admin operations will fail')
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