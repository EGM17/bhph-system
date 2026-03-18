'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Check, X, Loader2, Tag } from 'lucide-react'

interface Category {
  id: string
  nameEn: string
  nameEs: string
  slug: string
  createdAt?: string
}

export default function CategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  // Form state
  const [nameEn, setNameEn] = useState('')
  const [nameEs, setNameEs] = useState('')

  // Edit state
  const [editNameEn, setEditNameEn] = useState('')
  const [editNameEs, setEditNameEs] = useState('')

  const toSlug = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const { collection, getDocs, orderBy, query } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      const q = query(collection(db, 'blog_categories'), orderBy('nameEn', 'asc'))
      const snap = await getDocs(q)
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as Category)))
    } catch (err) {
      console.error('Failed to load categories:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!nameEn.trim()) return
    setSaving(true)
    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      const doc = await addDoc(collection(db, 'blog_categories'), {
        nameEn: nameEn.trim(),
        nameEs: nameEs.trim() || nameEn.trim(),
        slug: toSlug(nameEn),
        createdAt: serverTimestamp(),
      })
      setCategories(prev => [...prev, {
        id: doc.id,
        nameEn: nameEn.trim(),
        nameEs: nameEs.trim() || nameEn.trim(),
        slug: toSlug(nameEn),
      }].sort((a, b) => a.nameEn.localeCompare(b.nameEn)))
      setNameEn('')
      setNameEs('')
      setShowNewForm(false)
    } catch (err) {
      console.error('Failed to create category:', err)
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditNameEn(cat.nameEn)
    setEditNameEs(cat.nameEs)
  }

  const handleUpdate = async (id: string) => {
    if (!editNameEn.trim()) return
    setSaving(true)
    try {
      const { doc, updateDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      await updateDoc(doc(db, 'blog_categories', id), {
        nameEn: editNameEn.trim(),
        nameEs: editNameEs.trim() || editNameEn.trim(),
        slug: toSlug(editNameEn),
      })
      setCategories(prev => prev.map(c =>
        c.id === id
          ? { ...c, nameEn: editNameEn.trim(), nameEs: editNameEs.trim() || editNameEn.trim(), slug: toSlug(editNameEn) }
          : c
      ).sort((a, b) => a.nameEn.localeCompare(b.nameEn)))
      setEditingId(null)
    } catch (err) {
      console.error('Failed to update category:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Posts with this category will not be affected.`)) return
    setDeletingId(id)
    try {
      const { doc, deleteDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      await deleteDoc(doc(db, 'blog_categories', id))
      setCategories(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      console.error('Failed to delete category:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const inputClass = 'input-field text-sm py-2'

  if (loading) return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
      <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
    </div>
  )

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{categories.length} {categories.length === 1 ? 'category' : 'categories'}</p>
        <button
          onClick={() => { setShowNewForm(true); setEditingId(null) }}
          className="btn-primary text-sm"
        >
          <Plus className="w-4 h-4" />
          New category
        </button>
      </div>

      {/* New category form */}
      {showNewForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-blue-700">New category</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Name — English *</label>
              <input
                type="text"
                value={nameEn}
                onChange={e => setNameEn(e.target.value)}
                placeholder="Financing Tips"
                className={inputClass}
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') handleCreate() }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Nombre — Español</label>
              <input
                type="text"
                value={nameEs}
                onChange={e => setNameEs(e.target.value)}
                placeholder="Consejos de Financiamiento"
                className={inputClass}
                onKeyDown={e => { if (e.key === 'Enter') handleCreate() }}
              />
            </div>
          </div>
          {nameEn && (
            <p className="text-xs text-gray-400">Slug: <span className="font-mono">{toSlug(nameEn)}</span></p>
          )}
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={!nameEn.trim() || saving} className="btn-primary text-sm disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Create
            </button>
            <button onClick={() => { setShowNewForm(false); setNameEn(''); setNameEs('') }} className="btn-outline-blue text-sm">
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories list */}
      {categories.length === 0 && !showNewForm ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center space-y-3">
          <Tag className="w-10 h-10 text-gray-200 mx-auto" />
          <p className="text-gray-400 text-sm">No categories yet. Create your first one.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {categories.map(cat => (
            <div key={cat.id} className="p-4">
              {editingId === cat.id ? (
                /* Edit mode */
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Name — English *</label>
                      <input
                        type="text"
                        value={editNameEn}
                        onChange={e => setEditNameEn(e.target.value)}
                        className={inputClass}
                        autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') handleUpdate(cat.id) }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Nombre — Español</label>
                      <input
                        type="text"
                        value={editNameEs}
                        onChange={e => setEditNameEs(e.target.value)}
                        className={inputClass}
                        onKeyDown={e => { if (e.key === 'Enter') handleUpdate(cat.id) }}
                      />
                    </div>
                  </div>
                  {editNameEn && (
                    <p className="text-xs text-gray-400">Slug: <span className="font-mono">{toSlug(editNameEn)}</span></p>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate(cat.id)} disabled={!editNameEn.trim() || saving} className="btn-primary text-sm disabled:opacity-50">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn-outline-blue text-sm">
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <Tag className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{cat.nameEn}</p>
                      <p className="text-xs text-gray-400">{cat.nameEs} · <span className="font-mono">{cat.slug}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.nameEn)}
                      disabled={deletingId === cat.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}