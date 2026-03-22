import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, users } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { GitHubTokenService } from '@/lib/services/github-tokens'

export async function GET(req: NextRequest) {
  const { userId } = auth()
  
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Handle OAuth errors
  if (error) {
    console.error('GitHub OAuth error:', error)
    return NextResponse.redirect(new URL('/dashboard?error=github_auth_failed', req.url))
  }

  // Verify state matches user ID for security
  if (!code || state !== userId) {
    return NextResponse.redirect(new URL('/dashboard?error=invalid_oauth_state', req.url))
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()
    
    if (tokenData.error) {
      console.error('Token exchange error:', tokenData)
      return NextResponse.redirect(new URL('/dashboard?error=token_exchange_failed', req.url))
    }

    if (tokenData.access_token) {
      // Store token securely in database
      await GitHubTokenService.storeToken(
        userId,
        tokenData.access_token,
        tokenData.scope || 'repo,workflow,admin:repo_hook'
      )

      // Get GitHub user info
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${tokenData.access_token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })
      
      const githubUser = await userResponse.json()

      // Fetch Clerk user to get their email
      const { currentUser } = await import('@clerk/nextjs/server')
      const clerkUser = await currentUser()
      const email = clerkUser?.primaryEmailAddress?.emailAddress || 
                    clerkUser?.emailAddresses?.[0]?.emailAddress || 
                    'unknown@example.com'

      // Upsert user in database with GitHub info
      await db
        .insert(users)
        .values({
          clerkId: userId,
          email: email,
          githubUsername: githubUser.login,
        })
        .onConflictDoUpdate({
          target: users.clerkId,
          set: { githubUsername: githubUser.login },
        })

      // Redirect without storing in cookie
      return NextResponse.redirect(new URL('/repos', req.url))
    }

    return NextResponse.redirect(new URL('/dashboard?error=no_access_token', req.url))
  } catch (error) {
    console.error('GitHub OAuth callback error:', error)
    return NextResponse.redirect(new URL('/dashboard?error=oauth_callback_failed', req.url))
  }
}
