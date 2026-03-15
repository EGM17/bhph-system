export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { generateSlug } from '@/services/vehicleService'
import type { ApiResponse } from '@/types'

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  try {
    const body = await request.json()

    const slug = generateSlug({
      year: body.year,
      make: body.make,
      model: body.model,
      vin: body.vin,
    })

    const docRef = await addDoc(collection(db, 'inventory'), {
      ...body,
      slug,
      views: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return NextResponse.json(
      { success: true, data: { id: docRef.id } },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/admin/vehicles]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create vehicle.' },
      { status: 500 }
    )
  }
}