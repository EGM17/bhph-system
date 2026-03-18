'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Globe, Loader2, AlertCircle, Upload, CheckCircle } from 'lucide-react'
import TipTapEditor from './TipTapEditor'
import type { BlogPost } from '@/types'

interface BlogFormClientProps {
  post: BlogPost | null
  isNew: boolean
}

const CATEGORIES = [
  { value: 'financing', label: 'Financing Tips' },
  { value: 'buying-guide', label: 'Buying Guide' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'news', label: 'News & Updates' },
  { value: 'community', label: 'Community' },
]

export default function BlogFormClient({ post, isNew }: BlogFormClientProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  // Form state
  const [titleEn, setTitleEn] = useState(post?.title?.en ?? '')
  const [titleEs, setTitleEs] = useState(post?.title?.es ?? '')
  const [excerptEn, setExcerptEn] = useState(post?.excerpt?.en ?? '')
  const [excerptEs, setExcerptEs] = useState(post?.excerpt?.es ?? '')
  const [contentEn, setContentEn] = useState(post?.content?.en ?? '')
  const [contentEs, setContentEs] = useState(post?.content?.es ?? '')
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? '')
  const [category, setCategory] = useState((post as any)?.category ?? '')
  const [isPublished, setIsPublished] = useState(post?.isPublished ?? false)
  const [activeTab, setActiveTab] = useState<'en' | 'es'>('en')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Only image files allowed.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB.'); return }

    setUploadingImage(true)
    setError('')
    try {
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage')
      const { storage } = await import('@/lib/firebase')
      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}.${ext}`
      const storageRef = ref(storage, `blog/${filename}`)
      await uploadBytes(storageRef, file, { contentType: file.type })
      const url = await getDownloadURL(storageRef)
      setCoverImage(url)
    } catch {
      setError('Failed to upload image.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')
    if (!titleEn.trim()) { setError('English title is required.'); return }

    setSaving(true)
    try {
      const { collection, addDoc, doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')

      const slug = titleEn.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      const payload = {
        title: { en: titleEn.trim(), es: titleEs.trim() || titleEn.trim() },
        excerpt: { en: excerptEn.trim(), es: excerptEs.trim() || excerptEn.trim() },
        content: { en: contentEn, es: contentEs || contentEn },
        coverImage: coverImage || null,
        category: category || null,
        isPublished,
        updatedAt: serverTimestamp(),
      }

      if (isNew) {
        await addDoc(collection(db, 'blog'), {
          ...payload,
          slug,
          createdAt: serverTimestamp(),
        })
        setSuccess('Post created successfully.')
        setTimeout(() => (window.location.href = '/admin/blog'), 1500)
      } else {
        await updateDoc(doc(db, 'blog', post!.id), payload)
        setSuccess('Post updated successfully.')
      }
    } catch (err) {
      console.error(err)
      setError('Failed to save post. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'input-field text-sm py-2.5'
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide'

  return (
    <div className="space-y-6">

      {/* Titles */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-600" />
          Title (Bilingual)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Title — English *</label>
            <input type="text" value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="How to Buy a Car with Bad Credit" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Título — Español</label>
            <input type="text" value={titleEs} onChange={e => setTitleEs(e.target.value)} placeholder="Cómo comprar un auto con mal crédito" className={inputClass} />
          </div>
        </div>
      </section>

      {/* Excerpts */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Summary / Excerpt</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Excerpt — English</label>
            <textarea value={excerptEn} onChange={e => setExcerptEn(e.target.value)} placeholder="Short description shown in blog listing..." rows={3} className={`${inputClass} resize-none`} />
          </div>
          <div>
            <label className={labelClass}>Resumen — Español</label>
            <textarea value={excerptEs} onChange={e => setExcerptEs(e.target.value)} placeholder="Descripción corta mostrada en el listado..." rows={3} className={`${inputClass} resize-none`} />
          </div>
        </div>
      </section>

      {/* Content editor */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-600" />
          Content
        </h3>

        {/* Language tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {(['en', 'es'] as const).map(lang => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveTab(lang)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === lang
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {lang === 'en' ? '🇺🇸 English' : '🇲🇽 Español'}
            </button>
          ))}
        </div>

        <div className={activeTab === 'en' ? 'block' : 'hidden'}>
          <TipTapEditor
            content={contentEn}
            onChange={setContentEn}
            placeholder="Start writing in English..."
          />
        </div>
        <div className={activeTab === 'es' ? 'block' : 'hidden'}>
          <TipTapEditor
            content={contentEs}
            onChange={setContentEs}
            placeholder="Empieza a escribir en español..."
          />
        </div>
      </section>

      {/* Cover image + category + publishing */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Publishing</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Cover image */}
          <div className="space-y-3">
            <label className={labelClass}>Cover Image</label>
            {coverImage && (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <Image src={coverImage} alt="Cover" fill className="object-cover" sizes="300px" />
              </div>
            )}
            <label className={`flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 cursor-pointer transition-colors ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploadingImage ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</> : <><Upload className="w-4 h-4" />{coverImage ? 'Change image' : 'Upload cover image'}</>}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          {/* Category + status */}
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className={inputClass}>
                <option value="">— No category —</option>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl">
              <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
              <div>
                <p className="text-sm font-semibold text-gray-700">Published</p>
                <p className="text-xs text-gray-400">Visible on public blog</p>
              </div>
            </label>
          </div>
        </div>
      </section>

      {/* Feedback */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}

      <button onClick={handleSave} disabled={saving} className="btn-primary w-full justify-center disabled:opacity-50">
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" />{isNew ? 'Creating...' : 'Saving...'}</> : isNew ? 'Create post' : 'Save changes'}
      </button>
      <button type="button" onClick={() => window.location.href = '/admin/blog'} className="btn-outline-blue w-full justify-center text-sm">
        Cancel
      </button>

    </div>
  )
}