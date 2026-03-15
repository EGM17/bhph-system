import { getTranslations } from 'next-intl/server'
import PublicLayout from '@/components/public/layout/PublicLayout'
import ContactPageForm from '@/components/public/ContactPageForm'
import { Phone, MapPin, Mail, Clock } from 'lucide-react'
import type { Metadata } from 'next'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const isEs = locale === 'es'
  return {
    title: isEs ? 'Contacto - El Compa Guero Auto Sales' : 'Contact Us - El Compa Guero Auto Sales',
    description: isEs
      ? 'Contáctanos en El Compa Guero Auto Sales. Ubicados en 915 12th St SE, Salem, OR. Lunes a domingo 10AM - 7PM.'
      : 'Contact El Compa Guero Auto Sales. Located at 915 12th St SE, Salem, OR. Monday to Sunday 10AM - 7PM.',
    alternates: {
      canonical: isEs
        ? 'https://elcompagueroautosales.com/es/contacto'
        : 'https://elcompagueroautosales.com/contact',
      languages: {
        en: 'https://elcompagueroautosales.com/contact',
        es: 'https://elcompagueroautosales.com/es/contacto',
      },
    },
  }
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact' })

  const contactInfo = [
    {
      icon: Phone,
      label: t('info.phone'),
      value: '(503) 878-9550',
      href: 'tel:+15038789550',
    },
    {
      icon: MapPin,
      label: t('info.address'),
      value: '915 12th St SE, Salem, OR 97302',
      href: 'https://maps.google.com/?q=915+12th+St+SE+Salem+OR+97302',
    },
    {
      icon: Mail,
      label: t('info.email'),
      value: 'info@elcompagueroautosales.com',
      href: 'mailto:info@elcompagueroautosales.com',
    },
    {
      icon: Clock,
      label: t('info.hours'),
      value: 'Mon - Sun: 10 AM - 7 PM',
      href: null,
    },
  ]

  return (
    <PublicLayout>
      {/* Page header */}
      <div className="bg-blue-600 text-white py-12">
        <div className="container-section text-center">
          <h1 className="text-4xl font-bold mb-3 text-white">{t('title')}</h1>
          <p className="text-white/90 text-lg max-w-xl mx-auto">{t('subtitle')}</p>
        </div>
      </div>

      <div className="container-section py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Contact info + map */}
          <div className="space-y-6">
            <div className="space-y-4">
              {contactInfo.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-gray-900 font-medium hover:text-blue-600 transition-colors"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-gray-900 font-medium">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Google Maps embed */}
            <div className="rounded-xl overflow-hidden border border-gray-200 aspect-[4/3]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2821.4!2d-123.0197!3d44.9237!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDTCsDU1JzI1LjMiTiAxMjPCsDAxJzEwLjkiVw!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="El Compa Guero Auto Sales location map"
              />
            </div>
          </div>

          {/* Contact form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('form.title')}</h2>
            <ContactPageForm locale={locale} source="contact_page" />
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

export const revalidate = 3600