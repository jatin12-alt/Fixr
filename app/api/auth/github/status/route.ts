import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { db, users, githubTokens } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const { userId, error } = await getAuth(req)
    
    console.log("Status check for user:", userId, "Error:", error)
    
    if (!userId) {
      console.log("Status check: No userId found, error:", error)
      return NextResponse.json({ 
        error: error || 'Unauthorized', 
        connected: false,
        debug: { userId, error }
      }, { status: 401 })
    }

    console.log("Status check: Querying githubTokens for userId:", userId)
    
    // Check if user has GitHub tokens
    const userTokens = await db
      .select()
      .from(githubTokens)
      .where(eq(githubTokens.userId, userId))
      .limit(1)

    console.log("Status check: Found tokens:", userTokens.length, "records")

    // Get user info for GitHub username
    const userInfo = await db
      .select()
      .from(users)
      .where(eq(users.authId, userId))
      .limit(1)

    console.log("Status check: User info:", userInfo.length, "records")

    const connected = userTokens.length > 0 && !!userTokens[0].encryptedToken
    const githubUsername = userInfo.length > 0 ? userInfo[0].githubUsername : undefined

    console.log("Status check: Final result:", { connected, githubUsername })

    return NextResponse.json({
      connected,
      githubUsername,
      debug: { userId, tokenCount: userTokens.length }
    })
  } catch (error) {
    console.error('GitHub status error:', error)
    return NextResponse.json({ 
      error: 'Failed to check GitHub status',
      connected: false,
      debug: { error: error instanceof Error ? error.message : 'Unknown error' }
    }, { status: 500 })
  }
}
