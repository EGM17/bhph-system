export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const SESSION_DURATION_MS = 5 * 24 * 60 * 60 * 1000 // 5 days

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'Missing ID token.' }, { status: 400 })
    }

    // Verify token with Firebase Auth REST API — no Admin SDK needed
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY

    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    )

    if (!verifyRes.ok) {
      console.error('[session] Token verification failed:', await verifyRes.text())
      return NextResponse.json({ error: 'Invalid token.' }, { status: 401 })
    }

    const data = await verifyRes.json()
    const uid = data.users?.[0]?.localId

    if (!uid) {
      return NextResponse.json({ error: 'User not found.' }, { status: 401 })
    }

    console.log('[session] Token verified for uid:', uid)

    // Store the idToken directly as the session cookie
    const response = NextResponse.json({ success: true }, { status: 200 })
    response.cookies.set('session', idToken, {
      httpOnly: true,
      secure: true,
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