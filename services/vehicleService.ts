import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Vehicle, PaginatedResult } from '@/types'

const COLLECTION = 'inventory'

// ── Helpers ───────────────────────────────────────────────────────────────────

function docToVehicle(id: string, data: Record<string, unknown>): Vehicle {
  return {
    ...(data as Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>),
    id,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt as string) ?? new Date().toISOString(),
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : (data.updatedAt as string) ?? new Date().toISOString(),
  }
}

// ── Public queries (client-side) ──────────────────────────────────────────────

export async function getPublishedVehicles(): Promise<Vehicle[]> {
  const q = query(
    collection(db, COLLECTION),
    where('isPublished', '==', true),
    where('status', '==', 'available'),
    orderBy('isFeatured', 'desc'),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => docToVehicle(d.id, d.data() as Record<string, unknown>))
}

export async function getFeaturedVehicles(count = 6): Promise<Vehicle[]> {
  const q = query(
    collection(db, COLLECTION),
    where('isPublished', '==', true),
    where('status', '==', 'available'),
    where('isFeatured', '==', true),
    orderBy('createdAt', 'desc'),
    limit(count)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => docToVehicle(d.id, d.data() as Record<string, unknown>))
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  // First try to find by slug field
  const q = query(
    collection(db, COLLECTION),
    where('slug', '==', slug),
    where('isPublished', '==', true),
    limit(1)
  )

  const snapshot = await getDocs(q)
  if (!snapshot.empty) {
    const d = snapshot.docs[0]
    return docToVehicle(d.id, d.data() as Record<string, unknown>)
  }

  // Fallback: treat slug as document id (for legacy vehicles without slug field)
  try {
    const docRef = doc(db, COLLECTION, slug)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return docToVehicle(docSnap.id, docSnap.data() as Record<string, unknown>)
    }
  } catch {
    // Not a valid document id
  }

  return null
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const docRef = doc(db, COLLECTION, id)
  const snapshot = await getDoc(docRef)
  if (!snapshot.exists()) return null
  return docToVehicle(snapshot.id, snapshot.data() as Record<string, unknown>)
}

// ── Admin CRUD ────────────────────────────────────────────────────────────────

export async function getAllVehiclesAdmin(): Promise<Vehicle[]> {
  const q = query(
    collection(db, COLLECTION),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => docToVehicle(d.id, d.data() as Record<string, unknown>))
}

export async function createVehicle(
  data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'views'>
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    views: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateVehicle(
  id: string,
  data: Partial<Omit<Vehicle, 'id' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, COLLECTION, id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteVehicle(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}

export async function incrementVehicleViews(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id)
  const snapshot = await getDoc(docRef)
  if (!snapshot.exists()) return

  const current = (snapshot.data().views as number) ?? 0
  await updateDoc(docRef, { views: current + 1 })
}

// ── Slug generation ───────────────────────────────────────────────────────────

export function generateSlug(vehicle: {
  year: number
  make: string
  model: string
  vin?: string
}): string {
  const base = `${vehicle.year}-${vehicle.make}-${vehicle.model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const suffix = vehicle.vin
    ? vehicle.vin.slice(-6).toLowerCase()
    : Math.random().toString(36).slice(-6)

  return `${base}-${suffix}`
}