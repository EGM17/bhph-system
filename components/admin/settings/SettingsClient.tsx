'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Upload, Loader2, CheckCircle } from 'lucide-react'

export default function SettingsClient() {
  const [heroImage, setHeroImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadSettings() {
      try {
        const { doc, getDoc } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')
        const snap = await getDoc(doc(db, 'settings', 'site'))
        if (snap.exists()) setHeroImage(snap.data().heroImage ?? null)
      } catch (err) {
        console.error('Failed to load settings:', err)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Only image files are allowed.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB.'); return }

    setError('')
    setSaving(true)
    setSuccess(false)

    try {
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage')
      const { storage } = await import('@/lib/firebase')
      const { doc, setDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')

      const ext = file.name.split('.').pop()
      const storageRef = ref(storage, `settings/hero/hero_image.${ext}`)
      await uploadBytes(storageRef, file, { contentType: file.type })
      const url = await getDownloadURL(storageRef)
      await setDoc(doc(db, 'settings', 'site'), { heroImage: url }, { merge: true })

      setHeroImage(url)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Upload failed:', err)
      setError('Failed to upload image. Please try again.')
    } finally {
      setSaving(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (loading) return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
      <p className="text-gray-400 text-sm">Loading settings...</p>
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Hero Image</h3>
        <p className="text-xs text-gray-500">Image shown on the right side of the homepage.</p>
      </div>
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
        {heroImage ? (
          <Image src={heroImage} alt="Hero image" fill className="object-cover" sizes="672px" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
            <Upload className="w-8 h-8" />
            <p className="text-sm">No image set</p>
          </div>
        )}
      </div>
      <div className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="hero-upload"
        />
        <label
          htmlFor="hero-upload"
          className={`btn-primary w-full justify-center cursor-pointer ${saving ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</>
          ) : (
            <><Upload className="w-4 h-4" />{heroImage ? 'Change image' : 'Upload image'}</>
          )}
        </label>
        {success && (
          <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 px-4 py-3 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            Image updated. Refresh the public site to see changes.
          </div>
        )}
        {error && (
          <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">{error}</p>
        )}
        <p className="text-xs text-gray-400">JPG, PNG, WebP. Max 5MB.</p>
      </div>
    </div>
  )
}
