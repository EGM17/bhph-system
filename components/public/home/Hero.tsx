import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

interface HeroSettings {
  locale?: string
  heroImage?: string
  span1Text?: string
  span1TextEs?: string
  span1Color?: string
  span1SizeMobile?: string
  span1SizeDesktop?: string
  span2Text?: string
  span2TextEs?: string
  span2Color?: string
  span2SizeMobile?: string
  span2SizeDesktop?: string
  subtitle?: string
  subtitleEs?: string
}

export default function Hero({
  locale = 'en',
  heroImage,
  span1Text,
  span1TextEs,
  span1Color,
  span1SizeMobile,
  span1SizeDesktop,
  span2Text,
  span2TextEs,
  span2Color,
  span2SizeMobile,
  span2SizeDesktop,
  subtitle,
  subtitleEs,
}: HeroSettings) {
  const t = useTranslations('hero')
  const isEs = locale === 'es'

  const displaySpan1 = isEs ? (span1TextEs || span1Text) : span1Text
  const displaySpan2 = isEs ? (span2TextEs || span2Text) : span2Text
  const displaySubtitle = isEs ? (subtitleEs || subtitle) : subtitle

  const hasCustomSize = span1SizeMobile || span1SizeDesktop || span2SizeMobile || span2SizeDesktop

  return (
    <section className="bg-blue-600 text-white overflow-hidden" aria-label="Hero section">
      {hasCustomSize && (
        <style>{`
          .hero-span1 { font-size: ${span1SizeMobile || '2.25rem'}; }
          .hero-span2 { font-size: ${span2SizeMobile || '2.25rem'}; }
          @media (min-width: 768px) {
            .hero-span1 { font-size: ${span1SizeDesktop || span1SizeMobile || '3.75rem'}; }
            .hero-span2 { font-size: ${span2SizeDesktop || span2SizeMobile || '3.75rem'}; }
          }
        `}</style>
      )}

      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`, backgroundSize: '24px 24px' }}
        aria-hidden="true"
      />

      <div className="relative container-section py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          <div className="order-2 lg:order-1 space-y-6 text-center lg:text-left">
            <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
              {t('badge')}
            </span>

            <h1 className="font-bold leading-tight">
              <span
                className={hasCustomSize ? 'hero-span1' : 'text-4xl md:text-5xl lg:text-6xl'}
                style={{ color: span1Color || '#ffffff' }}
              >
                {displaySpan1 || t('title')}
              </span>{' '}
              <span
                className={hasCustomSize ? 'hero-span2' : 'text-4xl md:text-5xl lg:text-6xl'}
                style={{ color: span2Color || '#F59E0B' }}
              >
                {displaySpan2 || t('titleAccent')}
              </span>
            </h1>

            <p className="text-lg text-blue-100 leading-relaxed max-w-lg mx-auto lg:mx-0">
              {displaySubtitle || t('subtitle')}
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
                <p className="text-3xl font-bold">{t('stat3Value')}</p>
                <p className="text-sm text-blue-200">{t('stat3Label')}</p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-80 h-80 md:w-[480px] md:h-[480px] rounded-2xl overflow-hidden">
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt={`${displaySpan1 || 'Financing'} ${displaySpan2 || 'interest-free'} - El Compa Guero Auto Sales Salem Oregon`}
                  fill
                  className="object-cover"
                  priority
                  quality={100}
                  sizes="(max-width: 768px) 320px, 480px"
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