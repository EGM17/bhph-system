import { getAllVehiclesAdmin } from '@/services/vehicleService'
import { getAllLeads } from '@/services/leadService'
import { Car, Users, Eye, TrendingUp } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function AdminDashboardPage() {
  const [vehicles, leads] = await Promise.all([
    getAllVehiclesAdmin().catch(() => []),
    getAllLeads().catch(() => []),
  ])

  const available = vehicles.filter((v) => v.status === 'available' && v.isPublished).length
  const sold = vehicles.filter((v) => v.status === 'sold').length
  const totalViews = vehicles.reduce((sum, v) => sum + (v.views ?? 0), 0)
  const newLeads = leads.filter((l) => l.status === 'new').length
  const recentLeads = leads.slice(0, 5)

  const stats = [
    {
      label: 'Published Vehicles',
      value: available,
      icon: Car,
      color: 'bg-blue-50 text-blue-600',
      href: '/admin/inventory',
    },
    {
      label: 'New Leads',
      value: newLeads,
      icon: Users,
      color: 'bg-amber-50 text-amber-600',
      href: '/admin/leads',
    },
    {
      label: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: 'bg-green-50 text-green-600',
      href: '/admin/inventory',
    },
    {
      label: 'Sold Vehicles',
      value: sold,
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-600',
      href: '/admin/inventory',
    },
  ]

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-0.5">Overview of your dealership activity</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className={`inline-flex p-2.5 rounded-lg ${stat.color} mb-3`}>
              <stat.icon className="w-5 h-5" aria-hidden="true" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </a>
        ))}
      </div>

      {/* Recent leads */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Leads</h3>
          <a href="/admin/leads" className="text-sm text-blue-600 hover:underline">
            View all
          </a>
        </div>

        {recentLeads.length === 0 ? (
          <p className="text-sm text-gray-400 p-5">No leads yet.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{lead.name}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {lead.vehicleTitle ? `Re: ${lead.vehicleTitle}` : lead.source}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`badge text-xs ${
                      lead.status === 'new'
                        ? 'bg-blue-100 text-blue-700'
                        : lead.status === 'contacted'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {lead.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inventory quick links */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Inventory Summary</h3>
          <a href="/admin/inventory" className="text-sm text-blue-600 hover:underline">
            Manage inventory
          </a>
        </div>
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          {[
            { label: 'Available', value: available, color: 'text-green-600' },
            { label: 'Sold', value: sold, color: 'text-gray-600' },
            { label: 'Total', value: vehicles.length, color: 'text-blue-600' },
          ].map((item) => (
            <div key={item.label} className="px-5 py-4 text-center">
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const revalidate = 0
