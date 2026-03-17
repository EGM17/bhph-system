import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getVehicleBySlug, incrementVehicleViews } from '@/services/vehicleService'
import PublicLayout from '@/components/public/layout/PublicLayout'
import VehicleGallery from '@/components/public/vehicle/VehicleGallery'
import VehicleLeadForm from '@/components/public/vehicle/VehicleLeadForm'
import Script from 'next/script'
import {
  ArrowLeft, Phone, MapPin, Calendar, Gauge, Fuel,
  Settings2, GitBranch, Layers, DoorOpen, Palette, Zap, Car
} from 'lucide-react'
import type { Metadata } from 'next'
import type { Vehicle } from '@/types'

type Props = { params: Promise<{ locale: string; slug: string }> }

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
    alternates: { canonical, languages: { en: `https://elcompagueroautosales.com/inventory/${slug}`, es: `https://elcompagueroautosales.com/es/inventario/${slug}` } },
    openGraph: { title: `${title} - El Compa Guero Auto Sales`, description: description ?? '', url: canonical, images: primaryImage ? [{ url: primaryImage.url, alt: title }] : [] },
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

  // Feature pills — compact specs shown as pills
  const featurePills = [
    vehicle.drivetrain,
    vehicle.transmission,
    vehicle.engine,
    vehicle.fuelType,
    vehicle.bodyClass,
  ].filter(Boolean) as string[]

  // Specs grid
  const specs = [
    vehicle.year        && { icon: Calendar,   label: isEs ? 'Año'         : 'Year',         value: String(vehicle.year) },
    vehicle.mileage     && { icon: Gauge,       label: isEs ? 'Millaje'     : 'Mileage',      value: `${vehicle.mileage.toLocaleString('en-US')} mi` },
    vehicle.color       && { icon: Palette,     label: isEs ? 'Color'       : 'Ext. Color',   value: vehicle.color },
    vehicle.bodyClass   && { icon: Car,         label: isEs ? 'Carrocería'  : 'Body Style',   value: vehicle.bodyClass },
    vehicle.engine      && { icon: Zap,         label: isEs ? 'Motor'       : 'Engine',       value: vehicle.engine },
    vehicle.cylinders   && { icon: Layers,      label: isEs ? 'Cilindros'   : 'Cylinders',    value: `${vehicle.cylinders} cyl` },
    vehicle.transmission && { icon: Settings2,  label: isEs ? 'Transmisión' : 'Transmission', value: vehicle.transmission },
    vehicle.drivetrain  && { icon: GitBranch,   label: isEs ? 'Tracción'    : 'Drivetrain',   value: vehicle.drivetrain },
    vehicle.fuelType    && { icon: Fuel,        label: isEs ? 'Combustible' : 'Fuel Type',    value: vehicle.fuelType },
    vehicle.doors       && { icon: DoorOpen,    label: isEs ? 'Puertas'     : 'Doors',        value: vehicle.doors },
    vehicle.mpg         && { icon: Gauge,       label: 'MPG',                                  value: vehicle.mpg },
    vehicle.displacement && { icon: Zap,        label: isEs ? 'Cilindrada'  : 'Displacement', value: vehicle.displacement },
  ].filter(Boolean) as { icon: React.FC<{ className?: string }>, label: string, value: string }[]

  const carSchema = {
    '@context': 'https://schema.org', '@type': 'Car',
    name: title, description: description || '',
    brand: { '@type': 'Brand', name: vehicle.make },
    model: vehicle.model, vehicleModelDate: String(vehicle.year),
    mileageFromOdometer: { '@type': 'QuantitativeValue', value: vehicle.mileage, unitCode: 'SMI' },
    vehicleTransmission: vehicle.transmission, driveWheelConfiguration: vehicle.drivetrain,
    fuelType: vehicle.fuelType, bodyType: vehicle.bodyClass, color: vehicle.color, numberOfDoors: vehicle.doors,
    offers: { '@type': 'Offer', priceCurrency: 'USD', price: vehicle.price ?? vehicle.monthlyPaymentFrom ?? 0,
      availability: vehicle.status === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      seller: { '@type': 'AutoDealer', name: 'El Compa Guero Auto Sales LLC' } },
    image: vehicle.images?.map(i => i.url) ?? [],
    url: `https://elcompagueroautosales.com/inventory/${slug}`, vin: vehicle.vin,
  }

  return (
    <PublicLayout>
      <Script id={`schema-car-${vehicle.id}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(carSchema) }} />

      <div className="bg-gray-50 min-h-screen">
        <div className="container-section py-6">

          {/* Back link */}
          <a href={isEs ? '/es/inventario' : '/inventory'} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-5">
            <ArrowLeft className="w-4 h-4" />
            {t('backToInventory')}
          </a>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── LEFT: gallery + info ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Gallery */}
              <VehicleGallery images={vehicle.images ?? []} title={title} />

              {/* Title block — below gallery like reference */}
              <div className="bg-white rounded-xl p-5 space-y-3">
                {/* Status pills — Featured + Financing only */}
                <div className="flex items-center gap-2">
                  {vehicle.isFeatured && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-600 text-white">
                      {isEs ? 'Destacado' : 'Featured'}
                    </span>
                  )}
                  {isInHouse && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {isEs ? 'Financiamiento propio' : 'In-house financing'}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{title}</h1>

                {/* Key highlights row — mileage, color, trim, year + VIN */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  {vehicle.mileage && (
                    <span className="flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-gray-400" />
                      {vehicle.mileage.toLocaleString('en-US')} mi
                    </span>
                  )}
                  {vehicle.color && (
                    <span className="flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-gray-400" />
                      {vehicle.color}
                    </span>
                  )}
                  {vehicle.trim && (
                    <span className="flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-gray-400" />
                      {vehicle.trim}
                    </span>
                  )}
                  {vehicle.year && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {vehicle.year}
                    </span>
                  )}
                  {vehicle.vin && (
                    <span className="text-xs text-gray-400 font-mono">
                      VIN: {vehicle.vin}
                    </span>
                  )}
                </div>
              </div>

              {/* Vehicle Specs grid */}
              {specs.length > 0 && (
                <div className="bg-white rounded-xl p-5">
                  <h2 className="text-base font-bold text-gray-900 mb-4">
                    {isEs ? 'Especificaciones del vehículo' : 'Vehicle Specifications'}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                    {specs.map(({ icon: Icon, label, value }) => (
                      <div key={label} className="space-y-0.5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5" />
                          {label}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {description && (
                <div className="bg-white rounded-xl p-5">
                  <h2 className="text-base font-bold text-gray-900 mb-3">
                    {isEs ? 'Descripción del vendedor' : "Seller's Description"}
                  </h2>
                  <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{description}</p>
                </div>
              )}

              {/* Dealership info — map section like reference */}
              <div className="bg-white rounded-xl p-5">
                <h2 className="text-base font-bold text-gray-900 mb-4">
                  {isEs ? 'Visita nuestro lote' : 'Visit Our Lot'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      {isEs
                        ? 'Estamos listos para atenderte. Visítanos en Salem, Oregon.'
                        : 'We are ready to serve you. Visit us in Salem, Oregon.'}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2 text-gray-700">
                        <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>915 12th St SE, Salem, OR 97302</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                        <a href="tel:+15038789550" className="hover:text-blue-600 transition-colors">(503) 878-9550</a>
                      </div>
                      <div className="text-gray-500 text-xs pl-6">
                        Mon - Sun: 10 AM – 7 PM
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl overflow-hidden h-36 bg-gray-100">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2826.123!2d-123.0351!3d44.9217!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54bfff4b6f9b9b9b%3A0x1234567890abcdef!2s915%2012th%20St%20SE%2C%20Salem%2C%20OR%2097302!5e0!3m2!1sen!2sus!4v1234567890"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="El Compa Guero Auto Sales location"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* ── RIGHT: sticky panel ── */}
            <div>
              <div className="lg:sticky lg:top-24 space-y-4">

                {/* Price card */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {isInHouse && vehicle.monthlyPaymentFrom ? t('monthlyPayment') : isEs ? 'Precio' : 'Our Price'}
                  </p>
                  {isInHouse && vehicle.monthlyPaymentFrom ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-blue-600 tracking-tight">
                          ${vehicle.monthlyPaymentFrom.toLocaleString('en-US')}
                        </span>
                        <span className="text-gray-400 text-base font-medium">{t('perMonth')}</span>
                      </div>
                      {vehicle.downPaymentFrom && (
                        <p className="text-sm text-gray-500">
                          {t('downPaymentFrom')}{' '}
                          <span className="text-gray-900 font-semibold">${vehicle.downPaymentFrom.toLocaleString('en-US')}</span>
                        </p>
                      )}
                    </>
                  ) : vehicle.price ? (
                    <p className="text-4xl font-extrabold text-blue-600 tracking-tight">
                      ${vehicle.price.toLocaleString('en-US')}
                    </p>
                  ) : null}

                  {/* Financing highlights */}
                  {isInHouse && (
                    <div className="pt-2 border-t border-gray-100 space-y-1.5">
                      {[
                        isEs ? '✓ Sin verificación de crédito' : '✓ No credit check',
                        isEs ? '✓ Sin ITIN ni SSN' : '✓ No ITIN or SSN needed',
                        isEs ? '✓ Sin intereses' : '✓ 0% interest',
                        isEs ? '✓ Maneja el mismo día' : '✓ Drive the same day',
                      ].map(item => (
                        <p key={item} className="text-xs text-gray-500">{item}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* CTAs */}
                <a href="tel:+15038789550" className="flex items-center justify-center gap-2 w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
                  <Phone className="w-4 h-4" />
                  {t('callForPricing')}
                </a>

                {/* Contact info */}
                <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {isEs ? 'Ubicación' : 'Location'}
                      </p>
                      <p className="text-sm text-gray-700">915 12th St SE, Salem, OR 97302</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {isEs ? 'Teléfono' : 'Phone'}
                      </p>
                      <a href="tel:+15038789550" className="text-sm text-gray-700 hover:text-blue-600 transition-colors">
                        (503) 878-9550
                      </a>
                    </div>
                  </div>
                </div>

                {/* Lead form */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <VehicleLeadForm vehicleId={vehicle.id} vehicleTitle={title} vehicleSlug={slug} locale={locale} />
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