export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

// Session duration: 5 days
const SESSION_DURATION_MS = 5 * 24 * 60 * 60 * 1000

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'Missing ID token.' }, { status: 400 })
    }

    // Create a session cookie via Firebase Admin
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    })

    const response = NextResponse.json({ success: true }, { status: 200 })

    response.cookies.set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION_MS / 1000,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[POST /api/admin/session]', error)
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true }, { status: 200 })
  response.cookies.delete('session')
  return response
}