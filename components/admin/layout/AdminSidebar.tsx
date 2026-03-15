'use client'

import { usePathname } from 'next/navigation'
import { Car, Users, FileText, Settings, LayoutDashboard, ChevronRight } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Inventory', href: '/admin/inventory', icon: Car },
  { label: 'Leads', href: '/admin/leads', icon: Users },
  { label: 'Blog', href: '/admin/blog', icon: FileText },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="w-60 bg-slate-800 text-white flex flex-col shrink-0 hidden md:flex">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Car className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">EL COMPA GUERO</p>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Admin navigation">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact)
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" aria-hidden="true" />}
            </a>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-700">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          View public site →
        </a>
      </div>
    </aside>
  )
}
