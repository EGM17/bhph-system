'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, Images } from 'lucide-react'
import type { VehicleImage } from '@/types'

interface VehicleGalleryProps {
  images: VehicleImage[]
  title: string
}

export default function VehicleGallery({ images, title }: VehicleGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const sorted = [...images].sort((a, b) => (a.isPrimary ? -1 : 0) - (b.isPrimary ? -1 : 0))

  const lightboxPrev = useCallback(() => setLightboxIndex(i => (i - 1 + sorted.length) % sorted.length), [sorted.length])
  const lightboxNext = useCallback(() => setLightboxIndex(i => (i + 1) % sorted.length), [sorted.length])

  const openLightbox = (index: number) => { setLightboxIndex(index); setLightboxOpen(true) }

  useEffect(() => {
    if (!lightboxOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') lightboxPrev()
      if (e.key === 'ArrowRight') lightboxNext()
      if (e.key === 'Escape') setLightboxOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxOpen, lightboxPrev, lightboxNext])

  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxOpen])

  if (sorted.length === 0) {
    return (
      <div className="aspect-[16/9] bg-gray-100 rounded-xl flex items-center justify-center">
        <span className="text-gray-300 text-sm">No images available</span>
      </div>
    )
  }

  const side1 = sorted[1]
  const side2 = sorted[2]
  const remaining = sorted.length - 3

  return (
    <>
      {/* Gallery grid — like the reference */}
      <div className="grid grid-cols-3 gap-2 rounded-xl overflow-hidden h-[420px]">
        {/* Main image — takes 2/3 */}
        <div
          className="col-span-2 relative cursor-zoom-in group"
          onClick={() => openLightbox(activeIndex)}
        >
          <Image
            src={sorted[activeIndex].url}
            alt={`${title} - main image`}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            priority
            sizes="66vw"
          />
          {/* Prev/next on main */}
          {sorted.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setActiveIndex(i => (i - 1 + sorted.length) % sorted.length) }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); setActiveIndex(i => (i + 1) % sorted.length) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </>
          )}
          <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/50 rounded-full text-white text-xs font-medium">
            {activeIndex + 1} / {sorted.length}
          </div>
        </div>

        {/* Side images — stacked */}
        <div className="col-span-1 flex flex-col gap-2">
          {/* Side image 1 */}
          <div
            className="relative flex-1 cursor-pointer group overflow-hidden"
            onClick={() => { setActiveIndex(1); openLightbox(1) }}
          >
            {side1 ? (
              <Image
                src={side1.url}
                alt={`${title} - image 2`}
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                sizes="33vw"
              />
            ) : (
              <div className="w-full h-full bg-gray-100" />
            )}
          </div>

          {/* Side image 2 — with "more photos" overlay */}
          <div
            className="relative flex-1 cursor-pointer group overflow-hidden"
            onClick={() => openLightbox(2)}
          >
            {side2 ? (
              <>
                <Image
                  src={side2.url}
                  alt={`${title} - image 3`}
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  sizes="33vw"
                />
                {remaining > 0 && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                    <Images className="w-6 h-6 mb-1" />
                    <p className="text-sm font-bold">+{remaining} Photos</p>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gray-100" />
            )}
          </div>
        </div>
      </div>

      {/* Thumbnail strip */}
      {sorted.length > 3 && (
        <div className="flex gap-2 overflow-x-auto py-1">
          {sorted.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-16 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                idx === activeIndex ? 'border-blue-600 scale-105' : 'border-gray-200 hover:border-gray-400 opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={img.url} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white z-10">
            <X className="w-5 h-5" />
          </button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/10 rounded-full text-white text-sm font-medium">
            {lightboxIndex + 1} / {sorted.length}
          </div>
          {sorted.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); lightboxPrev() }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={e => { e.stopPropagation(); lightboxNext() }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <div className="relative w-full h-full max-w-5xl max-h-[85vh] mx-16" onClick={e => e.stopPropagation()}>
            <Image src={sorted[lightboxIndex].url} alt={`${title} - image ${lightboxIndex + 1}`} fill className="object-contain" sizes="100vw" priority />
          </div>
          {sorted.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-lg px-4">
              {sorted.map((img, idx) => (
                <button key={idx} onClick={e => { e.stopPropagation(); setLightboxIndex(idx) }} className={`relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${idx === lightboxIndex ? 'border-white scale-110' : 'border-white/30 opacity-60 hover:opacity-100'}`}>
                  <Image src={img.url} alt="" fill className="object-cover" sizes="48px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}