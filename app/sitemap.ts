import { MetadataRoute } from 'next'

const BASE_URL = 'https://elcompagueroautosales.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: { languages: { en: BASE_URL, es: `${BASE_URL}/es` } },
    },
    {
      url: `${BASE_URL}/inventory`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: { languages: { en: `${BASE_URL}/inventory`, es: `${BASE_URL}/es/inventario` } },
    },
    {
      url: `${BASE_URL}/financing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: { languages: { en: `${BASE_URL}/financing`, es: `${BASE_URL}/es/financiamiento` } },
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: { languages: { en: `${BASE_URL}/contact`, es: `${BASE_URL}/es/contacto` } },
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
      alternates: { languages: { en: `${BASE_URL}/blog`, es: `${BASE_URL}/es/blog` } },
    },
  ]

  // Vehicle + blog pages from Firestore REST API (no client SDK needed on server)
  let vehiclePages: MetadataRoute.Sitemap = []
  let blogPages: MetadataRoute.Sitemap = []

  interface FirestoreDocument {
    document?: {
      fields: Record<string, { stringValue?: string; booleanValue?: boolean }>
    }
  }

  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY

    // Fetch published vehicles
    const vehiclesRes = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'inventory' }],
            where: {
              compositeFilter: {
                op: 'AND',
                filters: [
                  { fieldFilter: { field: { fieldPath: 'isPublished' }, op: 'EQUAL', value: { booleanValue: true } } },
                  { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'available' } } },
                ],
              },
            },
            select: { fields: [{ fieldPath: 'slug' }, { fieldPath: 'isFeatured' }, { fieldPath: 'updatedAt' }] },
          },
        }),
        next: { revalidate: 3600 },
      }
    )

    if (vehiclesRes.ok) {
      const vehiclesData = await vehiclesRes.json()
      vehiclePages = (vehiclesData as FirestoreDocument[])
        .filter((item) => item.document?.fields?.slug?.stringValue)
        .map((item) => {
          const fields = item.document!.fields
          const slug = fields.slug?.stringValue
          const isFeatured = fields.isFeatured?.booleanValue ?? false
          return {
            url: `${BASE_URL}/inventory/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: isFeatured ? 0.8 : 0.7,
            alternates: {
              languages: {
                en: `${BASE_URL}/inventory/${slug}`,
                es: `${BASE_URL}/es/inventario/${slug}`,
              },
            },
          }
        })
    }

    // Fetch published blog posts
    const blogRes = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'blog' }],
            where: {
              fieldFilter: { field: { fieldPath: 'isPublished' }, op: 'EQUAL', value: { booleanValue: true } },
            },
            select: { fields: [{ fieldPath: 'slug' }, { fieldPath: 'updatedAt' }] },
          },
        }),
        next: { revalidate: 3600 },
      }
    )

    if (blogRes.ok) {
      const blogData = await blogRes.json()
      blogPages = (blogData as FirestoreDocument[])
        .filter((item) => item.document?.fields?.slug?.stringValue)
        .map((item) => {
          const slug = item.document!.fields.slug?.stringValue
          return {
            url: `${BASE_URL}/blog/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
            alternates: {
              languages: {
                en: `${BASE_URL}/blog/${slug}`,
                es: `${BASE_URL}/es/blog/${slug}`,
              },
            },
          }
        })
    }
  } catch (err) {
    console.error('[sitemap] Failed to fetch dynamic pages:', err)
  }

  return [...staticPages, ...vehiclePages, ...blogPages]
}