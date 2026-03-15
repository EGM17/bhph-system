import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Lead } from '@/types'

const COLLECTION = 'leads'

function docToLead(id: string, data: Record<string, unknown>): Lead {
  return {
    ...(data as Omit<Lead, 'id' | 'createdAt'>),
    id,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt as string) ?? new Date().toISOString(),
  }
}

export async function createLead(
  data: Omit<Lead, 'id' | 'createdAt' | 'status'>
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    status: 'new',
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getAllLeads(): Promise<Lead[]> {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => docToLead(d.id, d.data() as Record<string, unknown>))
}

export async function updateLeadStatus(
  id: string,
  status: Lead['status']
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { status })
}
