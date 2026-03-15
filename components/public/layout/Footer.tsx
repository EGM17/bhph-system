import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Phone, MapPin, Mail, Clock, Facebook, Instagram } from 'lucide-react'

export default function Footer() {
  const t = useTranslations('footer')
  const currentYear = new Date().getFullYear()

  return (
    <footer>
      {/* Main footer - dark */}
      <div className="bg-slate-800 text-white">
        <div className="container-section py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Brand column */}
            <div className="lg:col-span-1">
              <p className="text-base font-bold tracking-tight mb-3">
                EL COMPA GUERO AUTO SALES
              </p>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {t('tagline')}
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center hover:bg-pink-600 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-300 mb-5">
                {t('quickLinks')}
              </h3>
              <ul className="space-y-3">
                {[
                  { label: 'Start', href: '/' },
                  { label: 'View inventory', href: '/inventory' },
                  { label: 'Financing', href: '/financing' },
                  { label: 'Contact', href: '/contact' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href as '/'}
                      className="text-slate-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact info */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-300 mb-5">
                {t('contact')}
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="tel:+15038789550"
                    className="flex items-center gap-2.5 text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    <Phone className="w-4 h-4 shrink-0 text-blue-400" />
                    <span>(503) 878-9550</span>
                  </a>
                </li>
                <li>
                  <div className="flex items-start gap-2.5 text-sm text-slate-400">
                    <MapPin className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
                    <span>
                      915 12th St SE<br />
                      Salem, OR 97302
                    </span>
                  </div>
                </li>
                <li>
                  <a
                    href="mailto:info@elcompagueroautosales.com"
                    className="flex items-center gap-2.5 text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    <Mail className="w-4 h-4 shrink-0 text-blue-400" />
                    <span>info@elcompagueroautosales.com</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Schedule */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-300 mb-5">
                {t('schedule')}
              </h3>
              <div className="flex items-start gap-2.5 text-sm text-slate-400 mb-4">
                <Clock className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
                <span>{t('hours')}</span>
              </div>
              <div className="bg-blue-600 rounded-lg px-4 py-3 text-sm text-white leading-snug">
                {t('languages')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-slate-900 border-t border-slate-700">
        <div className="container-section py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>
              &copy; {currentYear} El Compa Guero Auto Sales LLC. {t('rights')}
            </p>
            <div className="flex items-center gap-4">
              <Link href="/" className="hover:text-slate-300 transition-colors">
                {t('privacy')}
              </Link>
              <Link href="/" className="hover:text-slate-300 transition-colors">
                {t('terms')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
