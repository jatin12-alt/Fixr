import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Sentinel Edge Middleware
 * Validates session residency and manages navigational logic.
 */
export function middleware(req: NextRequest) {
  const token = req.cookies.get('firebase_token')?.value
  const { pathname } = req.nextUrl

  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')
  const isProtectedPage = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/teams') || 
                          pathname.startsWith('/analytics')

  // 1. Guard Protected Routes
  if (isProtectedPage && !token) {
    const url = new URL('/sign-in', req.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // 2. Prevent Re-Authentication
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
