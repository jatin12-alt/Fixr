import { NextRequest, NextResponse } from 'next/server'

// Production URL configuration helper
export function getBaseUrl(req?: NextRequest): string {
  // For production, use the deployed URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // For production with custom domain
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  
  // For development or when request is available
  if (req) {
    const protocol = req.headers.get('x-forwarded-proto') || 'http'
    const host = req.headers.get('host') || 'localhost:3000'
    return `${protocol}://${host}`
  }
  
  // Fallback to localhost for development
  return 'http://localhost:3000'
}

// GitHub webhook URL generator
export function getGitHubWebhookUrl(req?: NextRequest): string {
  const baseUrl = getBaseUrl(req)
  return `${baseUrl}/api/webhook/github`
}

// GitHub OAuth callback URL generator
export function getGitHubCallbackUrl(req?: NextRequest): string {
  const baseUrl = getBaseUrl(req)
  return `${baseUrl}/api/webhook/github/callback`
}

// Email verification URL generator
export function getEmailVerificationUrl(token: string, req?: NextRequest): string {
  const baseUrl = getBaseUrl(req)
  return `${baseUrl}/verify-email?token=${token}`
}

// Team invite URL generator
export function getTeamInviteUrl(token: string, req?: NextRequest): string {
  const baseUrl = getBaseUrl(req)
  return `${baseUrl}/invite?token=${token}`
}
