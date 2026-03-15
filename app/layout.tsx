import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://elcompagueroautosales.com'),
  title: {
    template: '%s | El Compa Guero Auto Sales',
    default: 'El Compa Guero Auto Sales - Used Cars Salem Oregon',
  },
  description:
    'Buy here pay here car dealership in Salem, Oregon. Easy in-house financing with no credit check, no ITIN, no SSN required. Drive the same day.',
  keywords: [
    'used cars Salem Oregon',
    'buy here pay here Salem',
    'no credit check car loans',
    'in-house financing Salem OR',
    'carros usados Salem Oregon',
    'financiamiento sin credito',
    'autos seminuevos Salem',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'es_MX',
    siteName: 'El Compa Guero Auto Sales',
    url: 'https://elcompagueroautosales.com',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'El Compa Guero Auto Sales - Salem Oregon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
}

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        {GTM_ID && (
          <Script id="gtm-init" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        )}

        <Script
          id="schema-dealer"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'AutoDealer',
              name: 'El Compa Guero Auto Sales LLC',
              description:
                'Buy here pay here car dealership in Salem, Oregon offering in-house financing with no credit check.',
              url: 'https://elcompagueroautosales.com',
              telephone: '+15038789550',
              email: 'info@elcompagueroautosales.com',
              address: {
                '@type': 'PostalAddress',
                streetAddress: '915 12th St SE',
                addressLocality: 'Salem',
                addressRegion: 'OR',
                postalCode: '97302',
                addressCountry: 'US',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 44.9237,
                longitude: -123.0197,
              },
              openingHoursSpecification: {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: [
                  'Monday','Tuesday','Wednesday','Thursday',
                  'Friday','Saturday','Sunday',
                ],
                opens: '10:00',
                closes: '19:00',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                reviewCount: '100',
              },
              priceRange: '$$',
              currenciesAccepted: 'USD',
              paymentAccepted: 'Cash, Check',
            }),
          }}
        />
      </head>
      <body className={`${dmSans.variable} font-sans antialiased`} suppressHydrationWarning>
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        {children}
      </body>
    </html>
  )
}
