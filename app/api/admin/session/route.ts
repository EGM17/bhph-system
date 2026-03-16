export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

function getAdminAuth() {
  if (getApps().length > 0) {
    return getAuth(getApp())
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!
  const clientEmail = process.env.APP_CLIENT_EMAIL ?? process.env.FIREBASE_CLIENT_EMAIL
  const rawKey = process.env.APP_PRIVATE_KEY ?? process.env.FIREBASE_PRIVATE_KEY ?? ''
  const privateKey = rawKey.includes('\\n') ? rawKey.replace(/\\n/g, '\n') : rawKey

  console.log('[session] clientEmail present:', !!clientEmail)
  console.log('[session] privateKey present:', !!privateKey)
  console.log('[session] projectId:', projectId)

  const app = initializeApp({
    credential: cert({ projectId, clientEmail: clientEmail!, privateKey }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  })

  return getAuth(app)
}

const SESSION_DURATION_MS = 5 * 24 * 60 * 60 * 1000

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'Missing ID token.' }, { status: 400 })
    }

    const auth = getAdminAuth()
    const decodedToken = await auth.verifyIdToken(idToken)
    console.log('[session] Token verified for uid:', decodedToken.uid)

    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    })

    const response = NextResponse.json({ success: true }, { status: 200 })
    response.cookies.set('session', sessionCookie, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: SESSION_DURATION_MS / 1000,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[POST /api/admin/session] Full error:', error)
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true }, { status: 200 })
  response.cookies.delete('session')
  return response
}