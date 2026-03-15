import { useTranslations } from 'next-intl'
import { CheckCircle, Clock, DollarSign } from 'lucide-react'

export default function WhyChooseUs() {
  const t = useTranslations('whyUs')

  const items = [
    {
      icon: CheckCircle,
      title: t('item1Title'),
      desc: t('item1Desc'),
      iconBg: 'bg-green-50',
      iconColor: 'text-green-500',
    },
    {
      icon: Clock,
      title: t('item2Title'),
      desc: t('item2Desc'),
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      icon: DollarSign,
      title: t('item3Title'),
      desc: t('item3Desc'),
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-white" aria-labelledby="why-us-heading">
      <div className="container-section">
        <div className="text-center mb-12">
          <h2
            id="why-us-heading"
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            {t('title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item) => (
            <div key={item.title} className="text-center">
              <div
                className={`w-16 h-16 ${item.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}
                aria-hidden="true"
              >
                <item.icon className={`w-8 h-8 ${item.iconColor}`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
