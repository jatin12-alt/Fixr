export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fixr.vercel.app'

  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /dashboard/',
    'Disallow: /api/',
    'Disallow: /sign-in',
    'Disallow: /sign-up',
    'Disallow: /invite/',
    'Disallow: /admin/',
    'Disallow: /_next/',
    'Disallow: /static/',
    'Disallow: /favicon.ico',
    'Disallow: /og-image.png',
    '',
    'User-agent: GPTBot',
    'Disallow: /',
    '',
    'User-agent: ChatGPT-User',
    'Disallow: /',
    '',
    'User-agent: CCBot',
    'Disallow: /',
    '',
    'User-agent: anthropic-ai',
    'Disallow: /',
    '',
    'User-agent: Claude-Web',
    'Disallow: /',
    '',
    `Sitemap: ${baseUrl}/sitemap.xml`,
    `Host: ${baseUrl}`,
  ].join('\n')

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
