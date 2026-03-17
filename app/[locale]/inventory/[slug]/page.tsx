import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getVehicleBySlug, incrementVehicleViews } from '@/services/vehicleService'
import PublicLayout from '@/components/public/layout/PublicLayout'
import VehicleGallery from '@/components/public/vehicle/VehicleGallery'
import VehicleLeadForm from '@/components/public/vehicle/VehicleLeadForm'
import Script from 'next/script'
import {
  ArrowLeft, Phone, Calendar, Gauge, Fuel, Settings2,
  GitBranch, Layers, DoorOpen, Palette, Zap, Car
} from 'lucide-react'
import type { Metadata } from 'next'
import type { Vehicle } from '@/types'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

function resolveField(field: unknown, locale: string, fallback = ''): string {
  if (!field) return fallback
  if (typeof field === 'string') return field
  if (typeof field === 'object' && field !== null) {
    const obj = field as Record<string, string>
    return locale === 'es' ? obj.es || obj.en || fallback : obj.en || obj.es || fallback
  }
  return fallback
}

function resolveTitle(vehicle: Vehicle, locale: string): string {
  if (vehicle.title && typeof vehicle.title === 'object') return resolveField(vehicle.title, locale)
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
  const primaryImage = vehicle.images?.find(i => i.isPrimary) ?? vehicle.images?.[0]

  return {
    title: `${title} - El Compa Guero Auto Sales`,
    description: description || (isEs
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

  incrementVehicleViews(vehicle.id).catch(() => {})

  const isEs = locale === 'es'
  const title = resolveTitle(vehicle, locale)
  const description = resolveField(vehicle.description, locale)
  const isInHouse = vehicle.financingType === 'in-house'

  // Build specs array — only show fields that have data
  const specs = [
    vehicle.year && { icon: Calendar, label: isEs ? 'Año' : 'Year', value: String(vehicle.year) },
    vehicle.mileage && { icon: Gauge, label: isEs ? 'Millaje' : 'Mileage', value: `${vehicle.mileage.toLocaleString('en-US')} mi` },
    vehicle.bodyClass && { icon: Car, label: isEs ? 'Carrocería' : 'Body', value: vehicle.bodyClass },
    vehicle.doors && { icon: DoorOpen, label: isEs ? 'Puertas' : 'Doors', value: vehicle.doors },
    vehicle.color && { icon: Palette, label: isEs ? 'Color' : 'Color', value: vehicle.color },
    vehicle.fuelType && { icon: Fuel, label: isEs ? 'Combustible' : 'Fuel', value: vehicle.fuelType },
    vehicle.engine && { icon: Zap, label: isEs ? 'Motor' : 'Engine', value: vehicle.engine },
    vehicle.cylinders && { icon: Layers, label: isEs ? 'Cilindros' : 'Cylinders', value: `${vehicle.cylinders} cyl` },
    vehicle.transmission && { icon: Settings2, label: isEs ? 'Transmisión' : 'Transmission', value: vehicle.transmission },
    vehicle.drivetrain && { icon: GitBranch, label: isEs ? 'Tracción' : 'Drivetrain', value: vehicle.drivetrain },
    vehicle.mpg && { icon: Gauge, label: 'MPG', value: vehicle.mpg },
    vehicle.displacement && { icon: Zap, label: isEs ? 'Cilindrada' : 'Displacement', value: vehicle.displacement },
  ].filter(Boolean) as { icon: React.FC<{ className?: string }>, label: string, value: string }[]

  const carSchema = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: title,
    description: description || '',
    brand: { '@type': 'Brand', name: vehicle.make },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    mileageFromOdometer: { '@type': 'QuantitativeValue', value: vehicle.mileage, unitCode: 'SMI' },
    vehicleTransmission: vehicle.transmission,
    driveWheelConfiguration: vehicle.drivetrain,
    fuelType: vehicle.fuelType,
    bodyType: vehicle.bodyClass,
    color: vehicle.color,
    numberOfDoors: vehicle.doors,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: vehicle.price ?? vehicle.monthlyPaymentFrom ?? 0,
      availability: vehicle.status === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      seller: { '@type': 'AutoDealer', name: 'El Compa Guero Auto Sales LLC' },
    },
    image: vehicle.images?.map(i => i.url) ?? [],
    url: `https://elcompagueroautosales.com/inventory/${slug}`,
    vin: vehicle.vin,
  }

  return (
    <PublicLayout>
      <Script id={`schema-car-${vehicle.id}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(carSchema) }} />

      <div className="container-section py-6">
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
            {description && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('description')}</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{description}</p>
              </div>
            )}

            {/* Full specs grid */}
            {specs.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {isEs ? 'Especificaciones' : 'Vehicle Specs'}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {specs.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-blue-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 leading-tight">{label}</p>
                        <p className="text-sm font-semibold text-gray-900 leading-tight mt-0.5">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: pricing + lead form */}
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
              {vehicle.trim && <p className="text-sm text-gray-500 mb-2">{vehicle.trim}{vehicle.series ? ` · ${vehicle.series}` : ''}</p>}
              {isInHouse && <span className="badge-blue text-xs">{t('interestFree')}</span>}
            </div>

            {/* Pricing card */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
              {isInHouse && vehicle.monthlyPaymentFrom ? (
                <>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{t('monthlyPayment')}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">$ {vehicle.monthlyPaymentFrom.toLocaleString('en-US')}</span>
                    <span className="text-gray-500 text-sm">{t('perMonth')}</span>
                  </div>
                  {vehicle.downPaymentFrom && (
                    <p className="text-sm text-gray-500">
                      {t('downPaymentFrom')}{' '}
                      <strong className="text-gray-800">$ {vehicle.downPaymentFrom.toLocaleString('en-US')}</strong>
                    </p>
                  )}
                </>
              ) : vehicle.price ? (
                <>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Price</p>
                  <span className="text-4xl font-bold text-gray-900">$ {vehicle.price.toLocaleString('en-US')}</span>
                </>
              ) : null}
            </div>

            {/* VIN */}
            {vehicle.vin && (
              <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-500">
                <span className="font-semibold">VIN:</span>{' '}
                <span className="font-mono">{vehicle.vin}</span>
              </div>
            )}

            <a href="tel:+15038789550" className="btn-primary w-full justify-center">
              <Phone className="w-4 h-4" aria-hidden="true" />
              {t('callForPricing')}
            </a>

            <VehicleLeadForm vehicleId={vehicle.id} vehicleTitle={title} vehicleSlug={slug} locale={locale} />
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

export const revalidate = 300