import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { userId } = await getAuth(req)
  
  if (!userId) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return NextResponse.redirect(`${appUrl}/sign-in`)
  }

  const clientId = process.env.GITHUB_CLIENT_ID
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const redirectUri = `${appUrl}/api/auth/github/callback` 
  const scope = 'repo read:user'
  const state = Math.random().toString(36).substring(7)
  
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}` 
  
  const response = NextResponse.redirect(githubUrl)
  
  // Store state in cookie for callback verification
  response.cookies.set('github_oauth_state', state, {
    path: '/',
    maxAge: 60 * 10, // 10 minutes
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  return response
}
