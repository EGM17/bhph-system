import { getPostById } from '@/services/blogService'
import BlogFormClient from '@/components/admin/blog/BlogFormClient'
import type { Metadata } from 'next'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return { title: id === 'new' ? 'New Post' : 'Edit Post' }
}

export default async function BlogFormPage({ params }: Props) {
  const { id } = await params
  const isNew = id === 'new'
  const post = isNew ? null : await getPostById(id).catch(() => null)

  return (
    <div className="max-w-3xl space-y-5">
      <a
        href="/admin/blog"
        className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
      >
        ← Back to blog
      </a>
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          {isNew ? 'New blog post' : 'Edit blog post'}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Write content in both English and Spanish for bilingual SEO indexing.
        </p>
      </div>
      <BlogFormClient post={post} isNew={isNew} />
    </div>
  )
}
