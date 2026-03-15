export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Lead, ApiResponse } from '@/types'

const VALID_STATUSES: Lead['status'][] = ['new', 'contacted', 'closed']

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = await params
    const body = await request.json()
    const status = body.status as Lead['status']

    if (!id || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request.' },
        { status: 400 }
      )
    }

    await updateDoc(doc(db, 'leads', id), { status })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PATCH /api/admin/leads/:id]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    )
  }
}