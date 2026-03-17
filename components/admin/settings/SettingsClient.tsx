'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Upload, Loader2, CheckCircle } from 'lucide-react'

interface HeroSettings {
  heroImage?: string
  span1Text?: string
  span1Color?: string
  span1SizeMobile?: string
  span1SizeDesktop?: string
  span2Text?: string
  span2Color?: string
  span2SizeMobile?: string
  span2SizeDesktop?: string
  subtitle?: string
}

export default function SettingsClient() {
  const [settings, setSettings] = useState<HeroSettings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingSaving, setUploadingSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadSettings() {
      try {
        const { doc, getDoc } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')
        const snap = await getDoc(doc(db, 'settings', 'site'))
        if (snap.exists()) setSettings(snap.data() as HeroSettings)
      } catch (err) {
        console.error('Failed to load settings:', err)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const showSuccess = () => {
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const handleSaveText = async () => {
    setSaving(true)
    setError('')
    try {
      const { doc, setDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      await setDoc(doc(db, 'settings', 'site'), settings, { merge: true })
      showSuccess()
    } catch (err) {
      console.error('Save failed:', err)
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Only image files are allowed.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB.'); return }

    setError('')
    setUploadingSaving(true)
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
      setSettings(prev => ({ ...prev, heroImage: url }))
      showSuccess()
    } catch (err) {
      console.error('Upload failed:', err)
      setError('Failed to upload image.')
    } finally {
      setUploadingSaving(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const textField = (label: string, key: keyof HeroSettings, placeholder: string) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">{label}</label>
      <input
        type="text"
        value={settings[key] || ''}
        onChange={e => setSettings(prev => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
        className="input-field text-sm py-2"
      />
    </div>
  )

  const colorField = (label: string, key: keyof HeroSettings, defaultColor: string) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={settings[key] || defaultColor}
          onChange={e => setSettings(prev => ({ ...prev, [key]: e.target.value }))}
          className="w-10 h-10 rounded cursor-pointer border border-gray-300"
        />
        <input
          type="text"
          value={settings[key] || ''}
          onChange={e => setSettings(prev => ({ ...prev, [key]: e.target.value }))}
          placeholder={defaultColor}
          className="input-field text-sm py-2 flex-1"
        />
      </div>
    </div>
  )

  if (loading) return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
      <p className="text-gray-400 text-sm">Loading settings...</p>
    </div>
  )

  return (
    <div className="space-y-6">

      {/* Hero Image */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Hero Image</h3>
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
          {settings.heroImage ? (
            <Image src={settings.heroImage} alt="Hero" fill className="object-cover" sizes="672px" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
              <Upload className="w-8 h-8" />
              <p className="text-sm">No image set</p>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="hero-upload" />
        <label htmlFor="hero-upload" className={`btn-primary w-full justify-center cursor-pointer ${uploadingSaving ? 'opacity-50 pointer-events-none' : ''}`}>
          {uploadingSaving
            ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</>
            : <><Upload className="w-4 h-4" />{settings.heroImage ? 'Change image' : 'Upload image'}</>
          }
        </label>
        <p className="text-xs text-gray-400">JPG, PNG, WebP. Max 5MB.</p>
      </div>

      {/* Hero Text */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h3 className="text-sm font-semibold text-gray-900">Hero Text</h3>
        <p className="text-xs text-gray-400">Font sizes accept any CSS value: 32px, 2rem, 2.5rem, etc.</p>

        {/* Span 1 */}
        <div className="border-b border-gray-100 pb-5 space-y-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Line 1 (e.g. Financing)</p>
          {textField('Text', 'span1Text', 'Financing')}
          {colorField('Color', 'span1Color', '#ffffff')}
          <div className="grid grid-cols-2 gap-3">
            {textField('Size — Mobile', 'span1SizeMobile', '2.25rem')}
            {textField('Size — Desktop', 'span1SizeDesktop', '3.75rem')}
          </div>
        </div>

        {/* Span 2 */}
        <div className="border-b border-gray-100 pb-5 space-y-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Line 2 (e.g. interest-free)</p>
          {textField('Text', 'span2Text', 'interest-free')}
          {colorField('Color', 'span2Color', '#F59E0B')}
          <div className="grid grid-cols-2 gap-3">
            {textField('Size — Mobile', 'span2SizeMobile', '2.25rem')}
            {textField('Size — Desktop', 'span2SizeDesktop', '3.75rem')}
          </div>
        </div>

        {/* Subtitle */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Subtitle paragraph</p>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Text</label>
          <textarea
            value={settings.subtitle || ''}
            onChange={e => setSettings(prev => ({ ...prev, subtitle: e.target.value }))}
            placeholder="We offer easy and fast financing on pre-owned vehicles..."
            rows={3}
            className="input-field text-sm py-2 resize-none"
          />
        </div>

        <button
          onClick={handleSaveText}
          disabled={saving}
          className="btn-primary w-full justify-center disabled:opacity-50"
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : 'Save changes'}
        </button>

        {success && (
          <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 px-4 py-3 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            Saved. Refresh the public site to see changes.
          </div>
        )}
        {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">{error}</p>}
      </div>

    </div>
  )
}