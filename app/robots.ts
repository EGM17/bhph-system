import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: 'https://elcompagueroautosales.com/sitemap.xml',
    host: 'https://elcompagueroautosales.com',
  }
}
