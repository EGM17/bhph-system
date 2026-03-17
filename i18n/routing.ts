import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'es'],
  defaultLocale: 'en',
  localeDetection: false,
  pathnames: {
    '/': '/',
    '/inventory': {
      en: '/inventory',
      es: '/inventario',
    },
    '/inventory/[slug]': {
      en: '/inventory/[slug]',
      es: '/inventario/[slug]',
    },
    '/financing': {
      en: '/financing',
      es: '/financiamiento',
    },
    '/contact': {
      en: '/contact',
      es: '/contacto',
    },
    '/blog': {
      en: '/blog',
      es: '/blog',
    },
    '/blog/[slug]': {
      en: '/blog/[slug]',
      es: '/blog/[slug]',
    },
  },
})