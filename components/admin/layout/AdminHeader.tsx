'use client'

import { useState } from 'react'
import { LogOut, Menu } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function AdminHeader() {
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await signOut(auth)
      await fetch('/api/admin/session', { method: 'DELETE' })
      window.location.href = '/admin/login'
    } catch (err) {
      console.error('Logout error:', err)
      setLoading(false)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile menu placeholder */}
        <button
          className="md:hidden p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>
        <h1 className="text-sm font-semibold text-gray-700">El Compa Guero — Admin</h1>
      </div>

      <button
        onClick={handleLogout}
        disabled={loading}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
        aria-label="Sign out"
      >
        <LogOut className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline">{loading ? 'Signing out...' : 'Sign out'}</span>
      </button>
    </header>
  )
}
