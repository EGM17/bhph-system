import CategoriesClient from '@/components/admin/blog/CategoriesClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Blog Categories' }

export default function BlogCategoriesPage() {
  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Blog Categories</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage categories for your blog posts — bilingual names.</p>
      </div>
      <CategoriesClient />
    </div>
  )
}