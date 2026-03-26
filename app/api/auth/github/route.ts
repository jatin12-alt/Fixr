import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const redirectUri = `${appUrl}/api/auth/github/callback` 
  const scope = 'repo read:user'
  const state = Math.random().toString(36).substring(7)
  
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}` 
  
  return NextResponse.redirect(githubUrl)
}
