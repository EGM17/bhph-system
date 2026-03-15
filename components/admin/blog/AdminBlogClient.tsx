'use client'

import { useState } from 'react'
import { Pencil, Trash2, Globe, EyeOff } from 'lucide-react'
import type { BlogPost } from '@/types'

interface AdminBlogClientProps {
  posts: BlogPost[]
}

export default function AdminBlogClient({ posts: initial }: AdminBlogClientProps) {
  const [posts, setPosts] = useState(initial)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
      setPosts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete post.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {posts.length === 0 ? (
        <p className="text-sm text-gray-400 p-8 text-center">
          No blog posts yet. Create your first one.
        </p>
      ) : (
        <div className="divide-y divide-gray-50">
          {posts.map((post) => {
            const title = post.title?.en ?? 'Untitled'
            return (
              <div
                key={post.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-gray-900 truncate">{title}</p>
                    {post.isPublished ? (
                      <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" aria-label="Published" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-gray-400 shrink-0" aria-label="Draft" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {post.isPublished ? 'Published' : 'Draft'} ·{' '}
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {post.isPublished && (
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      aria-label={`View "${title}" on site`}
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                  <a
                    href={`/admin/blog/${post.id}`}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    aria-label={`Edit "${title}"`}
                  >
                    <Pencil className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(post.id, title)}
                    disabled={deletingId === post.id}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    aria-label={`Delete "${title}"`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
