import { MetadataRoute } from 'next'
import { getPublishedVehicles } from '@/services/vehicleService'

const BASE_URL = 'https://elcompagueroautosales.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          en: BASE_URL,
          es: `${BASE_URL}/es`,
        },
      },
    },
    {
      url: `${BASE_URL}/inventory`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: {
        languages: {
          en: `${BASE_URL}/inventory`,
          es: `${BASE_URL}/es/inventario`,
        },
      },
    },
    {
      url: `${BASE_URL}/financing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: {
        languages: {
          en: `${BASE_URL}/financing`,
          es: `${BASE_URL}/es/financiamiento`,
        },
      },
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          en: `${BASE_URL}/contact`,
          es: `${BASE_URL}/es/contacto`,
        },
      },
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
      alternates: {
        languages: {
          en: `${BASE_URL}/blog`,
          es: `${BASE_URL}/es/blog`,
        },
      },
    },
  ]

  // Vehicle pages
  let vehiclePages: MetadataRoute.Sitemap = []
  try {
    const vehicles = await getPublishedVehicles()
    vehiclePages = vehicles.map((vehicle) => ({
      url: `${BASE_URL}/inventory/${vehicle.slug}`,
      lastModified: new Date(vehicle.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: vehicle.isFeatured ? 0.8 : 0.7,
      alternates: {
        languages: {
          en: `${BASE_URL}/inventory/${vehicle.slug}`,
          es: `${BASE_URL}/es/inventario/${vehicle.slug}`,
        },
      },
    }))
  } catch {
    vehiclePages = []
  }

  return [...staticPages, ...vehiclePages]
}
