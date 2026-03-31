import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/repos',
  '/teams',
  '/analytics',
  '/notifications',
  '/settings'
]

// Routes that should only be accessible when NOT authenticated
const authStatusRoutes = [
  '/sign-in',
  '/sign-up'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('firebase_token')?.value

  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Check if it's an auth status route (sign-in/sign-up)
  const isAuthStatusRoute = authStatusRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute && !token) {
    // Redirect to sign-in if no token and trying to access a protected route
    const url = new URL('/sign-in', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthStatusRoute && token) {
    // Redirect to dashboard if logged in and trying to access sign-in/sign-up
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Pattern to include/exclude routes
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
