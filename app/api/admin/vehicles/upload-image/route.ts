import { NextRequest, NextResponse } from 'next/server'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import type { ApiResponse } from '@/types'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ url: string }>>> {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const vehicleId = formData.get('vehicleId') as string | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided.' },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Only JPG, PNG, and WebP images are allowed.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'Image must be under 5MB.' },
        { status: 400 }
      )
    }

    const buffer = await file.arrayBuffer()
    const ext = file.type.split('/')[1]
    const filename = `${Date.now()}-${Math.random().toString(36).slice(-6)}.${ext}`
    const path = `vehicles/${vehicleId ?? 'temp'}/${filename}`

    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, buffer, { contentType: file.type })
    const url = await getDownloadURL(storageRef)

    return NextResponse.json({ success: true, data: { url } }, { status: 200 })
  } catch (error) {
    console.error('[POST /api/admin/vehicles/upload-image]', error)
    return NextResponse.json(
      { success: false, error: 'Image upload failed.' },
      { status: 500 }
    )
  }
}
