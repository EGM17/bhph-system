import { getTranslations } from 'next-intl/server'
import { getPublishedVehicles } from '@/services/vehicleService'
import PublicLayout from '@/components/public/layout/PublicLayout'
import InventoryClient from '@/components/public/inventory/InventoryClient'
import type { Metadata } from 'next'
import type { Vehicle } from '@/types'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const isEs = locale === 'es'
  const canonical = isEs
    ? 'https://elcompagueroautosales.com/es/inventario'
    : 'https://elcompagueroautosales.com/inventory'

  return {
    title: isEs ? 'Inventario de Autos Usados en Salem Oregon' : 'Used Car Inventory Salem Oregon',
    description: isEs
      ? 'Explora nuestro inventario de autos usados en Salem, Oregon. Financiamiento propio disponible. Sin verificación de crédito.'
      : 'Browse our used car inventory in Salem, Oregon. In-house financing available. No credit check required.',
    alternates: {
      canonical,
      languages: {
        en: 'https://elcompagueroautosales.com/inventory',
        es: 'https://elcompagueroautosales.com/es/inventario',
      },
    },
  }
}

export default async function InventoryPage({ params }: Props) {
  const { locale } = await params

  let vehicles: Vehicle[] = []
  try {
    vehicles = await getPublishedVehicles()
  } catch {
    vehicles = []
  }

  return (
    <PublicLayout>
      <InventoryClient vehicles={vehicles} locale={locale} />
    </PublicLayout>
  )
}

export const revalidate = 300