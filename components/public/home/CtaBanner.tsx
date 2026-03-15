import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export default function CtaBanner() {
  const t = useTranslations('cta')

  return (
    <section className="bg-blue-600 py-16 md:py-20" aria-labelledby="cta-heading">
      <div className="container-section text-center">
        <h2
          id="cta-heading"
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
        >
          {t('title')}
        </h2>
        <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
          {t('subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/inventory"
            className="btn-outline-white"
          >
            {t('viewInventory')}
          </Link>
          <a
            href="tel:+15038789550"
            className="btn-primary bg-white text-blue-600 hover:bg-blue-50"
          >
            {t('callNow')}
          </a>
        </div>
      </div>
    </section>
  )
}
