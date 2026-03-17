import LeadsClient from '@/components/admin/leads/LeadsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Leads' }

export default function AdminLeadsPage() {
  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Leads</h2>
          <p className="text-sm text-gray-500 mt-0.5">Customer inquiries</p>
        </div>
      </div>
      <LeadsClient leads={[]} />
    </div>
  )
}