import { getVehicleById } from '@/services/vehicleService'
import VehicleFormClient from '@/components/admin/inventory/VehicleFormClient'
import type { Metadata } from 'next'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return { title: id === 'new' ? 'Add Vehicle' : 'Edit Vehicle' }
}

export default async function VehicleFormPage({ params }: Props) {
  const { id } = await params
  const isNew = id === 'new'

  const vehicle = isNew ? null : await getVehicleById(id).catch(() => null)

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <a
          href="/admin/inventory"
          className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          ← Back to inventory
        </a>
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          {isNew ? 'Add new vehicle' : 'Edit vehicle'}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {isNew
            ? 'Fill in the vehicle details. You can save as draft and publish later.'
            : 'Update vehicle details. Changes will reflect immediately on the site.'}
        </p>
      </div>
      <VehicleFormClient vehicle={vehicle} isNew={isNew} />
    </div>
  )
}
