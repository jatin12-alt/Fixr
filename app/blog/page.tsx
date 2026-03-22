import Link from 'next/link'
import Image from 'next/image'
import { BlogPost, getAllPosts, getAllTags } from '@/lib/blog'
import { Clock, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Blog — Fixr',
  description: 'Insights on CI/CD, DevOps automation, and AI-powered development.',
}

export default function BlogIndex() {
  const posts = getAllPosts()
  const tags = getAllTags()

  return (
    <div className="min-h-screen bg-black text-gray-300 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Fixr Blog</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Insights on CI/CD, DevOps automation, and AI-powered development.
          </p>
        </div>

        {/* Tags Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tags.map((tag) => (
            <button
              key={tag}
              className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-full text-sm text-gray-400 hover:text-white hover:border-cyan-500 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {posts.map((post, index) => (
            <BlogCard key={post.slug} post={post} featured={index === 0} />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No blog posts yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}

function BlogCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <article
      className={`group bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-colors ${
        featured ? 'md:col-span-2' : ''
      }`}
    >
      <Link href={`/blog/${post.slug}`}>
        <div className={`relative ${featured ? 'h-64' : 'h-48'} bg-gray-800`}>
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <span className="text-6xl">🚀</span>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <h2 className={`font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors ${
            featured ? 'text-3xl' : 'text-xl'
          }`}>
            {post.title}
          </h2>

          <p className="text-gray-400 mb-4 line-clamp-2">{post.excerpt}</p>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>{post.author}</span>
              <span>•</span>
              <span>{new Date(post.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {post.readingTime}
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
