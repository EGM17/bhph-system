'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Eye, Pencil, Trash2, Globe, Star } from 'lucide-react'
import type { Vehicle } from '@/types'

interface AdminInventoryClientProps {
  vehicles: Vehicle[]
}

export default function AdminInventoryClient({ vehicles: initial }: AdminInventoryClientProps) {
  const [vehicles, setVehicles] = useState(initial)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? vehicles.filter(
        (v) =>
          `${v.year} ${v.make} ${v.model}`.toLowerCase().includes(search.toLowerCase()) ||
          v.vin?.toLowerCase().includes(search.toLowerCase())
      )
    : vehicles

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return

    setDeletingId(id)
    try {
      const { doc, deleteDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      await deleteDoc(doc(db, 'inventory', id))
      setVehicles((prev) => prev.filter((v) => v.id !== id))
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete vehicle.')
    } finally {
      setDeletingId(null)
    }
  }

  const statusStyle: Record<Vehicle['status'], string> = {
    available: 'bg-green-100 text-green-700',
    sold: 'bg-red-100 text-red-700',
    reserved: 'bg-yellow-100 text-yellow-700',
    maintenance: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by year, make, model or VIN..."
          className="input-field text-sm py-2.5 max-w-sm"
          aria-label="Search inventory"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 p-8 text-center">
            {search ? 'No vehicles match your search.' : 'No vehicles yet. Add your first one.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                    Vehicle
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden md:table-cell">
                    Price
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden lg:table-cell">
                    Views
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((vehicle) => {
                  const primaryImage =
                    vehicle.images?.find((i) => i.isPrimary) ?? vehicle.images?.[0]
                  const title =
                    vehicle.title?.en ??
                    `${vehicle.year} ${vehicle.make} ${vehicle.model}`

                  return (
                    <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                      {/* Vehicle info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            {primaryImage ? (
                              <Image
                                src={primaryImage.url}
                                alt={title}
                                width={56}
                                height={40}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No img</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{title}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {vehicle.isPublished && (
                                <Globe
                                  className="w-3 h-3 text-blue-500"
                                  aria-label="Published"
                                />
                              )}
                              {vehicle.isFeatured && (
                                <Star
                                  className="w-3 h-3 text-amber-500"
                                  aria-label="Featured"
                                />
                              )}
                              {vehicle.vin && (
                                <span className="text-xs text-gray-400 font-mono">
                                  {vehicle.vin.slice(-6)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        {vehicle.monthlyPaymentFrom ? (
                          <div>
                            <p className="font-semibold text-gray-900">
                              ${vehicle.monthlyPaymentFrom.toLocaleString()}
                              <span className="text-xs text-gray-400 font-normal">/mo</span>
                            </p>
                            {vehicle.downPaymentFrom && (
                              <p className="text-xs text-gray-400">
                                Down ${vehicle.downPaymentFrom.toLocaleString()}
                              </p>
                            )}
                          </div>
                        ) : vehicle.price ? (
                          <p className="font-semibold text-gray-900">
                            ${vehicle.price.toLocaleString()}
                          </p>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`badge capitalize ${statusStyle[vehicle.status]}`}>
                          {vehicle.status}
                        </span>
                      </td>

                      {/* Views */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{vehicle.views ?? 0}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <a
                            href={`/inventory/${vehicle.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View on site"
                            aria-label={`View ${title} on site`}
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <a
                            href={`/admin/inventory/${vehicle.id}`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                            aria-label={`Edit ${title}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(vehicle.id, title)}
                            disabled={deletingId === vehicle.id}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                            aria-label={`Delete ${title}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}