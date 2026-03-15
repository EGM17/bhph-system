'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Star, Globe, AlertCircle, Loader2 } from 'lucide-react'
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

export default function VehicleFormClient({ vehicle, isNew }: VehicleFormClientProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  const [mpg, setMpg] = useState(vehicle?.mpg ?? '')
  const [color, setColor] = useState(vehicle?.color ?? '')
  const [financingType, setFinancingType] = useState<FinancingType>(
    vehicle?.financingType ?? 'in-house'
  )
  const [price, setPrice] = useState(vehicle?.price?.toString() ?? '')
  const [monthlyPayment, setMonthlyPayment] = useState(
    vehicle?.monthlyPaymentFrom?.toString() ?? ''
  )
  const [downPayment, setDownPayment] = useState(
    vehicle?.downPaymentFrom?.toString() ?? ''
  )
  const [status, setStatus] = useState<VehicleStatus>(vehicle?.status ?? 'available')
  const [isPublished, setIsPublished] = useState(vehicle?.isPublished ?? false)
  const [isFeatured, setIsFeatured] = useState(vehicle?.isFeatured ?? false)

  // Images
  const [images, setImages] = useState<ImagePreview[]>(
    vehicle?.images?.map((img, i) => ({ url: img.url, isPrimary: img.isPrimary, order: i })) ?? []
  )

  const handleImageFiles = (files: FileList) => {
    const newPreviews: ImagePreview[] = []
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return
      if (file.size > 5 * 1024 * 1024) {
        setError('Each image must be under 5MB.')
        return
      }
      const url = URL.createObjectURL(file)
      newPreviews.push({
        file,
        url,
        isPrimary: images.length === 0 && newPreviews.length === 0,
        order: images.length + newPreviews.length,
      })
    })
    setImages((prev) => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index).map((img, i) => ({
        ...img,
        order: i,
        isPrimary: i === 0 ? true : img.isPrimary,
      }))
      return updated
    })
  }

  const setPrimary = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === index }))
    )
  }

  const handleSubmit = async () => {
    setError('')
    setSuccess('')

    if (!titleEn.trim() || !make.trim() || !model.trim() || !year) {
      setError('Title (EN), make, model and year are required.')
      return
    }

    setSaving(true)
    try {
      // Upload new images first
      const uploadedImages: VehicleImage[] = []
      for (const img of images) {
        if (img.file) {
          const formData = new FormData()
          formData.append('file', img.file)
          formData.append('vehicleId', vehicle?.id ?? 'temp')
          const res = await fetch('/api/admin/vehicles/upload-image', {
            method: 'POST',
            body: formData,
          })
          if (!res.ok) throw new Error('Image upload failed')
          const data = await res.json()
          uploadedImages.push({ url: data.url, isPrimary: img.isPrimary, order: img.order })
        } else {
          uploadedImages.push({ url: img.url, isPrimary: img.isPrimary, order: img.order })
        }
      }

      const payload = {
        title: { en: titleEn.trim(), es: titleEs.trim() || titleEn.trim() },
        description: { en: descEn.trim(), es: descEs.trim() },
        year: parseInt(year),
        make: make.trim(),
        model: model.trim(),
        trim: trim.trim() || undefined,
        vin: vin.trim() || undefined,
        mileage: parseInt(mileage) || 0,
        bodyClass: bodyClass.trim() || undefined,
        fuelType: fuelType.trim() || undefined,
        mpg: mpg.trim() || undefined,
        color: color.trim() || undefined,
        financingType,
        price: price ? parseInt(price) : undefined,
        monthlyPaymentFrom: monthlyPayment ? parseInt(monthlyPayment) : undefined,
        downPaymentFrom: downPayment ? parseInt(downPayment) : undefined,
        status,
        isPublished,
        isFeatured,
        images: uploadedImages,
      }

      const url = isNew ? '/api/admin/vehicles' : `/api/admin/vehicles/${vehicle!.id}`
      const method = isNew ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Save failed')

      setSuccess(isNew ? 'Vehicle created successfully.' : 'Vehicle updated successfully.')
      if (isNew) {
        setTimeout(() => (window.location.href = '/admin/inventory'), 1500)
      }
    } catch (err) {
      console.error(err)
      setError('Failed to save vehicle. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'input-field text-sm py-2.5'
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide'

  return (
    <div className="space-y-6">
      {/* Bilingual titles */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-600" aria-hidden="true" />
          Vehicle Title (Bilingual)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Title — English *</label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="2022 Toyota Camry SE"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Title — Español</label>
            <input
              type="text"
              value={titleEs}
              onChange={(e) => setTitleEs(e.target.value)}
              placeholder="2022 Toyota Camry SE"
              className={inputClass}
            />
          </div>
        </div>
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
            { label: 'VIN', value: vin, set: setVin, placeholder: '1HGBH41JXMN109186' },
            { label: 'Mileage (mi)', value: mileage, set: setMileage, placeholder: '45000', type: 'number' },
            { label: 'Body Type', value: bodyClass, set: setBodyClass, placeholder: 'Sedan' },
            { label: 'Fuel Type', value: fuelType, set: setFuelType, placeholder: 'Gasoline' },
            { label: 'MPG', value: mpg, set: setMpg, placeholder: '32' },
            { label: 'Color', value: color, set: setColor, placeholder: 'Silver' },
          ].map(({ label, value, set, placeholder, type }) => (
            <div key={label}>
              <label className={labelClass}>{label}</label>
              <input
                type={type ?? 'text'}
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                className={inputClass}
              />
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
            {(['in-house', 'cash-only'] as FinancingType[]).map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="financingType"
                  value={type}
                  checked={financingType === type}
                  onChange={() => setFinancingType(type)}
                  className="text-blue-600"
                />
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
                <input
                  type="number"
                  value={monthlyPayment}
                  onChange={(e) => setMonthlyPayment(e.target.value)}
                  placeholder="500"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Down Payment From ($)</label>
                <input
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                  placeholder="2995"
                  className={inputClass}
                />
              </div>
            </>
          ) : (
            <div>
              <label className={labelClass}>Cash Price ($)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="8500"
                className={inputClass}
              />
            </div>
          )}
        </div>
      </section>

      {/* Descriptions */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-600" aria-hidden="true" />
          Description (Bilingual)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Description — English</label>
            <textarea
              value={descEn}
              onChange={(e) => setDescEn(e.target.value)}
              placeholder="Well maintained vehicle, clean title..."
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div>
            <label className={labelClass}>Descripción — Español</label>
            <textarea
              value={descEs}
              onChange={(e) => setDescEs(e.target.value)}
              placeholder="Vehículo bien mantenido, título limpio..."
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Images</h3>
        <p className="text-xs text-gray-400">
          Max 5MB per image. JPG, PNG, WebP accepted. First image is the primary. Click ★ to set primary.
        </p>

        {/* Upload area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            if (e.dataTransfer.files) handleImageFiles(e.dataTransfer.files)
          }}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          aria-label="Upload images"
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm text-gray-600 font-medium">Click or drag images here</p>
          <p className="text-xs text-gray-400 mt-1">Up to 10 images</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleImageFiles(e.target.files)}
            className="sr-only"
            aria-label="File upload input"
          />
        </div>

        {/* Image grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={img.url}
                  alt={`Image ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
                {img.isPrimary && (
                  <div className="absolute top-1 left-1 bg-amber-400 rounded px-1 py-0.5 text-xs font-bold text-white">
                    Primary
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPrimary(idx)}
                    className="p-1 bg-white/90 rounded-full hover:bg-white"
                    title="Set as primary"
                    aria-label="Set as primary image"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                  </button>
                  <button
                    onClick={() => removeImage(idx)}
                    className="p-1 bg-white/90 rounded-full hover:bg-white"
                    title="Remove"
                    aria-label="Remove image"
                  >
                    <X className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Publishing */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Publishing</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as VehicleStatus)}
              className={inputClass}
            >
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="reserved">Reserved</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div className="flex flex-col justify-end gap-3">
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
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500" aria-hidden="true" />
                <span className="text-sm font-medium">Featured on homepage</span>
              </div>
            </label>
          </div>
        </div>
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
          {saving ? 'Saving...' : isNew ? 'Create vehicle' : 'Save changes'}
        </button>
        <a href="/admin/inventory" className="btn-outline-blue">
          Cancel
        </a>
      </div>
    </div>
  )
}
