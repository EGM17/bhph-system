import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ArrowRight } from 'lucide-react'
import VehicleCard from '../inventory/VehicleCard'
import type { Vehicle } from '@/types'

interface FeaturedVehiclesProps {
  vehicles: Vehicle[]
}

export default function FeaturedVehicles({ vehicles }: FeaturedVehiclesProps) {
  const t = useTranslations('featured')
  const locale = useLocale()

  if (vehicles.length === 0) return null

  return (
    <section className="py-16 md:py-24 bg-gray-50" aria-labelledby="featured-heading">
      <div className="container-section">

        {/* Section header */}
        <div className="text-center mb-12">
          <span className="section-label mb-4 inline-flex">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" aria-hidden="true" />
            {t('label')}
          </span>
          <h2
            id="featured-heading"
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
          >
            {t('title')}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            {t('subtitle')}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} locale={locale} />
          ))}
        </div>

        {/* View all CTA */}
        <div className="text-center">
          <Link href="/inventory" className="btn-primary">
            {t('viewAll')}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

      </div>
    </section>
  )
}
