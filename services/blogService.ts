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
import type { BlogPost } from '@/types'

const COLLECTION = 'blog'

function docToPost(id: string, data: Record<string, unknown>): BlogPost {
  return {
    ...(data as Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>),
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

export async function getPublishedPosts(count?: number): Promise<BlogPost[]> {
  const constraints = [
    where('isPublished', '==', true),
    orderBy('createdAt', 'desc'),
    ...(count ? [limit(count)] : []),
  ]
  const q = query(collection(db, COLLECTION), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) => docToPost(d.id, d.data() as Record<string, unknown>))
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const q = query(
    collection(db, COLLECTION),
    where('slug', '==', slug),
    where('isPublished', '==', true),
    limit(1)
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  return docToPost(snap.docs[0].id, snap.docs[0].data() as Record<string, unknown>)
}

export async function getAllPostsAdmin(): Promise<BlogPost[]> {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => docToPost(d.id, d.data() as Record<string, unknown>))
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (!snap.exists()) return null
  return docToPost(snap.id, snap.data() as Record<string, unknown>)
}

export async function createPost(
  data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updatePost(
  id: string,
  data: Partial<Omit<BlogPost, 'id' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deletePost(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}

export function generatePostSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
