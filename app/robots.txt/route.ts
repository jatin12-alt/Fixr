import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fixr.vercel.app'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/sign-in',
          '/sign-up',
          '/invite/',
          '/admin/',
          '/_next/',
          '/static/',
          '/favicon.ico',
          '/og-image.png'
        ]
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/']
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: ['/']
      },
      {
        userAgent: 'CCBot',
        disallow: ['/']
      },
      {
        userAgent: 'anthropic-ai',
        disallow: ['/']
      },
      {
        userAgent: 'Claude-Web',
        disallow: ['/']
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  }
}
