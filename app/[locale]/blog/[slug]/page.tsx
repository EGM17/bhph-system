import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getPostBySlug } from '@/services/blogService'
import PublicLayout from '@/components/public/layout/PublicLayout'
import Image from 'next/image'
import Script from 'next/script'
import type { Metadata } from 'next'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Post not found' }

  const isEs = locale === 'es'
  const title = isEs ? post.title.es : post.title.en
  const excerpt = isEs ? post.excerpt.es : post.excerpt.en
  const canonical = isEs
    ? `https://elcompagueroautosales.com/es/blog/${slug}`
    : `https://elcompagueroautosales.com/blog/${slug}`

  return {
    title,
    description: excerpt,
    alternates: {
      canonical,
      languages: {
        en: `https://elcompagueroautosales.com/blog/${slug}`,
        es: `https://elcompagueroautosales.com/es/blog/${slug}`,
      },
    },
    openGraph: {
      title,
      description: excerpt ?? '',
      url: canonical,
      type: 'article',
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      images: post.coverImage ? [{ url: post.coverImage, alt: title }] : [],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })
  const isEs = locale === 'es'

  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const title = isEs ? post.title.es : post.title.en
  const content = isEs ? post.content.es : post.content.en

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: isEs ? post.excerpt.es : post.excerpt.en,
    image: post.coverImage ?? undefined,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Organization',
      name: 'El Compa Guero Auto Sales',
      url: 'https://elcompagueroautosales.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'El Compa Guero Auto Sales',
      logo: {
        '@type': 'ImageObject',
        url: 'https://elcompagueroautosales.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://elcompagueroautosales.com${isEs ? '/es' : ''}/blog/${slug}`,
    },
  }

  return (
    <PublicLayout>
      <Script
        id={`schema-article-${post.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <article className="container-section py-12 max-w-3xl">
        {/* Back link */}
        <a
          href={isEs ? '/es/blog' : '/blog'}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-8"
        >
          ← {t('backToBlog')}
        </a>

        {/* Cover image */}
        {post.coverImage && (
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8 bg-gray-100">
            <Image
              src={post.coverImage}
              alt={title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        {/* Meta */}
        <div className="mb-6">
          <time
            dateTime={post.createdAt}
            className="text-sm text-gray-400"
          >
            {new Date(post.createdAt).toLocaleDateString(
              isEs ? 'es-MX' : 'en-US',
              { year: 'numeric', month: 'long', day: 'numeric' }
            )}
          </time>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 leading-tight">
            {title}
          </h1>
        </div>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-blue-600 prose-strong:text-gray-900"
          dangerouslySetInnerHTML={{ __html: content ?? '' }}
        />

        {/* CTA */}
        <div className="mt-12 bg-blue-50 rounded-2xl p-6 text-center">
          <p className="text-lg font-semibold text-gray-900 mb-2">
            {isEs ? '¿Listo para encontrar tu próximo auto?' : 'Ready to find your next car?'}
          </p>
          <p className="text-gray-600 mb-4">
            {isEs
              ? 'Visita nuestro inventario o contáctanos hoy.'
              : 'Browse our inventory or contact us today.'}
          </p>
          <a href={isEs ? '/es/inventario' : '/inventory'} className="btn-primary">
            {isEs ? 'Ver inventario' : 'View inventory'}
          </a>
        </div>
      </article>
    </PublicLayout>
  )
}

export const revalidate = 300
