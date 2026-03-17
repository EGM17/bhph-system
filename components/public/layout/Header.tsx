'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone, MapPin, Car } from 'lucide-react'

export default function Header() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const localePath = (path: string) =>
    locale === 'es'
      ? `/es${path === '/' ? '' : path.replace('/inventory', '/inventario').replace('/financing', '/financiamiento').replace('/contact', '/contacto')}`
      : path

  const navLinks = [
    { label: t('start'), href: localePath('/') },
    { label: t('inventory'), href: localePath('/inventory') },
    { label: t('financing'), href: localePath('/financing') },
    { label: t('contact'), href: localePath('/contact') },
  ]

  // Strip locale prefix from pathname to get the raw path
  const rawPath = pathname
    .replace(/^\/en/, '')   // remove /en prefix
    .replace(/^\/es/, '')   // remove /es prefix
    || '/'

  // Switch locale preserving current page
  const switchLocalePath = () => {
    if (locale === 'en') {
      // EN → ES: translate path segments
      const esPath = rawPath
        .replace('/inventory', '/inventario')
        .replace('/financing', '/financiamiento')
        .replace('/contact', '/contacto')
      return `/es${esPath === '/' ? '' : esPath}`
    } else {
      // ES → EN: translate back
      const enPath = rawPath
        .replace('/inventario', '/inventory')
        .replace('/financiamiento', '/financing')
        .replace('/contacto', '/contact')
      return enPath || '/'
    }
  }

  const langLabel = locale === 'en' ? 'Español' : 'English'

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      {/* Top bar */}
      <div className="bg-blue-600">
        <div className="container-section">
          <div className="flex items-center justify-between h-10 text-sm text-white">
            <div className="flex items-center gap-6">
              <a
                href="tel:+15038789550"
                className="flex items-center gap-1.5 hover:text-blue-200 transition-colors"
                aria-label="Call us at (503) 878-9550"
              >
                <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                <span>(503) 878-9550</span>
              </a>
              <div className="hidden sm:flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden md:inline">915 12th St SE, Salem, OR 97302</span>
                <span className="md:hidden">Salem, OR</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-blue-100 text-xs">{t('hours')}</span>
              <a
                href={switchLocalePath()}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-xs font-medium"
                aria-label={`Switch to ${langLabel}`}
              >
                <span aria-hidden="true">🌐</span>
                <span>{langLabel}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="container-section">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <a
            href={locale === 'es' ? '/es' : '/'}
            className="flex items-center gap-3 group"
            aria-label="El Compa Guero Auto Sales - Home"
          >
            <div className="bg-blue-600 p-2.5 rounded-xl shadow group-hover:bg-blue-700 transition-colors">
              <Car className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900 leading-tight tracking-tight">
                EL COMPA GUERO
              </p>
              <p className="text-xs font-semibold text-blue-600 tracking-widest">AUTO SALES</p>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium text-sm"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA button */}
          <div className="hidden md:flex">
            <a href={localePath('/inventory')} className="btn-primary text-sm">
              {t('viewInventory')}
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-gray-100 bg-white shadow-lg">
          <nav className="container-section py-4 space-y-1" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2">
              <a
                href={localePath('/inventory')}
                onClick={() => setMobileOpen(false)}
                className="btn-primary w-full justify-center"
              >
                {t('viewInventory')}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}