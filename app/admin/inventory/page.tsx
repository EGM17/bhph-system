import { getAllVehiclesAdmin } from '@/services/vehicleService'
import AdminInventoryClient from '@/components/admin/inventory/AdminInventoryClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Inventory' }

export default async function AdminInventoryPage() {
  const vehicles = await getAllVehiclesAdmin().catch(() => [])

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Inventory</h2>
          <p className="text-sm text-gray-500 mt-0.5">{vehicles.length} total vehicles</p>
        </div>
        <a href="/admin/inventory/new" className="btn-primary text-sm">
          + Add vehicle
        </a>
      </div>
      <AdminInventoryClient vehicles={vehicles} />
    </div>
  )
}

export const revalidate = 0
