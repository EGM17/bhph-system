import { getAllLeads } from '@/services/leadService'
import LeadsClient from '@/components/admin/leads/LeadsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Leads' }

export default async function AdminLeadsPage() {
  const leads = await getAllLeads().catch(() => [])

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Leads</h2>
          <p className="text-sm text-gray-500 mt-0.5">{leads.length} total leads received</p>
        </div>
      </div>
      <LeadsClient leads={leads} />
    </div>
  )
}

export const revalidate = 0
