import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fixr.vercel.app'
  
  // Static pages with proper priorities and change frequencies
  const staticPages = [
    {
      route: '',
      priority: 1.0,
      changefreq: 'daily' as const
    },
    {
      route: '/pricing',
      priority: 0.8,
      changefreq: 'monthly' as const
    },
    {
      route: '/blog',
      priority: 0.7,
      changefreq: 'weekly' as const
    },
    {
      route: '/help',
      priority: 0.6,
      changefreq: 'monthly' as const
    },
    {
      route: '/contact',
      priority: 0.5,
      changefreq: 'yearly' as const
    },
    {
      route: '/about',
      priority: 0.5,
      changefreq: 'yearly' as const
    },
    {
      route: '/status',
      priority: 0.4,
      changefreq: 'hourly' as const
    },
    {
      route: '/privacy',
      priority: 0.3,
      changefreq: 'yearly' as const
    },
    {
      route: '/terms',
      priority: 0.3,
      changefreq: 'yearly' as const
    },
    {
      route: '/security',
      priority: 0.3,
      changefreq: 'yearly' as const
    },
    {
      route: '/cookies',
      priority: 0.3,
      changefreq: 'yearly' as const
    }
  ].map((page) => ({
    url: `${baseUrl}${page.route}`,
    lastModified: new Date(),
    changeFrequency: page.changefreq,
    priority: page.priority
  }))
  
  // Blog posts
  let blogPosts: MetadataRoute.Sitemap = []
  try {
    const posts = getAllPosts()
    blogPosts = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.log('Could not fetch blog posts for sitemap')
  }
  
  return [...staticPages, ...blogPosts]
}
