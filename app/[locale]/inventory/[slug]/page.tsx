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

  // Specs with icons — only show fields that have data
  const specs = [
    vehicle.year       && { icon: Calendar,   label: isEs ? 'Año'          : 'Year',         value: String(vehicle.year) },
    vehicle.mileage    && { icon: Gauge,       label: isEs ? 'Millaje'      : 'Mileage',      value: `${vehicle.mileage.toLocaleString('en-US')} mi` },
    vehicle.bodyClass  && { icon: Car,         label: isEs ? 'Carrocería'   : 'Body',          value: vehicle.bodyClass },
    vehicle.doors      && { icon: DoorOpen,    label: isEs ? 'Puertas'      : 'Doors',         value: vehicle.doors },
    vehicle.color      && { icon: Palette,     label: isEs ? 'Color'        : 'Color',         value: vehicle.color },
    vehicle.fuelType   && { icon: Fuel,        label: isEs ? 'Combustible'  : 'Fuel',          value: vehicle.fuelType },
    vehicle.engine     && { icon: Zap,         label: isEs ? 'Motor'        : 'Engine',        value: vehicle.engine },
    vehicle.cylinders  && { icon: Layers,      label: isEs ? 'Cilindros'    : 'Cylinders',     value: `${vehicle.cylinders} cyl` },
    vehicle.transmission && { icon: Settings2, label: isEs ? 'Transmisión'  : 'Transmission',  value: vehicle.transmission },
    vehicle.drivetrain && { icon: GitBranch,   label: isEs ? 'Tracción'     : 'Drivetrain',    value: vehicle.drivetrain },
    vehicle.mpg        && { icon: Gauge,       label: 'MPG',                                    value: vehicle.mpg },
    vehicle.displacement && { icon: Zap,       label: isEs ? 'Cilindrada'   : 'Displacement',  value: vehicle.displacement },
  ].filter(Boolean) as { icon: React.FC<{ className?: string; 'aria-hidden'?: string }>, label: string, value: string }[]

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

      {/* Hero banner */}
      <div className="bg-slate-900 text-white">
        <div className="container-section py-4">
          <a
            href={isEs ? '/es/inventario' : '/inventory'}
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backToInventory')}
          </a>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{title}</h1>
              {(vehicle.trim || vehicle.series) && (
                <p className="text-slate-400 text-sm mt-1">
                  {[vehicle.trim, vehicle.series].filter(Boolean).join(' · ')}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                {isInHouse && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    ✓ {t('interestFree')}
                  </span>
                )}
                {vehicle.vin && (
                  <span className="text-xs text-slate-500 font-mono">
                    VIN: {vehicle.vin}
                  </span>
                )}
              </div>
            </div>
            {/* Price in header */}
            <div className="text-right">
              {isInHouse && vehicle.monthlyPaymentFrom ? (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest">{t('monthlyPayment')}</p>
                  <p className="text-3xl font-bold text-white">
                    ${vehicle.monthlyPaymentFrom.toLocaleString('en-US')}
                    <span className="text-base font-normal text-slate-400 ml-1">{t('perMonth')}</span>
                  </p>
                  {vehicle.downPaymentFrom && (
                    <p className="text-sm text-slate-400">
                      {t('downPaymentFrom')} <strong className="text-slate-200">${vehicle.downPaymentFrom.toLocaleString('en-US')}</strong>
                    </p>
                  )}
                </div>
              ) : vehicle.price ? (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest">Price</p>
                  <p className="text-3xl font-bold text-white">${vehicle.price.toLocaleString('en-US')}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-gray-50 min-h-screen">
        <div className="container-section py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: gallery + specs + description */}
            <div className="lg:col-span-2 space-y-5">

              {/* Gallery */}
              <VehicleGallery images={vehicle.images ?? []} title={title} />

              {/* Specs grid */}
              {specs.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                    {isEs ? 'Especificaciones' : 'Vehicle Specs'}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {specs.map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-blue-600" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-400 leading-tight truncate">{label}</p>
                          <p className="text-sm font-semibold text-gray-900 leading-tight truncate">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {description && (
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
                    {t('description')}
                  </h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">{description}</p>
                </div>
              )}
            </div>

            {/* Right: CTA panel */}
            <div className="space-y-4">

              {/* Sticky wrapper on desktop */}
              <div className="lg:sticky lg:top-24 space-y-4">

                {/* Financing highlights */}
                {isInHouse && (
                  <div className="bg-blue-600 rounded-xl p-5 text-white">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-3">
                      {isEs ? 'Financiamiento propio' : 'In-house financing'}
                    </p>
                    <div className="space-y-2 text-sm">
                      {[
                        isEs ? '✓ Sin verificación de crédito' : '✓ No credit check',
                        isEs ? '✓ Sin ITIN ni SSN' : '✓ No ITIN or SSN needed',
                        isEs ? '✓ Sin intereses' : '✓ 0% interest',
                        isEs ? '✓ Maneja el mismo día' : '✓ Drive the same day',
                      ].map(item => (
                        <p key={item} className="text-blue-100">{item}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Call CTA */}
                <a
                  href="tel:+15038789550"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-colors"
                >
                  <Phone className="w-5 h-5" aria-hidden="true" />
                  {t('callForPricing')}
                </a>

                {/* Lead form */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <VehicleLeadForm
                    vehicleId={vehicle.id}
                    vehicleTitle={title}
                    vehicleSlug={slug}
                    locale={locale}
                  />
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

export const revalidate = 300