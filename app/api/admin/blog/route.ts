export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { generatePostSlug } from '@/services/blogService'
import type { ApiResponse } from '@/types'

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  try {
    const body = await request.json()

    if (!body.title?.en?.trim()) {
      return NextResponse.json(
        { success: false, error: 'English title is required.' },
        { status: 400 }
      )
    }

    const slug = generatePostSlug(body.title.en)

    const ref = await addDoc(collection(db, 'blog'), {
      ...body,
      slug,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return NextResponse.json(
      { success: true, data: { id: ref.id } },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/admin/blog]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create post.' },
      { status: 500 }
    )
  }
}
