'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Share2, Check } from 'lucide-react'
import type { VehicleImage } from '@/types'

interface VehicleGalleryProps {
  images: VehicleImage[]
  title: string
}

export default function VehicleGallery({ images, title }: VehicleGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [copied, setCopied] = useState(false)

  const sorted = [...images].sort((a, b) => (a.isPrimary ? -1 : 0) - (b.isPrimary ? -1 : 0))

  const prev = () => setActiveIndex((i) => (i - 1 + sorted.length) % sorted.length)
  const next = () => setActiveIndex((i) => (i + 1) % sorted.length)

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available
    }
  }

  if (sorted.length === 0) {
    return (
      <div className="aspect-[16/10] bg-gray-100 rounded-xl flex items-center justify-center">
        <svg className="w-20 h-20 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-100 group">
        <Image
          src={sorted[activeIndex].url}
          alt={`${title} - image ${activeIndex + 1}`}
          fill
          className="object-cover"
          priority={activeIndex === 0}
          sizes="(max-width: 1024px) 100vw, 66vw"
        />

        {/* Nav arrows */}
        {sorted.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Image counter */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/50 rounded-full text-white text-xs font-medium">
          {activeIndex + 1} / {sorted.length}
        </div>

        {/* Share button */}
        <button
          onClick={handleShare}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full shadow flex items-center justify-center hover:bg-white transition-colors"
          aria-label="Share vehicle"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Share2 className="w-4 h-4 text-gray-700" />
          )}
        </button>
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="list" aria-label="Image thumbnails">
          {sorted.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              role="listitem"
              aria-label={`View image ${idx + 1}`}
              aria-current={idx === activeIndex}
              className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                idx === activeIndex ? 'border-blue-600' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Image
                src={img.url}
                alt={`${title} thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="64px"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
