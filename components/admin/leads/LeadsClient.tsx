'use client'

import { useState } from 'react'
import { Phone, Mail, Car, Calendar, ChevronDown } from 'lucide-react'
import type { Lead } from '@/types'

interface LeadsClientProps {
  leads: Lead[]
}

const STATUS_OPTIONS: Lead['status'][] = ['new', 'contacted', 'closed']

const statusStyle: Record<Lead['status'], string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  closed: 'bg-gray-100 text-gray-600',
}

export default function LeadsClient({ leads: initialLeads }: LeadsClientProps) {
  const [leads, setLeads] = useState(initialLeads)
  const [filterStatus, setFilterStatus] = useState<Lead['status'] | 'all'>('all')
  const [updating, setUpdating] = useState<string | null>(null)

  const filtered = filterStatus === 'all'
    ? leads
    : leads.filter((l) => l.status === filterStatus)

  const handleStatusChange = async (id: string, status: Lead['status']) => {
    setUpdating(id)
    try {
      const { doc, updateDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      await updateDoc(doc(db, 'leads', id), { status })
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
    } catch (err) {
      console.error('Failed to update lead status:', err)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-2 flex-wrap">
        {(['all', ...STATUS_OPTIONS] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              filterStatus === s
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {s === 'all' ? 'All' : s}
            <span className="ml-1.5 text-xs opacity-70">
              ({s === 'all' ? leads.length : leads.filter((l) => l.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {/* Leads list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-gray-400">No leads found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => (
            <div
              key={lead.id}
              className="bg-white rounded-xl border border-gray-200 p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{lead.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    <Calendar className="w-3 h-3 inline mr-1" aria-hidden="true" />
                    {new Date(lead.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {/* Status selector */}
                <div className="relative">
                  <select
                    value={lead.status}
                    onChange={(e) =>
                      handleStatusChange(lead.id, e.target.value as Lead['status'])
                    }
                    disabled={updating === lead.id}
                    className={`appearance-none pl-3 pr-7 py-1.5 rounded-lg text-xs font-semibold capitalize cursor-pointer border-0 focus:ring-2 focus:ring-blue-500 ${statusStyle[lead.status]} disabled:opacity-50`}
                    aria-label={`Change status for lead from ${lead.name}`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s} className="bg-white text-gray-900">
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60"
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* Contact info */}
              <div className="flex flex-wrap gap-4 text-sm">
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-1.5 text-blue-600 hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                  {lead.phone}
                </a>
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-1.5 text-blue-600 hover:underline"
                >
                  <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                  {lead.email}
                </a>
              </div>

              {/* Vehicle context */}
              {lead.vehicleTitle && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                  <Car className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                  <span>
                    Interested in:{' '}
                    <a
                      href={`/inventory/${lead.vehicleSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {lead.vehicleTitle}
                    </a>
                  </span>
                </div>
              )}

              {/* Message */}
              {lead.message && (
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed">
                  {lead.message}
                </p>
              )}

              {/* Source + language badges */}
              <div className="flex gap-2">
                <span className="badge bg-gray-100 text-gray-500 text-xs">{lead.source}</span>
                <span className="badge bg-gray-100 text-gray-500 text-xs uppercase">
                  {lead.language}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}