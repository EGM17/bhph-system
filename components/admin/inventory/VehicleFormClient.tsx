'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Star, Globe, AlertCircle, Loader2, Search, Sparkles } from 'lucide-react'
import type { Vehicle, VehicleImage, FinancingType, VehicleStatus } from '@/types'

interface VehicleFormClientProps {
  vehicle: Vehicle | null
  isNew: boolean
}

interface ImagePreview {
  file?: File
  url: string
  isPrimary: boolean
  order: number
}

type Tone = 'professional' | 'friendly' | 'urgent' | 'enthusiastic'
type Focus = 'features' | 'financing' | 'family' | 'value'

export default function VehicleFormClient({ vehicle, isNew }: VehicleFormClientProps) {
  const [saving, setSaving] = useState(false)
  const [decoding, setDecoding] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // AI state
  const [generatingEn, setGeneratingEn] = useState(false)
  const [generatingEs, setGeneratingEs] = useState(false)
  const [showAiEn, setShowAiEn] = useState(false)
  const [showAiEs, setShowAiEs] = useState(false)
  const [toneEn, setToneEn] = useState<Tone>('friendly')
  const [focusEn, setFocusEn] = useState<Focus>('features')
  const [toneEs, setToneEs] = useState<Tone>('friendly')
  const [focusEs, setFocusEs] = useState<Focus>('features')

  // Form state
  const [titleEn, setTitleEn] = useState(vehicle?.title?.en ?? '')
  const [titleEs, setTitleEs] = useState(vehicle?.title?.es ?? '')
  const [descEn, setDescEn] = useState(vehicle?.description?.en ?? '')
  const [descEs, setDescEs] = useState(vehicle?.description?.es ?? '')
  const [year, setYear] = useState(vehicle?.year?.toString() ?? '')
  const [make, setMake] = useState(vehicle?.make ?? '')
  const [model, setModel] = useState(vehicle?.model ?? '')
  const [trim, setTrim] = useState(vehicle?.trim ?? '')
  const [vin, setVin] = useState(vehicle?.vin ?? '')
  const [mileage, setMileage] = useState(vehicle?.mileage?.toString() ?? '')
  const [bodyClass, setBodyClass] = useState(vehicle?.bodyClass ?? '')
  const [fuelType, setFuelType] = useState(vehicle?.fuelType ?? '')
  const [engine, setEngine] = useState(vehicle?.engine ?? '')
  const [mpg, setMpg] = useState(vehicle?.mpg ?? '')
  const [color, setColor] = useState(vehicle?.color ?? '')
  const [transmission, setTransmission] = useState(vehicle?.transmission ?? '')
  const [drivetrain, setDrivetrain] = useState(vehicle?.drivetrain ?? '')
  const [cylinders, setCylinders] = useState(vehicle?.cylinders ?? '')
  const [doors, setDoors] = useState(vehicle?.doors ?? '')
  const [displacement, setDisplacement] = useState(vehicle?.displacement ?? '')
  const [series, setSeries] = useState(vehicle?.series ?? '')
  const [financingType, setFinancingType] = useState<FinancingType>(vehicle?.financingType ?? 'in-house')
  const [price, setPrice] = useState(vehicle?.price?.toString() ?? '')
  const [monthlyPayment, setMonthlyPayment] = useState(vehicle?.monthlyPaymentFrom?.toString() ?? '')
  const [downPayment, setDownPayment] = useState(vehicle?.downPaymentFrom?.toString() ?? '')
  const [status, setStatus] = useState<VehicleStatus>(vehicle?.status ?? 'available')
  const [isPublished, setIsPublished] = useState(vehicle?.isPublished ?? false)
  const [isFeatured, setIsFeatured] = useState(vehicle?.isFeatured ?? false)

  const [images, setImages] = useState<ImagePreview[]>(
    vehicle?.images?.map((img, i) => ({ url: img.url, isPrimary: img.isPrimary, order: i })) ?? []
  )

  const getVehicleData = () => ({
    year, make, model, trim, mileage, color, bodyClass, engine,
    transmission, drivetrain, fuelType, mpg, doors, financingType,
    monthlyPayment, downPayment, price,
  })

  // ── AI Generate ────────────────────────────────────────────────────────────
  const handleGenerate = async (lang: 'en' | 'es') => {
    const isEs = lang === 'es'
    if (isEs) setGeneratingEs(true)
    else setGeneratingEn(true)

    try {
      const res = await fetch('/api/admin/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleData: getVehicleData(),
          tone: isEs ? toneEs : toneEn,
          focus: isEs ? focusEs : focusEn,
          language: lang,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (isEs) { setDescEs(data.description); setShowAiEs(false) }
      else { setDescEn(data.description); setShowAiEn(false) }
    } catch (err) {
      setError('Failed to generate description. Please try again.')
    } finally {
      if (isEs) setGeneratingEs(false)
      else setGeneratingEn(false)
    }
  }

  // ── VIN Decode ─────────────────────────────────────────────────────────────
  const handleDecodeVin = async () => {
    if (!vin.trim() || vin.trim().length !== 17) {
      setError('Please enter a valid 17-character VIN.')
      return
    }
    setDecoding(true)
    setError('')
    try {
      const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin.trim()}?format=json`)
      const data = await res.json()
      const results: { Variable: string; Value: string }[] = data.Results ?? []
      const get = (v: string) => results.find(r => r.Variable === v)?.Value?.trim() || ''

      const decodedYear = get('Model Year')
      const decodedMake = get('Make')
      const decodedModel = get('Model')
      const decodedTrim = get('Trim')
      const decodedBody = get('Body Class')
      const decodedFuel = get('Fuel Type - Primary')
      const decodedCylinders = get('Engine Number of Cylinders')
      const decodedDisplacement = get('Displacement (L)')
      const decodedDoors = get('Doors')
      const decodedDrivetrain = get('Drive Type')
      const decodedTransmission = get('Transmission Style')
      const decodedSeries = get('Series')

      if (decodedYear) setYear(decodedYear)
      if (decodedMake) setMake(decodedMake)
      if (decodedModel) setModel(decodedModel)
      if (decodedTrim) setTrim(decodedTrim)
      if (decodedBody) setBodyClass(decodedBody)
      if (decodedFuel) setFuelType(decodedFuel)
      if (decodedCylinders) setCylinders(decodedCylinders)
      if (decodedDisplacement) setDisplacement(`${decodedDisplacement}L`)
      if (decodedDoors) setDoors(decodedDoors)
      if (decodedDrivetrain) setDrivetrain(decodedDrivetrain)
      if (decodedTransmission) setTransmission(decodedTransmission)
      if (decodedSeries) setSeries(decodedSeries)

      const engineParts = [decodedCylinders ? `${decodedCylinders}-cyl` : '', decodedDisplacement ? `${decodedDisplacement}L` : '', decodedFuel || ''].filter(Boolean)
      if (engineParts.length > 0) setEngine(engineParts.join(' '))
      if (!titleEn && decodedYear && decodedMake && decodedModel) {
        setTitleEn(`${decodedYear} ${decodedMake} ${decodedModel}${decodedTrim ? ' ' + decodedTrim : ''}`)
      }

      setSuccess('VIN decoded successfully. Review and edit the fields below.')
      setTimeout(() => setSuccess(''), 4000)
    } catch {
      setError('Failed to decode VIN. Please check the VIN and try again.')
    } finally {
      setDecoding(false)
    }
  }

  // ── Images ─────────────────────────────────────────────────────────────────
  const handleImageFiles = (files: FileList) => {
    const newPreviews: ImagePreview[] = []
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return
      if (file.size > 5 * 1024 * 1024) { setError('Each image must be under 5MB.'); return }
      const url = URL.createObjectURL(file)
      newPreviews.push({ file, url, isPrimary: images.length === 0 && newPreviews.length === 0, order: images.length + newPreviews.length })
    })
    setImages(prev => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => setImages(prev => prev.filter((_, i) => i !== index).map((img, i) => ({ ...img, order: i, isPrimary: i === 0 ? true : img.isPrimary })))
  const setPrimary = (index: number) => setImages(prev => prev.map((img, i) => ({ ...img, isPrimary: i === index })))

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    if (!titleEn.trim() || !make.trim() || !model.trim() || !year) {
      setError('Title (EN), make, model and year are required.')
      return
    }
    setSaving(true)
    try {
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage')
      const { storage } = await import('@/lib/firebase')

      const uploadedImages: VehicleImage[] = []
      for (const img of images) {
        if (img.file) {
          const ext = img.file.name.split('.').pop() ?? 'jpg'
          const filename = `${Date.now()}-${Math.random().toString(36).slice(-6)}.${ext}`
          const vehicleId = vehicle?.id ?? 'temp'
          const storageRef = ref(storage, `vehicles/${vehicleId}/${filename}`)
          await uploadBytes(storageRef, img.file, { contentType: img.file.type })
          const url = await getDownloadURL(storageRef)
          uploadedImages.push({ url, isPrimary: img.isPrimary, order: img.order })
        } else {
          uploadedImages.push({ url: img.url, isPrimary: img.isPrimary, order: img.order })
        }
      }

      const payload = {
        title: { en: titleEn.trim(), es: titleEs.trim() || titleEn.trim() },
        description: { en: descEn.trim(), es: descEs.trim() },
        year: parseInt(year), make: make.trim(), model: model.trim(),
        trim: trim.trim() || undefined, vin: vin.trim() || undefined,
        mileage: parseInt(mileage) || 0,
        bodyClass: bodyClass.trim() || undefined, fuelType: fuelType.trim() || undefined,
        engine: engine.trim() || undefined, mpg: mpg.trim() || undefined,
        color: color.trim() || undefined, transmission: transmission.trim() || undefined,
        drivetrain: drivetrain.trim() || undefined, cylinders: cylinders.trim() || undefined,
        doors: doors.trim() || undefined, displacement: displacement.trim() || undefined,
        series: series.trim() || undefined, financingType,
        price: price ? parseInt(price) : undefined,
        monthlyPaymentFrom: monthlyPayment ? parseInt(monthlyPayment) : undefined,
        downPaymentFrom: downPayment ? parseInt(downPayment) : undefined,
        status, isPublished, isFeatured, images: uploadedImages,
      }

      const { collection, addDoc, doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      const clean = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== undefined))

      if (isNew) {
        const { generateSlug } = await import('@/services/vehicleService')
        const slug = generateSlug({ year: payload.year, make: payload.make, model: payload.model, vin: payload.vin })
        await addDoc(collection(db, 'inventory'), { ...clean, slug, views: 0, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
      } else {
        await updateDoc(doc(db, 'inventory', vehicle!.id), { ...clean, updatedAt: serverTimestamp() })
      }

      setSuccess(isNew ? 'Vehicle created successfully.' : 'Vehicle updated successfully.')
      if (isNew) setTimeout(() => (window.location.href = '/admin/inventory'), 1500)
    } catch (err) {
      console.error(err)
      setError('Failed to save vehicle. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'input-field text-sm py-2.5'
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide'

  const tones: { value: Tone; label: string }[] = [
    { value: 'friendly', label: 'Friendly' },
    { value: 'professional', label: 'Professional' },
    { value: 'enthusiastic', label: 'Enthusiastic' },
    { value: 'urgent', label: 'Urgent' },
  ]
  const focuses: { value: Focus; label: string }[] = [
    { value: 'features', label: 'Features' },
    { value: 'financing', label: 'Financing' },
    { value: 'family', label: 'Family' },
    { value: 'value', label: 'Value' },
  ]

  const AiPanel = ({ lang }: { lang: 'en' | 'es' }) => {
    const isEs = lang === 'es'
    const tone = isEs ? toneEs : toneEn
    const setTone = isEs ? setToneEs : setToneEn
    const focus = isEs ? focusEs : focusEn
    const setFocus = isEs ? setFocusEs : setFocusEn
    const generating = isEs ? generatingEs : generatingEn

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">AI Settings</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Tone</label>
            <div className="flex flex-wrap gap-1.5">
              {tones.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTone(t.value as Tone)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${tone === t.value ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Focus</label>
            <div className="flex flex-wrap gap-1.5">
              {focuses.map(f => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFocus(f.value as Focus)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${focus === f.value ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleGenerate(lang)}
          disabled={generating}
          className="btn-primary w-full justify-center text-sm disabled:opacity-50"
        >
          {generating
            ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</>
            : <><Sparkles className="w-4 h-4" />Generate {isEs ? 'Spanish' : 'English'} description</>
          }
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Bilingual titles */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-600" />
          Vehicle Title (Bilingual)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Title — English *</label>
            <input type="text" value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="2022 Toyota Camry SE" className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Title — Español</label>
            <input type="text" value={titleEs} onChange={e => setTitleEs(e.target.value)} placeholder="2022 Toyota Camry SE" className={inputClass} />
          </div>
        </div>
      </section>

      {/* VIN Decoder */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">VIN Decoder</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={labelClass}>VIN (17 characters)</label>
            <input type="text" value={vin} onChange={e => setVin(e.target.value.toUpperCase())} placeholder="1HGBH41JXMN109186" className={`${inputClass} font-mono`} maxLength={17} />
          </div>
          <div className="flex items-end">
            <button type="button" onClick={handleDecodeVin} disabled={decoding || vin.length !== 17} className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
              {decoding ? <><Loader2 className="w-4 h-4 animate-spin" />Decoding...</> : <><Search className="w-4 h-4" />Decode VIN</>}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400">Enter the full 17-character VIN and click Decode to auto-fill vehicle specs.</p>
      </section>

      {/* Vehicle specs */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Vehicle Specs</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Year *', value: year, set: setYear, placeholder: '2022', type: 'number' },
            { label: 'Make *', value: make, set: setMake, placeholder: 'Toyota' },
            { label: 'Model *', value: model, set: setModel, placeholder: 'Camry' },
            { label: 'Trim', value: trim, set: setTrim, placeholder: 'SE' },
            { label: 'Series', value: series, set: setSeries, placeholder: 'XLE' },
            { label: 'Mileage (mi)', value: mileage, set: setMileage, placeholder: '45000', type: 'number' },
            { label: 'Body Type', value: bodyClass, set: setBodyClass, placeholder: 'Sedan' },
            { label: 'Doors', value: doors, set: setDoors, placeholder: '4' },
            { label: 'Color', value: color, set: setColor, placeholder: 'Silver' },
          ].map(({ label, value, set, placeholder, type }) => (
            <div key={label}>
              <label className={labelClass}>{label}</label>
              <input type={type ?? 'text'} value={value} onChange={e => set(e.target.value)} placeholder={placeholder} className={inputClass} />
            </div>
          ))}
        </div>
      </section>

      {/* Engine & Drivetrain */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Engine & Drivetrain</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Engine', value: engine, set: setEngine, placeholder: '4-cyl 2.5L' },
            { label: 'Cylinders', value: cylinders, set: setCylinders, placeholder: '4' },
            { label: 'Displacement', value: displacement, set: setDisplacement, placeholder: '2.5L' },
            { label: 'Fuel Type', value: fuelType, set: setFuelType, placeholder: 'Gasoline' },
            { label: 'Transmission', value: transmission, set: setTransmission, placeholder: 'Automatic' },
            { label: 'Drivetrain', value: drivetrain, set: setDrivetrain, placeholder: 'FWD' },
            { label: 'MPG (e.g. 28/35)', value: mpg, set: setMpg, placeholder: '28/35' },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label}>
              <label className={labelClass}>{label}</label>
              <input type="text" value={value} onChange={e => set(e.target.value)} placeholder={placeholder} className={inputClass} />
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Pricing & Financing</h3>
        <div>
          <label className={labelClass}>Financing Type</label>
          <div className="flex gap-3">
            {(['in-house', 'cash-only'] as FinancingType[]).map(type => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="financingType" value={type} checked={financingType === type} onChange={() => setFinancingType(type)} className="text-blue-600" />
                <span className="text-sm capitalize">{type.replace('-', ' ')}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {financingType === 'in-house' ? (
            <>
              <div>
                <label className={labelClass}>Monthly Payment ($)</label>
                <input type="number" value={monthlyPayment} onChange={e => setMonthlyPayment(e.target.value)} placeholder="500" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Down Payment From ($)</label>
                <input type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} placeholder="2995" className={inputClass} />
              </div>
            </>
          ) : (
            <div>
              <label className={labelClass}>Cash Price ($)</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="8500" className={inputClass} />
            </div>
          )}
        </div>
      </section>

      {/* Descriptions with AI */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-600" />
          Description (Bilingual)
        </h3>

        {/* English */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={labelClass}>Description — English</label>
            <button
              type="button"
              onClick={() => setShowAiEn(v => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {showAiEn ? 'Hide AI' : 'Write with AI'}
            </button>
          </div>
          {showAiEn && <AiPanel lang="en" />}
          <textarea
            value={descEn}
            onChange={e => setDescEn(e.target.value)}
            placeholder="Well maintained vehicle, clean title..."
            rows={4}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Spanish */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={labelClass}>Descripción — Español</label>
            <button
              type="button"
              onClick={() => setShowAiEs(v => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {showAiEs ? 'Ocultar IA' : 'Escribir con IA'}
            </button>
          </div>
          {showAiEs && <AiPanel lang="es" />}
          <textarea
            value={descEs}
            onChange={e => setDescEs(e.target.value)}
            placeholder="Vehículo bien mantenido, título limpio..."
            rows={4}
            className={`${inputClass} resize-none`}
          />
        </div>
      </section>

      {/* Images */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Images</h3>
        <p className="text-xs text-gray-400">Max 5MB per image. JPG, PNG, WebP. Click ★ to set primary.</p>
        <div
          className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-300 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); if (e.dataTransfer.files) handleImageFiles(e.dataTransfer.files) }}
        >
          <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Click or drag images here</p>
          <p className="text-xs text-gray-300 mt-1">Up to 10 images</p>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={e => { if (e.target.files) handleImageFiles(e.target.files) }} className="hidden" />
        {images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {images.map((img, index) => (
              <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image src={img.url} alt={`Image ${index + 1}`} fill className="object-cover" sizes="120px" />
                {img.isPrimary && <span className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Primary</span>}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button type="button" onClick={() => setPrimary(index)} className="p-1 bg-white/90 rounded text-amber-500 hover:bg-white"><Star className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => removeImage(index)} className="p-1 bg-white/90 rounded text-red-500 hover:bg-white"><X className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Publishing */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Publishing</h3>
        <div>
          <label className={labelClass}>STATUS</label>
          <select value={status} onChange={e => setStatus(e.target.value as VehicleStatus)} className={inputClass}>
            {(['available', 'sold', 'reserved', 'maintenance'] as VehicleStatus[]).map(s => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm text-gray-700">🌐 Published on website</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm text-gray-700">⭐ Featured on homepage</span>
          </label>
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
          {success}
        </div>
      )}

      <button onClick={handleSubmit} disabled={saving} className="btn-primary w-full justify-center disabled:opacity-50">
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" />{isNew ? 'Creating...' : 'Saving...'}</> : isNew ? 'Create vehicle' : 'Save changes'}
      </button>
      <button type="button" onClick={() => window.location.href = '/admin/inventory'} className="btn-outline-blue w-full justify-center text-sm">
        Cancel
      </button>
    </div>
  )
}