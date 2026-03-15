import 'server-only'
import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { getAuth } from 'firebase-admin/auth'

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0]
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  const clientEmail = process.env.APP_CLIENT_EMAIL ?? process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = (process.env.APP_PRIVATE_KEY ?? process.env.FIREBASE_PRIVATE_KEY)?.replace(/\\n/g, '\n')

  // During build time, credentials won't be available — return a placeholder app
  if (!clientEmail || !privateKey) {
    return initializeApp({
      projectId,
      storageBucket,
    })
  }

  return initializeApp({
    credential: cert({ projectId: projectId!, clientEmail, privateKey }),
    storageBucket,
  })
}

const adminApp = getAdminApp()

export const adminDb = getFirestore(adminApp)
export const adminStorage = getStorage(adminApp)
export const adminAuth = getAuth(adminApp)