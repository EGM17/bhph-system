import { getTranslations } from 'next-intl/server'
import { getPublishedPosts } from '@/services/blogService'
import PublicLayout from '@/components/public/layout/PublicLayout'
import Image from 'next/image'
import type { Metadata } from 'next'
import type { BlogPost } from '@/types'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const isEs = locale === 'es'
  return {
    title: isEs ? 'Blog - Consejos para Comprar Auto' : 'Blog - Car Buying Tips Salem Oregon',
    description: isEs
      ? 'Consejos, noticias y guías para comprar tu próximo auto en Salem, Oregon.'
      : 'Tips, news and guides for buying your next car in Salem, Oregon.',
    alternates: {
      canonical: isEs
        ? 'https://elcompagueroautosales.com/es/blog'
        : 'https://elcompagueroautosales.com/blog',
      languages: {
        en: 'https://elcompagueroautosales.com/blog',
        es: 'https://elcompagueroautosales.com/es/blog',
      },
    },
  }
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })
  const isEs = locale === 'es'

  let posts: BlogPost[] = []
  try {
    posts = await getPublishedPosts()
  } catch {
    posts = []
  }

  return (
    <PublicLayout>
      {/* Header */}
      <div className="bg-blue-600 text-white py-12">
        <div className="container-section text-center">
          <h1 className="text-4xl font-bold mb-3 text-white">{t('title')}</h1>
          <p className="text-white/90 text-lg max-w-xl mx-auto">{t('subtitle')}</p>
        </div>
      </div>

      <div className="container-section py-16">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No posts published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const title = isEs ? post.title.es : post.title.en
              const excerpt = isEs ? post.excerpt.es : post.excerpt.en
              const href = isEs ? `/es/blog/${post.slug}` : `/blog/${post.slug}`

              return (
                <a
                  key={post.id}
                  href={href}
                  className="card-vehicle block group"
                  aria-label={`Read: ${title}`}
                >
                  {post.coverImage ? (
                    <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                      <Image
                        src={post.coverImage}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                      <span className="text-blue-300 text-4xl font-bold">
                        {title.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div className="p-5">
                    <p className="text-xs text-gray-400 mb-2">
                      {new Date(post.createdAt).toLocaleDateString(
                        isEs ? 'es-MX' : 'en-US',
                        { year: 'numeric', month: 'long', day: 'numeric' }
                      )}
                    </p>
                    <h2 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {title}
                    </h2>
                    {excerpt && (
                      <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                        {excerpt}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 mt-3">
                      {t('readMore')} →
                    </span>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>
    </PublicLayout>
  )
}

export const revalidate = 300