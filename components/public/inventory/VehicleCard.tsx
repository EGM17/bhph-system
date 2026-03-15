import { useTranslations, useLocale } from 'next-intl'
import { Gauge, MapPin, Calendar, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import type { Vehicle } from '@/types'

interface VehicleCardProps {
  vehicle: Vehicle
  locale?: string
}

export default function VehicleCard({ vehicle, locale: localeProp }: VehicleCardProps) {
  const t = useTranslations('inventory')
  const localeCtx = useLocale()
  const locale = localeProp ?? localeCtx

  const primaryImage =
    vehicle.images?.find((img) => img.isPrimary) ?? vehicle.images?.[0]

  // Handle both legacy string titles and new bilingual {en,es} objects
  const resolveTitle = () => {
    const t = vehicle.title as unknown
    if (!t) return `${vehicle.year} ${vehicle.make} ${vehicle.model}`
    if (typeof t === 'string') return t
    if (typeof t === 'object' && t !== null) {
      const obj = t as Record<string, string>
      if (locale === 'es') return obj.es || obj.en || `${vehicle.year} ${vehicle.make} ${vehicle.model}`
      return obj.en || obj.es || `${vehicle.year} ${vehicle.make} ${vehicle.model}`
    }
    return `${vehicle.year} ${vehicle.make} ${vehicle.model}`
  }
  const title = resolveTitle()

  const isInHouse = vehicle.financingType === 'in-house'
  const isSold = vehicle.status === 'sold'

  return (
    <a
      href={`/${locale === 'es' ? 'es/inventario' : 'inventory'}/${vehicle.slug ?? vehicle.id}`}
      className="card-vehicle block group"
      aria-label={`View details for ${title}`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg
              className="w-16 h-16 text-gray-300"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {vehicle.isFeatured && (
            <span className="badge-dark">{t('outstanding')}</span>
          )}
          {isInHouse && (
            <span className="badge-blue">{t('interest')}</span>
          )}
        </div>

        {/* Sold overlay */}
        {isSold && (
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold text-lg">
              {t('sold')}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-1">
          {title}
        </h3>

        {/* Specs */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
            <span>{vehicle.year}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
            <span>{vehicle.mileage?.toLocaleString('en-US')} mi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            <span className="truncate">{vehicle.bodyClass ?? 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
            <span>Salem, OR</span>
          </div>
        </div>

        <div className="border-t border-gray-100 my-3" aria-hidden="true" />

        {/* Pricing */}
        {isInHouse && vehicle.monthlyPaymentFrom ? (
          <div className="mb-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">
                $ {vehicle.monthlyPaymentFrom.toLocaleString('en-US')}
              </span>
              <span className="text-sm text-gray-500">{t('perMonth')}</span>
            </div>
            {vehicle.downPaymentFrom && (
              <p className="text-xs text-gray-500 mt-0.5">
                {t('downFrom')}{' '}
                <strong className="text-gray-700">
                  $ {vehicle.downPaymentFrom.toLocaleString('en-US')}
                </strong>
              </p>
            )}
          </div>
        ) : vehicle.price ? (
          <div className="mb-3">
            <span className="text-2xl font-bold text-gray-900">
              $ {vehicle.price.toLocaleString('en-US')}
            </span>
          </div>
        ) : null}

        {/* View details */}
        <div className="flex items-center gap-1 text-sm font-semibold text-blue-600">
          {t('viewDetails')}
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </a>
  )
}