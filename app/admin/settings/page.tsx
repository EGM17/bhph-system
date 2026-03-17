import SettingsClient from '@/components/admin/settings/SettingsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings' }

export default function AdminSettingsPage() {
  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your site settings</p>
      </div>
      <SettingsClient />
    </div>
  )
}
