export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { ApiResponse } from '@/types'

type Params = { params: Promise<{ id: string }> }

export async function PUT(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = await params
    const body = await request.json()

    await updateDoc(doc(db, 'blog', id), {
      ...body,
      updatedAt: serverTimestamp(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PUT /api/admin/blog/:id]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update post.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: Params
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = await params
    await deleteDoc(doc(db, 'blog', id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/admin/blog/:id]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete post.' },
      { status: 500 }
    )
  }
}