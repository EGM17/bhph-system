import { getTranslations } from 'next-intl/server'
import PublicLayout from '@/components/public/layout/PublicLayout'
import ContactPageForm from '@/components/public/ContactPageForm'
import { CheckCircle } from 'lucide-react'
import type { Metadata } from 'next'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const isEs = locale === 'es'
  return {
    title: isEs ? 'Financiamiento Sin Intereses - Salem Oregon' : 'Interest-Free Financing - Salem Oregon',
    description: isEs
      ? 'Obtén financiamiento propio sin verificación de crédito en Salem, Oregon. Sin ITIN, sin SSN, sin licencia.'
      : 'Get in-house financing with no credit check in Salem, Oregon. No ITIN, no SSN, no license required.',
    alternates: {
      canonical: isEs
        ? 'https://elcompagueroautosales.com/es/financiamiento'
        : 'https://elcompagueroautosales.com/financing',
      languages: {
        en: 'https://elcompagueroautosales.com/financing',
        es: 'https://elcompagueroautosales.com/es/financiamiento',
      },
    },
  }
}

export default async function FinancingPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'financing' })

  const requirements = [
    t('requirements.item1'),
    t('requirements.item2'),
    t('requirements.item3'),
    t('requirements.item4'),
  ]

  return (
    <PublicLayout>
      {/* Hero */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container-section text-center">
          <span className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium mb-6">
            {t('hero.badge')}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            {t('hero.title')}{' '}
            <span className="text-amber-400">{t('hero.titleAccent')}</span>
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
        </div>
      </div>

      {/* Requirements */}
      <section className="py-16 bg-white" aria-labelledby="requirements-heading">
        <div className="container-section">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 id="requirements-heading" className="text-3xl font-bold text-gray-900 mb-3">
              {t('requirements.title')}
            </h2>
            <p className="text-gray-600">{t('requirements.subtitle')}</p>
          </div>

          <div className="max-w-lg mx-auto space-y-3 mb-6">
            {requirements.map((req) => (
              <div key={req} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" aria-hidden="true" />
                <span className="text-gray-700 font-medium">{req}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-sm font-semibold text-blue-600">
            {t('requirements.note')}
          </p>
        </div>
      </section>

      {/* Apply form */}
      <section className="py-16 bg-gray-50" aria-labelledby="apply-heading">
        <div className="container-section">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <h2 id="apply-heading" className="text-3xl font-bold text-gray-900 mb-3">
                {t('cta.title')}
              </h2>
              <p className="text-gray-600">{t('cta.subtitle')}</p>
            </div>
            <ContactPageForm locale={locale} source="financing_page" submitLabel={t('cta.submit')} />
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}

export const revalidate = 3600