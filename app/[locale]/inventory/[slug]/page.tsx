import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getVehicleBySlug, incrementVehicleViews } from '@/services/vehicleService'
import PublicLayout from '@/components/public/layout/PublicLayout'
import VehicleGallery from '@/components/public/vehicle/VehicleGallery'
import VehicleLeadForm from '@/components/public/vehicle/VehicleLeadForm'
import Script from 'next/script'
import { ArrowLeft, Phone } from 'lucide-react'
import type { Metadata } from 'next'
import type { Vehicle } from '@/types'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

// ── Helper: resolves both legacy string fields and new bilingual {en,es} objects
function resolveField(
  field: unknown,
  locale: string,
  fallback = ''
): string {
  if (!field) return fallback
  if (typeof field === 'string') return field
  if (typeof field === 'object' && field !== null) {
    const obj = field as Record<string, string>
    if (locale === 'es') return obj.es || obj.en || fallback
    return obj.en || obj.es || fallback
  }
  return fallback
}

// ── Helper: resolve vehicle display title from any format
function resolveTitle(vehicle: Vehicle, locale: string): string {
  // If title is a bilingual object
  if (vehicle.title && typeof vehicle.title === 'object') {
    return resolveField(vehicle.title, locale)
  }
  // Fallback: build from make/model/year
  return `${vehicle.year} ${vehicle.make} ${vehicle.model}`.trim()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const vehicle = await getVehicleBySlug(slug)

  if (!vehicle) return { title: 'Vehicle not found' }

  const title = resolveTitle(vehicle, locale)
  const description = resolveField(vehicle.description, locale)
  const isEs = locale === 'es'
  const canonical = isEs
    ? `https://elcompagueroautosales.com/es/inventario/${slug}`
    : `https://elcompagueroautosales.com/inventory/${slug}`
  const primaryImage = vehicle.images?.find((i) => i.isPrimary) ?? vehicle.images?.[0]

  return {
    title: `${title} - El Compa Guero Auto Sales`,
    description:
      description ||
      (isEs
        ? `${title} disponible en Salem, Oregon. Financiamiento propio sin intereses.`
        : `${title} available in Salem, Oregon. In-house financing with 0% interest.`),
    alternates: {
      canonical,
      languages: {
        en: `https://elcompagueroautosales.com/inventory/${slug}`,
        es: `https://elcompagueroautosales.com/es/inventario/${slug}`,
      },
    },
    openGraph: {
      title: `${title} - El Compa Guero Auto Sales`,
      description: description ?? '',
      url: canonical,
      images: primaryImage ? [{ url: primaryImage.url, alt: title }] : [],
    },
  }
}

export default async function VehicleDetailPage({ params }: Props) {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: 'vehicleDetail' })

  const vehicle = await getVehicleBySlug(slug)
  if (!vehicle) notFound()

  // Increment view count in background (non-blocking)
  incrementVehicleViews(vehicle.id).catch(() => {})

  const isEs = locale === 'es'
  const title = resolveTitle(vehicle, locale)
  const description = resolveField(vehicle.description, locale)
  const isInHouse = vehicle.financingType === 'in-house'

  // Schema.org Car structured data
  const carSchema = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: title,
    description: description || '',
    brand: { '@type': 'Brand', name: vehicle.make },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: vehicle.mileage,
      unitCode: 'SMI',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: vehicle.price ?? vehicle.monthlyPaymentFrom ?? 0,
      availability:
        vehicle.status === 'available'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/SoldOut',
      seller: {
        '@type': 'AutoDealer',
        name: 'El Compa Guero Auto Sales LLC',
      },
    },
    image: vehicle.images?.map((i) => i.url) ?? [],
    url: `https://elcompagueroautosales.com/inventory/${slug}`,
    vin: vehicle.vin,
    bodyType: vehicle.bodyClass,
    fuelType: vehicle.fuelType,
  }

  return (
    <PublicLayout>
      <Script
        id={`schema-car-${vehicle.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(carSchema) }}
      />

      <div className="container-section py-6">
        {/* Back link */}
        <a
          href={isEs ? '/es/inventario' : '/inventory'}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          {t('backToInventory')}
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: gallery + description */}
          <div className="lg:col-span-2 space-y-6">
            <VehicleGallery images={vehicle.images ?? []} title={title} />

            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('description')}</h2>
              {description ? (
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{description}</p>
              ) : (
                <p className="text-gray-400 italic">{t('noDescription')}</p>
              )}
            </div>
          </div>

          {/* Right: pricing + specs + lead form */}
          <div className="space-y-5">
            {/* Title + badge */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
              {isInHouse && (
                <span className="badge-blue text-xs">{t('interestFree')}</span>
              )}
            </div>

            {/* Pricing card */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
              {isInHouse && vehicle.monthlyPaymentFrom ? (
                <>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    {t('monthlyPayment')}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      $ {vehicle.monthlyPaymentFrom.toLocaleString('en-US')}
                    </span>
                    <span className="text-gray-500 text-sm">{t('perMonth')}</span>
                  </div>
                  {vehicle.downPaymentFrom && (
                    <p className="text-sm text-gray-500">
                      {t('downPaymentFrom')}{' '}
                      <strong className="text-gray-800">
                        $ {vehicle.downPaymentFrom.toLocaleString('en-US')}
                      </strong>
                    </p>
                  )}
                </>
              ) : vehicle.price ? (
                <>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    Price
                  </p>
                  <span className="text-4xl font-bold text-gray-900">
                    $ {vehicle.price.toLocaleString('en-US')}
                  </span>
                </>
              ) : null}
            </div>

            {/* Specs card */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                {t('specs')}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: t('year'), value: vehicle.year },
                  { label: t('mileage'), value: `${vehicle.mileage?.toLocaleString('en-US')} mi` },
                  { label: t('bodywork'), value: vehicle.bodyClass },
                  { label: t('mpg'), value: vehicle.mpg ?? 'N/A' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-gray-900">{value ?? 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Call CTA */}
            <a
              href="tel:+15038789550"
              className="btn-primary w-full justify-center"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              {t('callForPricing')}
            </a>

            {/* Lead form */}
            <VehicleLeadForm
              vehicleId={vehicle.id}
              vehicleTitle={title}
              vehicleSlug={slug}
              locale={locale}
            />
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

export const revalidate = 300