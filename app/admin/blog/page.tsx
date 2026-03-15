import { getAllPostsAdmin } from '@/services/blogService'
import AdminBlogClient from '@/components/admin/blog/AdminBlogClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Blog' }

export default async function AdminBlogPage() {
  const posts = await getAllPostsAdmin().catch(() => [])

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Blog</h2>
          <p className="text-sm text-gray-500 mt-0.5">{posts.length} total posts</p>
        </div>
        <a href="/admin/blog/new" className="btn-primary text-sm">
          + New post
        </a>
      </div>
      <AdminBlogClient posts={posts} />
    </div>
  )
}

export const revalidate = 0
