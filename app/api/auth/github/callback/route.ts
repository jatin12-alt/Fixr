import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { githubTokens, users } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  // 🔥 ENVIRONMENT HARD-CHECK
  console.log("🔥 ENVIRONMENT CHECK:", {
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? "EXISTS" : "MISSING",
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ? "EXISTS" : "MISSING", 
    DATABASE_URL: process.env.DATABASE_URL ? "EXISTS" : "MISSING",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "DEFAULTING"
  });
  
  try {
    const { userId } = await getAuth(request)
    console.log("DEBUG: Auth UserId:", userId)
    
    if (!userId) {
      console.log("OAuth callback: No userId - redirecting to sign-in")
      return NextResponse.redirect(`${appUrl}/sign-in`)
    }

    const code = request.nextUrl.searchParams.get('code')
    const state = request.nextUrl.searchParams.get('state')
    const storedState = request.cookies.get('github_oauth_state')?.value
    
    console.log("OAuth callback: Received Code:", code ? "Yes" : "No")
    console.log("OAuth callback: State verification:", { state, storedState, match: state === storedState })

    if (state !== storedState) {
      console.error("OAuth callback: State mismatch")
      const response = NextResponse.redirect(`${appUrl}/repos?error=state_mismatch`)
      response.cookies.delete('github_oauth_state')
      return response
    }

    console.log("OAuth callback: Exchanging code for token...")
    
    // Exchange code for token
    const tokenResponse = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${appUrl}/api/auth/github/callback`,
        }),
      }
    )

    const tokenData = await tokenResponse.json()
    console.log("OAuth callback: Token exchange response:", {
      error: tokenData.error,
      hasAccessToken: !!tokenData.access_token,
      tokenType: tokenData.token_type,
      scope: tokenData.scope
    })
    
    if (tokenData.error || !tokenData.access_token) {
      console.error('GitHub token error:', tokenData)
      const response = NextResponse.redirect(`${appUrl}/repos?error=token_failed`)
      response.cookies.delete('github_oauth_state')
      return response
    }

    const accessToken = tokenData.access_token
    console.log("OAuth callback: AccessToken received:", !!accessToken)

    // Get GitHub user info
    console.log("OAuth callback: Fetching GitHub user info...")
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })
    const githubUser = await userResponse.json()
    console.log("OAuth callback: GitHub user:", {
      login: githubUser.login,
      id: githubUser.id,
      name: githubUser.name
    })

    console.log("OAuth callback: Attempting to save to DB for userId:", userId)
    
    // 🔥 USER SYNC: Ensure user exists in DB before token insertion
    console.log("🔥 CHECKING_USER_EXISTS:", { userId })
    const existingUser = await db.select().from(users).where(eq(users.authId, userId)).limit(1)
    
    if (existingUser.length === 0) {
      console.log("🔥 USER_NOT_FOUND: Creating user record first")
      const githubUsername = githubUser.login || 'unknown'
      
      const userEmail = githubUser.email || `${githubUsername}@github.com`
      const userName = githubUser.name || githubUsername
      
      await db.insert(users).values({ 
        authId: userId, 
        email: userEmail,
        name: userName,
        githubUsername: githubUsername
      }).returning()
      
      console.log("🔥 USER_CREATED: User synced to DB successfully")
    } else {
      console.log("🔥 USER_EXISTS: User record found, ID:", existingUser[0].id)
    }
    
    // � DATA_BEFORE_SAVE: Critical validation
    console.log("🔍 DATA_BEFORE_SAVE:", { 
      userId, 
      accessToken: !!accessToken, 
      accessTokenLength: accessToken?.length,
      githubUsername: githubUser.login 
    });
    
    // DEBUG: Test database connection first
    try {
      console.log("DEBUG: Testing DB connection...")
      const testQuery = await db.select().from(githubTokens).limit(1)
      console.log("DEBUG: DB connection successful, found", testQuery.length, "existing tokens")
    } catch (dbError) {
      console.error("DEBUG: DB connection failed:", dbError)
      throw new Error(`Database connection failed: ${dbError instanceof Error ? dbError.message : 'Unknown DB error'}`)
    }
    
    // Save or update token in DB
    const existing = await db
      .select()
      .from(githubTokens)
      .where(eq(githubTokens.userId, userId))
      .limit(1)

    console.log("OAuth callback: Existing tokens found:", existing.length)

    if (existing.length > 0) {
      console.log("OAuth callback: Updating existing token, ID:", existing[0].id)
      console.log("🔥 ABOUT_TO_UPDATE:", { userId, hasToken: !!accessToken, scope: 'repo read:user' })
      
      const updateResult = await db
        .update(githubTokens)
        .set({
          encryptedToken: accessToken,
          scope: 'repo read:user',
          lastUsed: new Date(),
        })
        .where(eq(githubTokens.userId, userId))
      
      console.log("OAuth callback: Update completed")
    } else {
      console.log("OAuth callback: Creating new token")
      console.log("🔥 ABOUT_TO_INSERT:", { userId, hasToken: !!accessToken, scope: 'repo read:user' })
      
      const insertResult = await db.insert(githubTokens).values({
        userId,
        encryptedToken: accessToken,
        scope: 'repo read:user',
      }).returning()
      
      console.log("OAuth callback: Insert completed, new ID:", insertResult[0]?.id)
    }

    console.log("OAuth callback: Token saved successfully, redirecting to /repos")
    
    // Small delay to ensure DB write is complete
    await new Promise(resolve => setTimeout(resolve, 100))

    const response = NextResponse.redirect(`${appUrl}/repos`)
    response.cookies.delete('github_oauth_state')
    return response
  } catch (error) {
  console.error("🔥 OAUTH_ERROR:", error instanceof Error ? error.message : 'Unknown error');
  const response = NextResponse.redirect(`${appUrl}/repos?error=${encodeURIComponent(error instanceof Error ? error.message : 'unknown')}`)
  response.cookies.delete('github_oauth_state')
  return response
}
}
