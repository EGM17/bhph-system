import { getTranslations } from 'next-intl/server'
import { getFeaturedVehicles } from '@/services/vehicleService'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import PublicLayout from '@/components/public/layout/PublicLayout'
import Hero from '@/components/public/home/Hero'
import FeaturedVehicles from '@/components/public/home/FeaturedVehicles'
import WhyChooseUs from '@/components/public/home/WhyChooseUs'
import CtaBanner from '@/components/public/home/CtaBanner'
import type { Metadata } from 'next'
import type { Vehicle } from '@/types'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const isEs = locale === 'es'
  const canonical = isEs
    ? 'https://elcompagueroautosales.com/es'
    : 'https://elcompagueroautosales.com'

  return {
    title: isEs
      ? 'El Compa Guero Auto Sales - Autos Usados Salem Oregon'
      : 'El Compa Guero Auto Sales - Used Cars Salem Oregon',
    description: isEs
      ? 'Concesionario en Salem, Oregon. Financiamiento propio sin verificación de crédito, sin ITIN, sin SSN. Maneja el mismo día.'
      : 'Buy here pay here car dealership in Salem, Oregon. In-house financing with no credit check, no ITIN, no SSN required. Drive the same day.',
    alternates: {
      canonical,
      languages: {
        en: 'https://elcompagueroautosales.com',
        es: 'https://elcompagueroautosales.com/es',
        'x-default': 'https://elcompagueroautosales.com',
      },
    },
    openGraph: {
      title: isEs
        ? 'El Compa Guero Auto Sales - Autos Usados Salem Oregon'
        : 'El Compa Guero Auto Sales - Used Cars Salem Oregon',
      description: isEs
        ? 'Financiamiento propio sin verificación de crédito.'
        : 'In-house financing with no credit check.',
      url: canonical,
      locale: isEs ? 'es_MX' : 'en_US',
    },
  }
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params

  let featuredVehicles: Vehicle[] = []
  try {
    featuredVehicles = await getFeaturedVehicles(6)
  } catch {
    featuredVehicles = []
  }

  let heroImage: string | undefined
  try {
    const snap = await getDoc(doc(db, 'settings', 'site'))
    if (snap.exists()) heroImage = snap.data().heroImage
  } catch {}

  return (
    <PublicLayout>
      <Hero heroImage={heroImage} />
      <FeaturedVehicles vehicles={featuredVehicles} />
      <WhyChooseUs />
      <CtaBanner />
    </PublicLayout>
  )
}

export const revalidate = 300
