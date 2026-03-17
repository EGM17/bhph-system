import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

interface HeroProps {
  heroImage?: string
}

export default function Hero({ heroImage }: HeroProps) {
  const t = useTranslations('hero')

  return (
    <section
      className="bg-blue-600 text-white overflow-hidden"
      aria-label="Hero section"
    >
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      <div className="relative container-section py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          <div className="order-2 lg:order-1 space-y-6 text-center lg:text-left">
            <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
              {t('badge')}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              {t('title')}{' '}
              <span className="text-amber-400">{t('titleAccent')}</span>
            </h1>
            <p className="text-lg text-blue-100 leading-relaxed max-w-lg mx-auto lg:mx-0">
              {t('subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/inventory" className="btn-primary bg-white text-blue-600 hover:bg-blue-50 shadow-lg">
                {t('ctaPrimary')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/financing" className="btn-outline-white">
                {t('ctaSecondary')}
              </Link>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-8 pt-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{t('stat1Value')}</p>
                <p className="text-sm text-blue-200">{t('stat1Label')}</p>
              </div>
              <div className="w-px h-12 bg-white/30" aria-hidden="true" />
              <div className="text-center">
                <p className="text-3xl font-bold">{t('stat2Value')}</p>
                <p className="text-sm text-blue-200">{t('stat2Label')}</p>
              </div>
              <div className="w-px h-12 bg-white/30" aria-hidden="true" />
              <div className="text-center">
                <p className="text-3xl font-bold">
                  {t('stat3Value')} <span className="text-amber-400">★</span>
                </p>
                <p className="text-sm text-blue-200">{t('stat3Label')}</p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-2xl overflow-hidden">
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt="El Compa Guero Auto Sales"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 288px, 384px"
                />
              ) : (
                <div className="w-full h-full bg-blue-500/40 flex items-center justify-center">
                  <span className="text-white/50 text-sm">No image set</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
