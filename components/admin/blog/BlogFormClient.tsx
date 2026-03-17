'use client'

import { useState } from 'react'
import { Globe, Loader2, AlertCircle } from 'lucide-react'
import type { BlogPost } from '@/types'

interface BlogFormClientProps {
  post: BlogPost | null
  isNew: boolean
}

export default function BlogFormClient({ post, isNew }: BlogFormClientProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [titleEn, setTitleEn] = useState(post?.title?.en ?? '')
  const [titleEs, setTitleEs] = useState(post?.title?.es ?? '')
  const [excerptEn, setExcerptEn] = useState(post?.excerpt?.en ?? '')
  const [excerptEs, setExcerptEs] = useState(post?.excerpt?.es ?? '')
  const [contentEn, setContentEn] = useState(post?.content?.en ?? '')
  const [contentEs, setContentEs] = useState(post?.content?.es ?? '')
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? '')
  const [isPublished, setIsPublished] = useState(post?.isPublished ?? false)

  const handleSubmit = async () => {
    setError('')
    setSuccess('')

    if (!titleEn.trim()) {
      setError('English title is required.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: { en: titleEn.trim(), es: titleEs.trim() || titleEn.trim() },
        excerpt: { en: excerptEn.trim(), es: excerptEs.trim() || excerptEn.trim() },
        content: { en: contentEn.trim(), es: contentEs.trim() || contentEn.trim() },
        coverImage: coverImage.trim() || undefined,
        isPublished,
      }

      // Write directly to Firestore from the browser
      const { collection, addDoc, doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      const { generatePostSlug } = await import('@/services/blogService')

      if (isNew) {
        const slug = generatePostSlug(payload.title.en)
        await addDoc(collection(db, 'blog'), {
          ...payload,
          slug,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      } else {
        await updateDoc(doc(db, 'blog', post!.id), {
          ...payload,
          updatedAt: serverTimestamp(),
        })
      }

      setSuccess(isNew ? 'Post created successfully.' : 'Post updated successfully.')
      if (isNew) {
        setTimeout(() => (window.location.href = '/admin/blog'), 1500)
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
          <Globe className="w-4 h-4 text-blue-600" aria-hidden="true" />
          Title (Bilingual)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Title — English *</label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="How to Buy a Car with Bad Credit"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Título — Español</label>
            <input
              type="text"
              value={titleEs}
              onChange={(e) => setTitleEs(e.target.value)}
              placeholder="Cómo comprar un auto con mal crédito"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Excerpts */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-600" aria-hidden="true" />
          Excerpt / Summary (Bilingual)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Excerpt — English</label>
            <textarea
              value={excerptEn}
              onChange={(e) => setExcerptEn(e.target.value)}
              placeholder="A short description shown in blog listing..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div>
            <label className={labelClass}>Resumen — Español</label>
            <textarea
              value={excerptEs}
              onChange={(e) => setExcerptEs(e.target.value)}
              placeholder="Una descripción corta mostrada en el listado..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-600" aria-hidden="true" />
          Content (Bilingual)
        </h3>
        <p className="text-xs text-gray-400">
          HTML is supported. Use &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt; tags for formatting.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Content — English</label>
            <textarea
              value={contentEn}
              onChange={(e) => setContentEn(e.target.value)}
              placeholder="<h2>Introduction</h2><p>Content here...</p>"
              rows={14}
              className={`${inputClass} resize-y font-mono text-xs`}
            />
          </div>
          <div>
            <label className={labelClass}>Contenido — Español</label>
            <textarea
              value={contentEs}
              onChange={(e) => setContentEs(e.target.value)}
              placeholder="<h2>Introducción</h2><p>Contenido aquí...</p>"
              rows={14}
              className={`${inputClass} resize-y font-mono text-xs`}
            />
          </div>
        </div>
      </section>

      {/* Cover image + publishing */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Publishing</h3>
        <div>
          <label className={labelClass}>Cover Image URL</label>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://firebasestorage.googleapis.com/..."
            className={inputClass}
          />
          <p className="text-xs text-gray-400 mt-1">
            Upload the image to Firebase Storage and paste the URL here.
          </p>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <div className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span className="text-sm font-medium">Published on website</span>
          </div>
        </label>
      </section>

      {/* Feedback */}
      {error && (
        <div role="alert" className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pb-8">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
          {saving ? 'Saving...' : isNew ? 'Create post' : 'Save changes'}
        </button>
        <a href="/admin/blog" className="btn-outline-blue">
          Cancel
        </a>
      </div>
    </div>
  )
}